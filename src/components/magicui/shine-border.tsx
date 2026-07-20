"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// Copyright (c) Magic UI. Adapted under the MIT License.
// Source: https://magicui.design/docs/components/shine-border
export interface ShineBorderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  animation?: "loop" | "once" | "repeat";
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
}

export function ShineBorder({
  animation = "loop",
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className,
  style,
  ...props
}: ShineBorderProps) {
  return (
    <div
      aria-hidden="true"
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent, transparent, ${
            Array.isArray(shineColor) ? shineColor.join(", ") : shineColor
          }, transparent, transparent)`,
          backgroundSize: "300% 300%",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] motion-reduce:hidden will-change-[background-position]",
        animation === "once" && "animate-flownee-shine-once",
        animation === "repeat" && "animate-flownee-shine-repeat",
        animation === "loop" && "motion-safe:animate-shine",
        className,
      )}
      {...props}
    />
  );
}
