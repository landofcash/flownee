# Testing Flownee

Flownee is available at
[flownee-build-week.netlify.app](https://flownee-build-week.netlify.app).
It requires no account, payment, invitation, API key, or preloaded user data.

## Recommended setup

- Use the public HTTPS deployment with a working internet connection.
- Allow microphone access when prompted.
- Current Chrome on Android or desktop is the primary path. Current Edge is
  secondary; Safari on iPhone is best effort.
- Use fictional information only. A private/incognito window or a fresh
  browser profile provides an isolated local data store.

The core journey normally takes about three to five minutes. AI wording and
task order may vary, but the behavioral expectations below should remain true.

## Core voice-to-plan journey

1. Open the public deployment. The home screen should load without signing in.
   On a clean browser it invites you to add an intention; on a returning
   browser it immediately shows the last locally saved recommendation without
   waiting for an AI request.
2. Select **Add by voice** and allow microphone access.
3. Speak this fictional example, then select **Stop and transcribe**:

   > Pay the electricity bill by Friday. Call Maria this evening; it should
   > take about ten minutes.

4. Review the editable transcript. Correct a word if desired, then select
   **Confirm and interpret**.
5. Review the interpreted intentions. Expect separate editable actions for the
   bill and the call, an AI-selected emoji for each, effort values, and any
   important assumptions or clarifications. Exact titles, estimates, ordering,
   and explanation wording may vary.
6. Edit one title or effort value to confirm that the interpretation remains
   under user control. Resolve any required clarification, then select
   **Add to my flow**.
7. Flownee should return automatically to the home screen. Confirm that:
   - one action is prominent under **Do this now**;
   - its effort and a concise **Why this makes sense** explanation are visible;
   - the remaining active intention appears under
     **Next items in your current flow**.

Confirmed content is saved locally before the plan replaces the previous valid
plan. If planning fails, use **Retry planning** or **Revise transcript**; the
confirmed transcript and previous plan should remain available.

## Task actions and automatic replanning

Use fictional items created by the test above.

1. Slide **Do later** on the current recommendation. The change should save
   locally, an updating overlay should appear, and another active item should
   become the recommendation.
2. Use **Restore for later** under **Postponed and completed items**. The item
   should return to the active flow and trigger one updated plan.
3. Slide **Done** on the current recommendation. After the saved change and
   replan finish, the completed item should appear under
   **Postponed and completed items**.
4. Open a task's three-dot management control. Change its title, notes, or
   effort and select **Save changes**. Confirm that the revised item remains in
   the flow.
5. Reopen the same management dialog, select **Delete**, then
   **Delete permanently**. Confirm that the item disappears and the remaining
   flow updates.

Task changes use a provisional local plan while GPT-5.6 replans. The previous
usable order remains visible instead of disappearing during processing.

## Persistence check

1. Leave at least one active or saved item in Flownee.
2. Reload the page. The stored recommendation should appear from local storage.
3. Close and reopen the browser or installed PWA. The same tasks, statuses, and
   recommendation should still be present in that browser profile.

Flownee is account-free and local-first. Data does not synchronize between
browsers, profiles, or devices.

## Delete-all check

Only perform this after completing the other checks because it permanently
removes the current browser profile's Flownee test data.

1. Open **Help** in the header and find **Privacy & data**.
2. Under **Delete all local Flownee data**, select **Delete local data**.
3. Select **Yes, delete everything**.
4. Confirm the message **All Flownee data stored in this browser was deleted.**
5. Return to Flownee home and verify the clean first-run state.

This clears local transcripts, tasks, plans, and revision metadata. It cannot
retract requests that OpenAI has already processed.

## Optional state previews

These fictional URL-driven previews demonstrate visual states without seeding
or changing local task data:

- [Sample plan](https://flownee-build-week.netlify.app/?demo=sample)
- [Updating flow](https://flownee-build-week.netlify.app/?demo=updating)
- [All complete](https://flownee-build-week.netlify.app/?demo=complete)
- [Loading saved flow](https://flownee-build-week.netlify.app/?demo=loading)

The sample is a read-only presentation: its task actions are intentionally
disabled. This prevents fictional preview data from being saved to IndexedDB,
triggering paid AI requests, or changing the judge's existing flow. Disabled
actions therefore indicate a safe presentation state, not a broken control.
The visible **Read-only preview** banner explains this state and provides a
**Try interactive Flownee** link to the normal home URL for the complete
interactive journey.

## Recovery and privacy expectations

- **Cancel while recording:** closes the capture and discards the temporary
  recording without uploading or creating a task.
- **Transcription error:** retains the temporary recording so the user can
  retry or record again.
- **Planning error:** preserves the confirmed transcript and previous valid
  plan, with retry and revision controls.
- **Offline:** locally stored tasks and the last plan remain available; voice
  transcription and AI planning require the network.
- **Permission denied or unsupported recording:** Flownee explains that voice
  capture is unavailable. The fictional previews remain available.
- **Privacy:** audio is sent to OpenAI only after recording stops. Flownee does
  not retain audio after successful transcription. Confirmed transcripts,
  tasks, statuses, and plans stay in the current browser's IndexedDB.

## Verified physical-device evidence

The product owner completed the public voice/AI journey, task actions,
individual editing/deletion, delete-all, reload, and reopen checks on:

- Redmi Note 12 Pro 5G in installed-app mode and current Chrome and Firefox.
- iPhone 17, iPhone 12, and iPhone 8 in current Safari, Chrome, and Firefox.

Exact OS/browser versions and per-browser MIME diagnostics were not captured.
Flownee is submitted as a standards-based responsive web application and PWA,
with no proprietary hardware or special platform-specific installation
requirements. The team confirmed final acceptance on every platform it intends
to represent; detailed measured evidence and its limits are documented in
[`docs/technical/PLATFORM_TEST_MATRIX.md`](docs/technical/PLATFORM_TEST_MATRIX.md).
