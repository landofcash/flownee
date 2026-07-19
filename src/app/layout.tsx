import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Flownee",
  title: {
    default: "Flownee",
    template: "%s · Flownee",
  },
  description:
    "A calm, voice-first assistant that helps you decide what to do now.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flownee",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#287344",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
