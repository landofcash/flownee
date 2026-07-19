"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Mic, ShieldCheck, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  describeRecordingError,
  inspectCurrentBrowser,
  recordMicrophoneSample,
  type RecordingCapabilities,
  type RecordingSample,
} from "@/lib/audio/recording-capabilities";

type ProbeState =
  | { status: "idle" }
  | { status: "recording" }
  | { status: "passed"; sample: Omit<RecordingSample, "blob"> }
  | { status: "failed"; message: string };

function CapabilityValue({ supported }: { supported: boolean }) {
  return (
    <Badge variant={supported ? "secondary" : "outline"}>
      {supported ? "Available" : "Unavailable"}
    </Badge>
  );
}

export function AudioFormatProbe() {
  const [capabilities, setCapabilities] = useState<RecordingCapabilities | null>(
    null,
  );
  const [probe, setProbe] = useState<ProbeState>({ status: "idle" });
  const [browserIdentity, setBrowserIdentity] = useState<{
    platform: string;
    userAgent: string;
  } | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCapabilities(inspectCurrentBrowser());
      setBrowserIdentity({
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function runProbe() {
    setProbe({ status: "recording" });

    try {
      const sample = await recordMicrophoneSample();
      setProbe({
        status: "passed",
        sample: {
          requestedMimeType: sample.requestedMimeType,
          actualMimeType: sample.actualMimeType,
          durationMs: sample.durationMs,
          byteLength: sample.byteLength,
          audioTrackCount: sample.audioTrackCount,
        },
      });
    } catch (error) {
      setProbe({ status: "failed", message: describeRecordingError(error) });
    }
  }

  const ready =
    capabilities?.isSecureContext === true &&
    capabilities.hasGetUserMedia &&
    capabilities.hasMediaRecorder;

  return (
    <main className="mx-auto min-h-svh max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">Flownee diagnostic</Badge>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          Browser audio recording check
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          This page measures this browser and device. A three-second test stays
          in memory, is never uploaded, and is discarded after its metadata is
          reported.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Required browser APIs</CardTitle>
            <CardDescription>Measured in the current page context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["HTTPS or localhost", capabilities?.isSecureContext ?? false],
              ["Microphone access API", capabilities?.hasGetUserMedia ?? false],
              ["MediaRecorder API", capabilities?.hasMediaRecorder ?? false],
            ].map(([label, supported]) => (
              <div key={String(label)} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                <span className="text-sm font-medium">{label}</span>
                <CapabilityValue supported={Boolean(supported)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reported audio formats</CardTitle>
            <CardDescription>
              `MediaRecorder.isTypeSupported()` is a capability signal; the
              microphone test below proves that data is actually produced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              {capabilities?.mimeTypes.map((format) => (
                <div key={format.mimeType} className="flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0">
                  <code className="min-w-0 break-all text-xs">{format.mimeType}</code>
                  <Badge variant={format.supported ? "secondary" : "outline"}>
                    {format.supported ? "Yes" : "No"}
                  </Badge>
                </div>
              )) ?? <p className="p-4 text-sm text-muted-foreground">Checking…</p>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Preferred: <code>{capabilities?.preferredMimeType ?? "none"}</code>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5 gap-3 py-4">
        <CardHeader className="px-5">
          <CardTitle className="text-sm">Measured browser identity</CardTitle>
          <CardDescription className="break-words font-mono text-xs">
            {browserIdentity
              ? `${browserIdentity.platform} · ${browserIdentity.userAgent}`
              : "Checking…"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mt-5 border-primary/20">
        <CardHeader>
          <CardTitle>Three-second microphone proof</CardTitle>
          <CardDescription>
            The browser will ask for microphone permission. No audio leaves this
            device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button
            onClick={() => void runProbe()}
            disabled={!ready || probe.status === "recording"}
            size="lg"
          >
            {probe.status === "recording" ? (
              <Square aria-hidden="true" className="animate-pulse motion-reduce:animate-none" />
            ) : (
              <Mic aria-hidden="true" />
            )}
            {probe.status === "recording" ? "Recording…" : "Run microphone test"}
          </Button>

          {probe.status === "idle" && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Temporary local sample only
            </p>
          )}
          {probe.status === "passed" && (
            <div className="text-sm" role="status">
              <p className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Recording passed
              </p>
              <p className="mt-1 text-muted-foreground">
                {probe.sample.byteLength.toLocaleString()} bytes · {probe.sample.durationMs} ms · {probe.sample.actualMimeType || "browser default"} · {probe.sample.audioTrackCount} audio track
              </p>
            </div>
          )}
          {probe.status === "failed" && (
            <p className="flex items-start gap-2 text-sm text-destructive" role="alert">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {probe.message}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Record the browser version, operating system, preferred MIME type,
        actual Blob type, byte length, and pass/fail result in the compatibility
        matrix. A separate run is required on every supported device class.
      </p>
    </main>
  );
}
