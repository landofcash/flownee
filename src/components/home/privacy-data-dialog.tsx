"use client";

import { useState } from "react";
import { Database, Mic, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type PrivacyDataDialogProps = {
  busy: boolean;
  canDelete: boolean;
  errorMessage: string;
  onClose: () => void;
  onDeleteAll: () => void;
};

export function PrivacyDataDialog({
  busy,
  canDelete,
  errorMessage,
  onClose,
  onDeleteAll,
}: PrivacyDataDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/25 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <section
        aria-labelledby="privacy-title"
        aria-modal="true"
        className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl border bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:max-w-[430px] sm:rounded-2xl sm:p-6"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Privacy & data</p>
            <h2 id="privacy-title" className="mt-1 text-2xl font-semibold tracking-[-0.03em]">You stay in control.</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close privacy and data" onClick={onClose} disabled={busy}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-6 space-y-4 text-sm leading-6">
          <div className="flex gap-3 rounded-xl border bg-card p-4">
            <Database aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Stored in this browser</p>
              <p className="mt-1 text-muted-foreground">Confirmed transcripts, tasks, statuses, and execution plans are kept in this browser’s IndexedDB. Flownee has no user account or cloud task database.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border bg-card p-4">
            <Mic aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Sent for voice processing</p>
              <p className="mt-1 text-muted-foreground">Audio is sent to OpenAI only after you stop recording. Flownee keeps it temporarily for retry, then releases it after successful transcription or when you discard or close the capture.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border bg-card p-4">
            <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Sent for planning</p>
              <p className="mt-1 text-muted-foreground">After confirmation, the transcript and compact active-task list are sent for interpretation and planning. Later replans send active tasks only—not audio or completed history.</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border bg-secondary/45 p-4">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-muted-foreground">Repeated AI requests may be paused briefly to protect the public demo and its budget. Your locally saved flow remains available.</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-5">
          <h3 className="font-semibold">Delete all local Flownee data</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">This removes transcripts, tasks, plans, and revision metadata from this browser. It cannot retract requests already processed by OpenAI.</p>
          {errorMessage && <p className="mt-3 text-sm text-destructive" role="alert">{errorMessage}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {!confirmDelete ? (
              <Button variant="outline" onClick={() => setConfirmDelete(true)} disabled={busy || !canDelete}>
                <Trash2 aria-hidden="true" /> Delete local data
              </Button>
            ) : (
              <>
                <Button variant="destructive" onClick={onDeleteAll} disabled={busy}>
                  {busy ? "Deleting…" : "Yes, delete everything"}
                </Button>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>Keep my data</Button>
              </>
            )}
          </div>
          {!canDelete && <p className="mt-2 text-xs text-muted-foreground">The fictional preview does not contain local user data.</p>}
        </div>
      </section>
    </div>
  );
}
