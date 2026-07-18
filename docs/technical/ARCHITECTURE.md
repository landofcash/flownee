# Flownee Architecture

## Goals

- Deliver a reliable voice-to-action PWA before the hackathon deadline.
- Keep capture fast and the existing plan immediately available.
- Make GPT-5.6's reasoning central, visible, explainable, and testable.
- Protect user content and OpenAI credentials.
- Operate within a total development-and-judging API budget of **$10**.

## System overview

```text
Browser / installed PWA
  ├─ UI: Next.js + TypeScript + Tailwind + shadcn/ui
  ├─ Audio: MediaRecorder-compatible browser capture
  ├─ Local state: IndexedDB
  └─ HTTPS requests
          │
          ▼
Netlify-hosted Next.js server routes
  ├─ validation, limits, throttling, timeouts
  ├─ GPT-4o Transcribe request
  └─ GPT-5.6 structured reasoning request
          │
          ▼
OpenAI API
```

Supabase is deferred. Introduce it only after documenting a server-side persistence requirement that cannot be met by the local-first MVP.

## Core components

| Component | Responsibility |
|---|---|
| Home screen | Show **Do this now**, explanation, ordered upcoming items, and persistent capture action |
| Voice recorder | Acquire microphone permission and record/cancel/retry supported audio |
| Transcript review | Display and edit the GPT-4o Transcribe result before interpretation |
| Interpretation review | Display extracted items, estimates, and assumptions before confirmation |
| Local repository | Persist tasks, plans, preferences, and relevant pending-operation state in IndexedDB |
| AI gateway | Keep keys server-side; validate, limit, and route OpenAI requests |
| Planner | Validate GPT-5.6 structured output and commit a new plan atomically |
| PWA shell | Manifest, icons, service worker/caching strategy, responsive installable shell |

## Voice-to-plan sequence

```text
1. Browser records a temporary audio Blob.
2. Browser sends audio to the protected transcription route.
3. Server validates type and size, then calls GPT-4o Transcribe.
4. Browser receives an editable transcript.
5. User confirms the transcript.
6. Browser sends transcript plus a compact snapshot of active items to the reasoning route.
7. GPT-5.6 returns schema-constrained extracted items and an updated plan.
8. Browser validates the response and presents important interpretations.
9. Confirmed items and plan are written atomically to IndexedDB.
10. Temporary audio is discarded after successful transcription.
```

The implementation may use a draft/pending record so a confirmed transcript or item survives a later planning failure. Never replace the current valid plan until the new response passes validation.

## Opening the app

Opening Flownee is a local operation:

1. Load active items and the last valid plan from IndexedDB.
2. Render **Do this now** immediately.
3. Do not call GPT-5.6 unless task content or relevant state changed.

## Proposed local data model

### `Task`

| Field | Purpose |
|---|---|
| `id` | Client-generated stable identifier |
| `title` | Concise, user-editable action |
| `notes` | Optional user-stated details |
| `sourceTranscriptId` | Traceability to confirmed capture |
| `status` | `active`, `completed`, or `postponed` |
| `statedDeadline` | Deadline only when explicitly stated/confirmed |
| `estimatedEffortMinutes` | Editable AI estimate |
| `contexts` | Editable activity/location/tool categories |
| `dependencies` | Other task IDs or confirmed textual dependency |
| `assumptions` | Model assumptions requiring visibility/confirmation |
| `createdAt` / `updatedAt` | Client timestamps |

### `Transcript`

| Field | Purpose |
|---|---|
| `id` | Client-generated identifier |
| `text` | User-confirmed transcript |
| `createdAt` | Capture time |
| `status` | `draft`, `confirmed`, or `failed` |

Do not persist the audio blob after successful transcription by default.

### `ExecutionPlan`

| Field | Purpose |
|---|---|
| `id` | Client-generated identifier |
| `taskOrder` | Ordered active task IDs |
| `nextTaskId` | Prominent next action |
| `nextReason` | Short user-facing explanation |
| `generatedAt` | Plan time |
| `basedOnRevision` | Local task-collection revision |
| `model` | GPT-5.6 model identifier used |

## GPT-5.6 response contract

Use Structured Outputs or an equivalently strict JSON schema. At minimum return:

- Extracted new tasks.
- User-stated attributes separated from inferred values.
- Editable effort estimates.
- Essential unresolved assumptions or clarification needs.
- Ordered active task IDs.
- One next-task ID.
- A concise reason for the next action.
- Optional grouping/parallel-work explanation needed for the UI.

Reject responses with unknown task IDs, duplicate IDs, missing next items, invalid status transitions, or inconsistent order. Preserve the prior plan on rejection.

## API routes

Names may change during implementation; responsibilities should remain separate.

### `POST /api/transcribe`

- Accept one bounded audio upload.
- Validate content type and size.
- Call GPT-4o Transcribe.
- Return transcript text and request metadata safe for diagnostics.
- Never log raw audio or transcript contents.

### `POST /api/plan`

- Accept a confirmed transcript/new-item payload plus compact active-task context.
- Enforce schema, item-count, and text-length limits.
- Call GPT-5.6.
- Validate and return structured extracted tasks and updated execution plan.
- Never expose provider credentials or raw internal error details.

## Privacy and security

- No account or server-side user database in the MVP.
- Store user data locally in IndexedDB.
- Inform users that audio/transcript content is sent to OpenAI for processing.
- Do not intentionally retain audio after successful transcription.
- Exclude recordings, transcripts, task contents, and secrets from application logs and analytics.
- Provide a delete-all-local-data action.
- Keep OpenAI keys only in Netlify environment variables.
- Validate inputs and outputs at every trust boundary.
- Use HTTPS, restrictive CORS behavior, request throttling, timeouts, and request-size limits.
- Avoid rendering model output as unsanitized HTML.

## Cost controls

- Maximum recording duration: approximately 60–90 seconds.
- Compact active-task context; exclude completed history unless required.
- One GPT-5.6 request per confirmed content/state change where practical.
- No model call merely for opening the app.
- No uncontrolled retries or background polling.
- Use fixtures and mocked provider boundaries during routine tests.
- Configure OpenAI project usage alerts/budget controls.
- Add server-side throttling and an emergency kill switch.

## Failure strategy

| Failure | Behavior |
|---|---|
| Microphone denied | Explain permission recovery; keep existing plan usable |
| Unsupported format | Stop before upload and explain supported path |
| Transcription timeout/error | Retain temporary recording for explicit retry/cancel |
| Invalid transcript | Let user edit or retry |
| GPT-5.6 timeout/error | Persist confirmed item/draft and retain last valid plan |
| Invalid model schema | Reject response, retain last valid plan, allow retry |
| Offline | Show local tasks/plan and disable AI actions clearly |
| Budget/limit reached | Preserve local experience and explain temporary unavailability |

## Supported platforms

- Primary: current Chrome on Android and desktop.
- Secondary: current Edge on desktop.
- Best effort: current Safari on iPhone/iPad.
- Installation is optional; the responsive web experience must remain functional.

## Deployment

- Public Netlify HTTPS deployment.
- No account, payment, invitation, or user-provided API key.
- Deployment remains available through the end of judging.
- Provide fictional sample input as a fallback demonstration path.

## Architectural decisions still to resolve during implementation

- Exact IndexedDB wrapper or direct API use.
- Exact GPT-5.6 family model ID and reasoning configuration after a small quality/cost evaluation.
- Exact audio MIME formats supported per target browser.
- Netlify-compatible request-body limits for recorded audio.
- PWA/service-worker strategy that avoids caching sensitive API responses.
