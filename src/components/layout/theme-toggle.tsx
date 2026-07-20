"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  FLOWNEE_THEME_STORAGE_KEY,
  isFlowneeTheme,
  oppositeFlowneeTheme,
  resolveFlowneeTheme,
  type FlowneeTheme,
} from "@/lib/theme";

const THEME_CHANGE_EVENT = "flownee-theme-change";

function applyTheme(theme: FlowneeTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function storedTheme() {
  try {
    return window.localStorage.getItem(FLOWNEE_THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function currentTheme(): FlowneeTheme {
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";

  return resolveFlowneeTheme(
    storedTheme(),
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
}

function subscribeToTheme(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === FLOWNEE_THEME_STORAGE_KEY &&
      isFlowneeTheme(event.newValue)
    ) {
      applyTheme(event.newValue);
      onStoreChange();
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useFlowneeTheme() {
  return useSyncExternalStore(
    subscribeToTheme,
    currentTheme,
    (): FlowneeTheme => "light",
  );
}

export function setFlowneeTheme(theme: FlowneeTheme) {
  applyTheme(theme);
  try {
    window.localStorage.setItem(FLOWNEE_THEME_STORAGE_KEY, theme);
  } catch {
    // The active page still changes theme when storage is unavailable.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useFlowneeTheme();
  const targetTheme = oppositeFlowneeTheme(theme);
  const label = `Switch to ${targetTheme} mode`;

  function handleToggle() {
    setFlowneeTheme(oppositeFlowneeTheme(theme));
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label={label}
      title={label}
      onClick={handleToggle}
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </Button>
  );
}
