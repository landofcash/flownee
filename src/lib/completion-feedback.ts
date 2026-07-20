import type { TaskStatus } from "@/lib/storage/schema";

export class CompletionCelebrationQueue {
  private pending = false;

  queue() {
    this.pending = true;
  }

  release() {
    if (!this.pending) return false;
    this.pending = false;
    return true;
  }
}

export function shouldCelebrateTaskStatus(status: TaskStatus) {
  return status === "completed";
}

export async function persistWithCompletionFeedback<T>({
  persist,
  load,
  celebrate,
  onStoredCompletion,
}: {
  persist: () => Promise<unknown>;
  load: () => Promise<T>;
  celebrate: boolean;
  onStoredCompletion: () => void;
}) {
  await persist();
  const value = await load();
  if (celebrate) onStoredCompletion();
  return value;
}
