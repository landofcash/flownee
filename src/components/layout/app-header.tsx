import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { HeaderNavigation } from "@/components/layout/header-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  actions?: ReactNode;
  contentClassName?: string;
};

export function AppHeader({ actions, contentClassName }: AppHeaderProps) {
  return (
    <header className="border-b border-border/70 bg-surface/85 backdrop-blur-lg">
      <div
        className={cn(
          "mx-auto flex h-16 items-center justify-between gap-1 px-3 min-[360px]:px-4 sm:px-6",
          contentClassName,
        )}
      >
        <Link
          href="/"
          aria-label="Flownee home"
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src="/flownee-mark-v2.png"
            alt=""
            aria-hidden="true"
            width={60}
            height={17}
            priority
            className="h-auto w-15 shrink-0"
          />
          <span className="text-lg font-semibold tracking-[-0.025em]">
            Flownee
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          <HeaderNavigation />
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
