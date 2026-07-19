import type { Metadata } from "next";

import { AudioFormatProbe } from "@/components/diagnostics/audio-format-probe";

export const metadata: Metadata = {
  title: "Recording diagnostic",
  robots: { index: false, follow: false },
};

export default function RecordingDiagnosticPage() {
  return <AudioFormatProbe />;
}
