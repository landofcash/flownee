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

The version-1 schema is implemented with the native IndexedDB API in
`src/lib/storage`. It uses separate `transcripts`, `tasks`, `plans`, and
`metadata` object stores. Runtime assertions validate records before writes and
after reads. The metadata store maintains a monotonically increasing task
revision used to reject stale plans.

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
| `effortSource` | `ai-estimate`, `user-stated`, or `user-edited` provenance paired with the effort value |
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

Repository guarantees:

- Confirmed transcripts can be saved independently of later reasoning.
- Task actions atomically mutate or delete the item, clean dependency links to newly inactive items, increment the collection revision, and write a valid provisional plan before replanning.
- A plan replaces the current valid plan only when its revision matches the current task revision.
- New tasks and their plan can be committed atomically in one transaction.
- Plans include every active task exactly once, exclude inactive tasks, and place `nextTaskId` first.
- Delete-all clears transcripts, tasks, plans, and revision metadata in one transaction.

## GPT-5.6 response contract

The version-1 planning contract is implemented in `src/lib/ai` with matching
TypeScript types, strict JSON Schemas, a lean developer prompt, semantic runtime
validation, and executable evaluation fixtures.

- Endpoint contract: Responses API with strict `text.format` Structured Outputs.
- Model baseline: explicit `gpt-5.6-sol` with `medium` reasoning. This
  quality-first configuration must be measured against the fixtures before any
  lower-effort or lower-cost family tier is adopted.
- Input operation: `capture` includes one confirmed transcript and may extract
  tasks; `replan` contains no transcript and is forbidden from creating tasks or
  clarifications. Both include the task revision, compact active-task snapshot,
  capture time, and IANA time zone. Completed history and unrelated local data are excluded.
- Output: extracted tasks, explicit attribute provenance, editable effort
  estimates, assumptions, essential clarifications, a complete order, one
  explained next action, and genuine parallel groups.
- Deadline policy: a value is permitted only with `user-stated` provenance;
  otherwise both value and source must be `null`/`none`.
- Empty-state policy: no active or extracted tasks produces an explicit
  `no-action` plan with null next-action fields.

The runtime validator rejects missing or unknown fields, unsupported schema
versions, unknown or duplicate references, incomplete task orders, mismatched
next actions, self/unknown dependencies, invalid provenance, and malformed
parallel groups. Provider refusal, incomplete output, timeout, and parser failure
must be handled by the future route before this validator is called. In every
failure case, preserve the confirmed transcript and last valid plan.

## API routes

Names may change during implementation; responsibilities should remain separate.

### `POST /api/transcribe`

- Implemented as a Node.js Next.js route using direct server-side HTTPS to the OpenAI API.
- Accepts one multipart `audio` upload up to 6 MiB in WebM, MP4, or Ogg form.
- Rejects empty, oversized, unsupported, malformed, and cross-site browser requests before provider access.
- Uses the exact `gpt-4o-transcribe` model with JSON output and a 45-second timeout.
- Returns transcript text, model ID, and an optional provider request ID safe for diagnostics with `Cache-Control: no-store`.
- Keeps the API key, provider error details, raw audio, and transcripts out of logs and browser bundles.
- Remains behind the server-side `AI_FEATURES_ENABLED` emergency switch.

### `POST /api/plan`

- Implemented as a Node.js Next.js route using the Responses API with the
  explicit `gpt-5.6-sol` model, `medium` reasoning, low text verbosity, strict
  Structured Outputs, a 5,000-token output ceiling, and a 55-second timeout.
- Accepts only same-origin JSON requests up to 128 KiB and validates the complete
  compact task snapshot before provider access.
- Sends no completed history, recordings, unrelated local data, tools, or
  persisted conversation state; provider storage is disabled with `store: false`.
- Handles provider refusal, incomplete responses, invalid JSON, schema mismatch,
  rate limits, network failure, and timeout with safe retry guidance.
- Returns only validated planning output, actual model ID, optional request ID,
  and token counts with `Cache-Control: no-store`; provider errors and credentials
  remain server-side.

### Interpretation review and commit

- A confirmed transcript is saved to IndexedDB before `/api/plan` is called.
- The existing plan stays visible with an updating indicator while GPT-5.6
  reasons and while the interpretation is reviewed.
- Extracted titles, notes, effort estimates, provenance, deadlines, assumptions,
  and essential clarifications are visible. Titles, notes, and effort are editable.
- Important assumptions require explicit confirmation. Blocking clarifications
  require transcript revision rather than guessing.
- Temporary model references are mapped to client-generated task IDs only after
  review. New tasks and the replacement plan are then committed atomically.
- A stale revision, provider failure, or client validation failure preserves both
  the confirmed transcript and previous valid plan.

### Task actions and replanning

- Complete, postpone, restore, edit, and delete are local-first user actions.
- Each action commits before network access and immediately derives a complete
  provisional order for the new revision; no AI call is made when no active task remains.
- Replanning sends only the resulting active tasks with `operation: replan` and
  a null transcript. Structured-output validation rejects new tasks or transcript
  clarifications in this mode.
- A newer task action aborts the older client request. The IndexedDB revision
  check is the authoritative second guard if an aborted response still arrives.
- Provider failure leaves the confirmed mutation and provisional order intact,
  stops the updating indicator, and exposes an explicit retry action.

### Transcript-review recovery

- One home-screen action requests microphone access and begins a bounded 90-second recording.
- Cancelled or superseded permission requests cannot reopen recording later.
- After stop, the temporary Blob is sent to `/api/transcribe` and retained only in memory until transcription succeeds or the user discards it.
- Network, timeout, provider, or rate-limit failures preserve the Blob for explicit retry.
- Successful text is editable only as transcript correction; this is not a parallel text-capture path.
- Only user-confirmed transcript text is persisted to IndexedDB; successful audio is released.

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
- The privacy panel explains local storage, temporary audio, planning inputs,
  throttling, and the limits of local deletion.
- Delete-all clears transcripts, tasks, plans, and revision metadata in one
  IndexedDB transaction after a second explicit confirmation.
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
- Both paid routes enforce separate fixed-window per-client limits before
  provider access. Defaults are 6 transcriptions and 20 planning requests per
  10 minutes and can be lowered through deployment environment variables.
- Rate-limit responses use HTTP 429 with `Retry-After` and remaining-limit headers.
- `AI_FEATURES_ENABLED=false` is the authoritative server-side emergency switch.
  Capture checks `/api/ai-status` before requesting microphone permission, while
  each paid POST route independently rechecks the switch.
- The in-memory limiter is best effort per warm serverless instance, not a
  durable global quota. The kill switch and OpenAI project budget/usage controls
  remain the authoritative protection against distributed abuse.

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

- Public Netlify HTTPS deployment: https://flownee-build-week.netlify.app
- No account, payment, invitation, or user-provided API key.
- Deployment remains available through the end of judging.
- Provide fictional sample input as a fallback demonstration path.

## PWA caching baseline

- The web manifest and app icon are generated from repository-owned assets.
- The production service worker caches only the public shell fallback and app icon.
- Same-origin API routes, non-GET requests, and cross-origin requests bypass the service worker completely.
- Navigation uses the network when available and falls back to the cached public shell when offline.
- User tasks, transcripts, and execution plans are never written to the Cache API; IndexedDB remains their intended local store.

## Architectural decisions still to resolve during implementation

- Whether fixture results justify lowering GPT-5.6 reasoning effort after the initial `gpt-5.6-sol`/`medium` baseline run.
- Exact audio MIME formats supported per target browser.
- Netlify-compatible request-body limits for recorded audio.
- Production cache versioning and update UX beyond the safe shell-only service-worker baseline.
