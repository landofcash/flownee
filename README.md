# Flownee

**From what is on your mind to what makes sense next.**

Flownee is a calm, voice-first personal productivity PWA that turns spoken
everyday intentions into a continuously updated answer to:
**What should I do now?**

It was built from scratch for the OpenAI Build Week **Apps for Your Life**
track. Flownee is account-free, local-first, installable, and designed for
busy people who want guidance without maintaining another complicated
productivity system.

## Try Flownee

- Public application:
  [flownee-build-week.netlify.app](https://flownee-build-week.netlify.app)
- Public demonstration video (2 minutes 36 seconds):
  [Flownee - Your Flow. What Makes Sense Next.](https://youtu.be/xpT-oI0Lh4M)
- Judge testing guide and fictional input:
  [`TESTING_INSTRUCTIONS.md`](TESTING_INSTRUCTIONS.md)
- Read-only fictional previews:
  [sample plan](https://flownee-build-week.netlify.app/?demo=sample),
  [updating](https://flownee-build-week.netlify.app/?demo=updating),
  [all complete](https://flownee-build-week.netlify.app/?demo=complete), and
  [loading](https://flownee-build-week.netlify.app/?demo=loading)

No account, payment, invitation, user API key, or preloaded personal data is
required. The fictional previews do not create or change local tasks; their
task actions are intentionally disabled. They are safe, read-only presentation
states for quickly reviewing Flownee's hierarchy without writing fictional
items to IndexedDB, consuming paid AI requests, or changing a judge's real
browser data. Use the normal application URL for the complete interactive
journey. Each preview now carries an in-product **Read-only preview** banner
that explains these boundaries and links directly back to interactive Flownee.

The Codex `/feedback` Session ID for the project task where the majority of
core functionality was built is
`019f709a-b5fb-7230-bf41-4c4508f7051f`.

## The problem

Small personal, household, family, shopping, social, and administrative
intentions are easy to remember at inconvenient moments and easy to forget
later. They are often too informal for a calendar, while manually categorizing
and prioritizing them in a traditional task manager creates more work.

Flownee reduces both kinds of friction:

1. Capture naturally by voice.
2. Review what was heard and how it was interpreted.
3. Let GPT-5.6 reason across the complete active set.
4. See one explained recommendation and a practical remaining order.
5. Complete, postpone, edit, or delete items and let the flow update.

The product deliberately avoids turning productivity into another project to
manage. Unlike assistants that require accounts, repeated prompting, manual
categories, or complex setup, Flownee asks for one quick action: speak. It then
maintains the structure and next-action guidance while the user remains free to
accept, correct, postpone, complete, or ignore a suggestion.

### Product validation

Flownee was validated at multiple stages. Initial concept validation confirmed
that the problem and proposed voice-first approach resonated with users.
Additional independent qualitative validation during and after product
development found that users reported forgetting fewer everyday tasks, feeling
less mental clutter, and experiencing greater day-to-day satisfaction.

These are qualitative, self-reported outcomes. The repository does not record a
participant count, standardized instrument, control group, effect size, or
longitudinal retention period for this validation, so Flownee does not present
the findings as statistically representative or causal evidence.

### Intentional next-action language

Flownee deliberately uses three equivalent expressions for the same central
concept:

- **What should I do now?** states the user's practical question.
- **What makes sense next?** expresses Flownee's calm, contextual guidance.
- **Do this now** labels the compact current-action state.

The expression changes with context, available screen space, and tone. This is
an intentional copywriting system, not a difference in product logic: all three
phrases refer to the current recommended next action.

## Core experience

- One-tap voice capture from the home screen.
- Editable GPT-4o Transcribe transcript before interpretation.
- Multiple intentions extracted from one recording.
- Editable titles and effort estimates before saving.
- Visible separation between user-stated facts, AI estimates, and assumptions.
- One prominent **Do this now** action with effort and a concise reason.
- Ordered **Next items in your current flow**.
- Complete, postpone, restore, edit, delete, clean-completed, and delete-all
  controls.
- Immediate local updates followed by automatic GPT-5.6 replanning.
- Last valid recommendation preserved during replanning or provider failure.
- IndexedDB persistence across refresh, close, reopen, and PWA use.
- Light and dark themes, responsive mobile-first UI, keyboard-accessible
  non-capture controls, reduced-motion handling, and installable PWA metadata.

## Usability-driven Build Week refinement

Flownee was tested and refined continuously during Build Week rather than left
as a first-pass prototype. Product-owner walkthroughs on desktop and physical
phones exposed practical issues, and each round informed the next release.
That cycle produced:

- larger, clearer touch targets and a sticky mobile header;
- a simpler capture-to-flow handoff with the redundant success screen removed;
- clearer task terminology, effort controls, status feedback, and blocking
  replanning feedback;
- slide-to-confirm task actions that reduce accidental completion or
  postponement;
- improved cross-capture grouping so related errands can be planned together;
- production same-origin and failure-recovery fixes discovered through live
  deployment testing; and
- a more modern visual system using Plus Jakarta Sans, restrained Magic UI
  motion, Flownee colors, light/dark themes, and responsive mobile layouts.

This is documented as iterative product-owner usability, physical-device
functional acceptance, and team-reported independent qualitative validation.
The structured participant protocol and timed success thresholds remain
separate and incomplete; this distinction keeps the evidence honest while
showing that validation materially informed the product.

## How the AI workflow works

```text
Microphone
  -> temporary browser audio Blob
  -> protected /api/transcribe route
  -> GPT-4o Transcribe
  -> editable transcript
  -> protected /api/plan route
  -> GPT-5.6 structured extraction and planning
  -> interpretation review
  -> atomic IndexedDB task + plan commit
  -> updated Do this now recommendation
```

### GPT-4o Transcribe

Audio is uploaded only after the user stops recording. The protected server
route validates the file type and size, applies a timeout and request limit,
and sends the recording to `gpt-4o-transcribe`. Flownee releases the temporary
audio after successful transcription and does not store recordings in its
durable local schema.

### GPT-5.6

The planning route uses `gpt-5.6-sol` with medium reasoning through the
Responses API. Strict Structured Outputs and a second semantic validation layer
require GPT-5.6 to return:

- extracted intentions with one visual emoji cue each;
- explicit effort and deadline provenance;
- visible assumptions and essential clarifications;
- a complete order containing every active task exactly once;
- one explained next action; and
- genuine parallel-work groups where appropriate.

A capture request includes only the confirmed transcript and a compact snapshot
of active tasks. A later replan includes active tasks but no transcript and is
not allowed to create new tasks. Completed history and unrelated local data are
excluded.

## Reliability and local-first design

Flownee treats AI as a fallible planning dependency, not as the source of truth
for user data.

- Confirmed transcripts can be saved independently of later planning.
- Task changes are committed locally before replanning begins.
- A monotonically increasing task revision rejects stale model responses.
- Invalid, incomplete, or inconsistent model output cannot replace a valid
  plan.
- A provisional local plan keeps the interface usable during replanning.
- Network or model failure never deletes a confirmed item or the previous
  valid plan.
- Opening the app loads from IndexedDB and does not call GPT-5.6 unless relevant
  task state changed.

## Privacy and operational boundaries

- No account or server-side task database.
- Confirmed transcripts, tasks, statuses, preferences, and plans remain in the
  current browser's IndexedDB.
- Audio is not retained after successful transcription by default.
- OpenAI credentials are server-only and never use a `NEXT_PUBLIC_` variable.
- Paid routes enforce same-origin browser requests, input limits, provider
  timeouts, configurable best-effort throttling, and an emergency feature
  switch.
- Application logs exclude recordings, full transcripts, personal task
  contents, and secrets.
- The Help screen provides a two-step control that atomically deletes all local
  Flownee content.

Tasks do not synchronize between devices, browser applications, or browser
profiles. OpenAI processing requires a network connection; saved local content
remains available offline.

## Technology

| Area | Implementation |
|---|---|
| Application | Next.js 16, React 19, TypeScript 6 |
| Interface | Tailwind CSS 4 and shadcn/ui-compatible primitives |
| Local persistence | Native IndexedDB with runtime record validation |
| Voice capture | Browser `MediaRecorder` with MIME negotiation |
| Transcription | GPT-4o Transcribe through a protected Next.js route |
| Reasoning | GPT-5.6 Responses API with strict Structured Outputs |
| PWA | Web manifest, owned icons, and API-bypassing service worker |
| Testing | Vitest, fake-indexeddb, component/contract/route tests |
| Hosting | Netlify |
| Package manager | pnpm 11 with a frozen lockfile |

Supabase, accounts, calendar integration, push notifications, background
listening, multi-device synchronization, routine learning, and location-aware
recommendations are deliberately outside the MVP.

## Local development

### Prerequisites

- Node.js 20.9 or newer
- pnpm 11
- An OpenAI API key only when exercising the live AI routes

### Install and run

```bash
pnpm install --frozen-lockfile
```

macOS/Linux:

```bash
cp .env.example .env.local
pnpm dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose | Default example |
|---|---|---|
| `OPENAI_API_KEY` | Server-only OpenAI credential | empty |
| `AI_FEATURES_ENABLED` | Emergency switch for both paid routes | `false` |
| `AI_RATE_LIMIT_WINDOW_SECONDS` | Per-instance throttle window | `600` |
| `AI_TRANSCRIBE_RATE_LIMIT` | Transcription requests per client/window | `6` |
| `AI_PLAN_RATE_LIMIT` | Planning requests per client/window | `20` |
| `NEXT_PUBLIC_APP_ENV` | Non-secret deployment label | `development` |

Set `OPENAI_API_KEY` and `AI_FEATURES_ENABLED=true` only in `.env.local` or the
deployment environment. Never commit a real key. With AI disabled, the local
shell, stored flow, task management, and fictional previews remain available;
new transcription and planning are intentionally paused.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm audit --prod
pnpm lint
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

The current automated baseline is 35 test files and 133 passing tests. Coverage
includes IndexedDB transactions, stale-plan rejection, structured-output
contracts, provider boundaries, route validation, throttling, task actions,
home states, voice-state rendering, PWA metadata, and UI behavior. The current
production dependency audit reports no known vulnerabilities.

For the complete manual public journey, expected results, recovery checks,
fictional voice input, and delete-all procedure, follow
[`TESTING_INSTRUCTIONS.md`](TESTING_INSTRUCTIONS.md).

## Platform evidence

Flownee is submitted as a responsive web application and installable PWA for
current mainstream smartphone and desktop browsers. It requires no proprietary
hardware, account, browser extension, or platform-specific installation path.

Product-owner testing completed the public voice/AI journey, task actions,
individual editing/deletion, delete-all, reload, and reopen checks on the
physical mobile platforms used for final acceptance:

- Redmi Note 12 Pro 5G in installed-app mode and current Chrome and Firefox.
- iPhone 17, iPhone 12, and iPhone 8 in current Safari, Chrome, and Firefox.

Windows Chrome-engine recording, IndexedDB, and responsive evidence is also
documented. The team confirmed final acceptance on every platform it intends to
represent in the submission; it does not claim exhaustive certification of
every browser/version combination. Exact mobile OS/browser versions and
per-browser MIME diagnostics were not captured. See
[`docs/technical/PLATFORM_TEST_MATRIX.md`](docs/technical/PLATFORM_TEST_MATRIX.md)
and
[`docs/technical/AUDIO_COMPATIBILITY.md`](docs/technical/AUDIO_COMPATIBILITY.md)
for the precise claim boundaries.

## How the team collaborated with Codex

Codex was used throughout product definition, architecture, implementation,
testing, debugging, documentation, and release preparation. Under human
direction, Codex accelerated work by:

- translating the product brief and hackathon rules into a scoped execution
  plan and persistent repository guidance;
- implementing and testing the native IndexedDB schema, atomic repositories,
  task revisions, provisional plans, and stale-response protection;
- defining strict GPT-5.6 request/output contracts, prompts, semantic
  validation, and executable evaluation fixtures;
- building protected transcription and planning routes with safe provider
  error handling, timeouts, input limits, throttling, and feature controls;
- implementing the responsive voice, review, task-management, recovery,
  privacy, PWA, and accessibility states;
- diagnosing production same-origin behavior behind Netlify's reverse proxy;
- expanding automated coverage and repeatedly running lint, tests, TypeScript,
  production builds, browser checks, and deployment smoke checks; and
- maintaining dated task evidence, decision history, platform limitations, and
  judge-facing documentation.

Codex did not independently choose the product direction or approve releases.
Material changes were reviewed against explicit product-owner decisions, and
uncertain or unavailable evidence was recorded as such rather than invented.
The detailed collaboration record is in
[`docs/execution/CODEX_SESSION_LOG.md`](docs/execution/CODEX_SESSION_LOG.md).

## Decisions made by humans

Victoria and Mike retained ownership of the consequential product,
engineering, design, testing, and submission decisions, including:

- choosing the busy-adult problem, **Apps for Your Life** track, value
  proposition, research claim boundaries, and voice-first product direction;
- requiring voice-only capture with editable text review rather than adding a
  competing text-entry workflow;
- choosing account-free local persistence, no permanent audio retention, and
  no calendar, account, synchronization, reminder, routine-learning, or
  location scope for the MVP;
- selecting GPT-4o Transcribe, GPT-5.6, Next.js, TypeScript, Tailwind,
  shadcn/ui conventions, IndexedDB, Netlify, and the server-only API boundary;
- defining the calm, concise, non-judgmental tone and approving the brand,
  responsive layout, interaction hierarchy, effort options, animations, and
  final mobile experience;
- approving API-budget controls, model-quality assumptions, staged design
  gates, dependencies, assets, and every material release decision; and
- conducting physical-device product acceptance and owning the final
  usability, rights, compliance, video, and Devpost claims.

## Repository map

```text
src/app/                  Next.js pages, manifest, and protected API routes
src/components/home/      Recommendation, task actions, and saved-item flow
src/components/voice/     Recording, transcript, and interpretation journey
src/lib/ai/               GPT-5.6 contracts, prompt, validation, and fixtures
src/lib/audio/            MediaRecorder capability and recording logic
src/lib/server/           OpenAI boundaries, origin checks, and throttling
src/lib/storage/          IndexedDB schema and atomic repository
public/                   PWA assets and service worker
docs/                     Product, architecture, execution, evaluation, and compliance evidence
```

## Documentation

- [Project brief](docs/product/PROJECT_BRIEF.md)
- [MVP scope](docs/product/MVP_SCOPE.md)
- [Architecture](docs/technical/ARCHITECTURE.md)
- [Platform test matrix](docs/technical/PLATFORM_TEST_MATRIX.md)
- [Audio compatibility evidence](docs/technical/AUDIO_COMPATIBILITY.md)
- [Implementation plan](docs/execution/IMPLEMENTATION_PLAN.md)
- [Current tasks and handoff](docs/execution/TASKS.md)
- [Codex session log](docs/execution/CODEX_SESSION_LOG.md)
- [Usability-test protocol](docs/evaluation/USABILITY_TEST.md)
- [Compliance checklist](docs/compliance/COMPLIANCE_CHECKLIST.md)
- [Hackathon rules baseline](docs/compliance/HACKATHON_RULES.md)

## License

Flownee is released under the [MIT License](LICENSE).
