import { describe, expect, it, vi } from "vitest";

import {
  AUDIO_MIME_CANDIDATES,
  describeRecordingError,
  inspectRecordingCapabilities,
} from "@/lib/audio/recording-capabilities";

describe("recording capabilities", () => {
  it("prefers Opus in WebM when the browser supports it", () => {
    const isTypeSupported = vi.fn(
      (mimeType: string) => mimeType === "audio/webm;codecs=opus",
    );

    const result = inspectRecordingCapabilities({
      isSecureContext: true,
      mediaDevices: { getUserMedia: vi.fn() },
      MediaRecorder: { isTypeSupported },
    });

    expect(result.preferredMimeType).toBe("audio/webm;codecs=opus");
    expect(isTypeSupported).toHaveBeenCalledTimes(AUDIO_MIME_CANDIDATES.length);
  });

  it("falls back in declared order and reports missing APIs", () => {
    const supported = inspectRecordingCapabilities({
      isSecureContext: true,
      mediaDevices: { getUserMedia: vi.fn() },
      MediaRecorder: {
        isTypeSupported: (mimeType) => mimeType === "audio/mp4",
      },
    });
    const unsupported = inspectRecordingCapabilities({
      isSecureContext: false,
    });

    expect(supported.preferredMimeType).toBe("audio/mp4");
    expect(unsupported).toMatchObject({
      isSecureContext: false,
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasMediaRecorder: false,
      preferredMimeType: null,
    });
  });

  it("turns permission failures into recovery guidance", () => {
    expect(
      describeRecordingError(new DOMException("Denied", "NotAllowedError")),
    ).toContain("site settings");
  });
});
