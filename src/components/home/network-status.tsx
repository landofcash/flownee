"use client";

import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-950"
      role="status"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-sm">
        <CloudOff aria-hidden="true" className="size-4 shrink-0" />
        <span>
          You’re offline. Your saved flow is still here; voice processing will
          resume when you reconnect.
        </span>
      </div>
    </div>
  );
}
