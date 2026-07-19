import { describe, expect, it, vi } from "vitest";

import {
  MAX_TRANSCRIPTION_BYTES,
  TranscriptionError,
  audioExtensionForMimeType,
  transcribeAudio,
  validateAudioFile,
} from "@/lib/server/transcription";

function audioFile(
  type = "audio/webm;codecs=opus",
  contents: BlobPart[] = [new Uint8Array([1, 2, 3])],
): File {
  return new File(contents, "capture.webm", { type });
}

describe("transcription server boundary", () => {
  it("normalizes supported recording MIME types", () => {
    expect(audioExtensionForMimeType("audio/webm;codecs=opus")).toBe("webm");
    expect(audioExtensionForMimeType("audio/mp4")).toBe("mp4");
    expect(audioExtensionForMimeType("audio/wav")).toBeNull();
  });

  it("rejects empty, oversized, and unsupported files before provider access", () => {
    expect(() => validateAudioFile(audioFile("audio/webm", []))).toThrow(
      "empty",
    );
    expect(() =>
      validateAudioFile(
        audioFile("audio/webm", [new Uint8Array(MAX_TRANSCRIPTION_BYTES + 1)]),
      ),
    ).toThrow("too large");
    expect(() => validateAudioFile(audioFile("audio/wav"))).toThrow(
      "not supported",
    );
  });

  it("sends a server-side multipart request and returns trimmed text", async () => {
    const providerFetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ text: "  Pay the electricity bill.  " }), {
        status: 200,
        headers: { "x-request-id": "req_test" },
      }),
    );

    const result = await transcribeAudio({
      apiKey: "test-key",
      fetchImplementation: providerFetch,
      file: audioFile(),
    });

    expect(result).toMatchObject({
      text: "Pay the electricity bill.",
      model: "gpt-4o-transcribe",
      providerRequestId: "req_test",
    });
    expect(providerFetch).toHaveBeenCalledOnce();

    const [, init] = providerFetch.mock.calls[0] ?? [];
    expect(init?.headers).toEqual({ Authorization: "Bearer test-key" });
    expect(init?.body).toBeInstanceOf(FormData);
    const providerBody = init?.body as FormData;
    expect(providerBody.get("model")).toBe("gpt-4o-transcribe");
    expect(providerBody.get("response_format")).toBe("json");
  });

  it("maps rate limits and network failures to safe retryable errors", async () => {
    await expect(
      transcribeAudio({
        apiKey: "test-key",
        fetchImplementation: vi.fn<typeof fetch>().mockResolvedValue(
          new Response("rate limited", { status: 429 }),
        ),
        file: audioFile(),
      }),
    ).rejects.toMatchObject<Partial<TranscriptionError>>({
      code: "TRANSCRIPTION_RATE_LIMITED",
      retryable: true,
    });

    await expect(
      transcribeAudio({
        apiKey: "test-key",
        fetchImplementation: vi.fn<typeof fetch>().mockRejectedValue(
          new TypeError("network details must not escape"),
        ),
        file: audioFile(),
      }),
    ).rejects.toMatchObject<Partial<TranscriptionError>>({
      code: "TRANSCRIPTION_UNAVAILABLE",
      retryable: true,
    });
  });
});
