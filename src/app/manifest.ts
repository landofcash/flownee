import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flownee — What makes sense next",
    short_name: "Flownee",
    description:
      "A calm, voice-first assistant for everyday intentions and practical next actions.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf7",
    theme_color: "#287344",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
