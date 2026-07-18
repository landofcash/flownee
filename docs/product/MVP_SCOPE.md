# Flownee MVP Scope

## MVP objective

Deliver one polished, judge-testable journey that demonstrates Flownee's ability to capture spoken intentions incrementally and keep a practical **What to do now** flow current.

## Critical journey

1. User opens the public PWA without an account.
2. The last valid **Do this now** recommendation loads immediately from IndexedDB.
3. User taps the central microphone button.
4. User speaks one or multiple everyday intentions.
5. GPT-4o Transcribe returns an editable transcript.
6. User reviews and confirms the transcript.
7. GPT-5.6 extracts structured items and important assumptions.
8. User confirms or corrects the interpreted items.
9. Items are persisted locally.
10. GPT-5.6 returns an updated execution flow.
11. The home screen highlights one next action, its estimated effort, and a short reason.
12. User completes, postpones, edits, or deletes an item.
13. Flownee immediately updates the remaining flow.
14. State survives refresh, closing, and reopening.

## In scope

### Voice capture

- One-tap microphone access from the home screen.
- Start, stop, cancel, retry, and permission-denied states.
- Approximately 60–90 second maximum recording.
- Temporary local recording only until transcription succeeds or the user cancels.

### Transcript and interpretation

- GPT-4o Transcribe integration.
- Editable transcript before task interpretation.
- One or multiple tasks extracted from one recording.
- Review of extracted titles and critical details before saving.
- Clear treatment of estimates and assumptions.

### Task state

- Active, completed, and postponed states.
- Edit and delete controls.
- IndexedDB persistence.
- Delete-all-local-data control.

### Execution flow

- GPT-5.6 structured task extraction and planning.
- Immediate replan after a confirmed addition or material state change.
- One prominent **Do this now** action.
- Ordered **Up next** list.
- Short explanation for the next-action recommendation.
- Previous valid plan remains visible while updating.

### Product experience

- Responsive mobile-first interface.
- Installable PWA behavior where supported.
- Useful responsive browser experience without installation.
- Calm, friendly, non-judgmental language.
- Loading, empty, offline, unsupported-browser, permission-denied, transcription-error, and planning-error states.
- Fictional sample scenario for testing and demonstration.

### Supported platforms

| Platform | Browser | Commitment |
|---|---|---|
| Android | Current Chrome | Primary |
| Windows/macOS | Current Chrome | Primary |
| Windows | Current Edge | Secondary |
| iPhone/iPad | Current Safari | Best effort |

## Out of scope

- Keyboard or text-only capture.
- Accounts and authentication.
- Server-side user-task persistence.
- Multi-device synchronization.
- Calendar integration.
- Push notifications and reminders.
- Background listening or recording.
- Automatic routine learning.
- Location-aware recommendations.
- Shared lists and collaboration.
- Permanent audio storage.
- Offline transcription or offline planning.
- Mathematical schedule optimization.
- Native app-store distribution.

## Required states and recovery

| State | Required behavior |
|---|---|
| Empty | Invite the user to tell Flownee what is on their mind |
| Existing plan | Load immediately without an API request |
| Recording | Make active recording unmistakable; allow stop/cancel |
| Transcribing | Preserve audio temporarily and show progress |
| Transcript error | Offer correction or retry without silently losing input |
| Replanning | Keep the previous valid plan visible and show a subtle updating state |
| Planning failure | Save confirmed items, retain the previous plan, and offer retry |
| Offline | Show stored tasks/plan; clearly disable AI processing |
| All complete | Acknowledge completion and invite new voice capture |
| Unsupported recording | Explain limitation and offer the fictional sample path |

## Acceptance criteria

- [ ] Home screen shows the stored recommendation immediately on reopen.
- [ ] Microphone capture begins from the home screen with one user action after permission is available.
- [ ] A recording can be transcribed, reviewed, and confirmed.
- [ ] One recording containing multiple intentions produces multiple editable items.
- [ ] Confirmed items persist before replanning begins.
- [ ] GPT-5.6 returns schema-valid structured items and an updated ordered plan.
- [ ] The top action has an understandable reason and editable effort estimate.
- [ ] Complete, postpone, edit, and delete actions update the visible flow.
- [ ] Network or model failure never deletes a confirmed item or last valid plan.
- [ ] Delete-all-local-data removes locally persisted user content.
- [ ] OpenAI credentials are absent from all browser bundles and repository files.
- [ ] Critical journey passes on Chrome desktop, Chrome Android, and Edge.
- [ ] Safari iPhone behavior is documented after best-effort testing.
- [ ] Public Netlify deployment works without accounts, payment, invitations, or user API keys.

## Demo slice

1. Open Flownee and show an existing **Do this now** recommendation.
2. Record a new everyday intention.
3. Review the transcript and interpretation.
4. Confirm the item.
5. Show the execution flow update and explain why the next action changed or stayed the same.
6. Complete or postpone the action and show the next recommendation.

## Scope-change rule

Do not add an out-of-scope feature until the critical journey and release gates pass. Record any approved scope change with its rationale, owner, and impact on the deadline.
