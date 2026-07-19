# Codex Session Log

Use this file to preserve evidence of Codex contributions and human judgment. Do not record secrets, personal task content, raw recordings, or private transcripts.

The `/feedback` Session ID required by the hackathon must come from the project task where most core functionality is built. A baseline or documentation session should not be presented as that session unless it genuinely contains the majority of core functionality.

## 2026-07-19 — mobile-width desktop shell

- Session ID: `TBD` (supporting design session)
- Objective: Make the desktop presentation retain Flownee's focused mobile-app proportions.
- Codex contributions:
  - Capped the application shell at `430px` and centered it in wider viewports.
  - Kept the recommendation and upcoming flow in one column at desktop widths.
  - Matched the fixed voice bar and voice, task, and privacy dialog widths to the shell.
  - Added subtle edge definition so the application remains visually distinct on a wide screen.
- Human design decision preserved:
  - Victoria requested that desktop Flownee look like the mobile experience rather than expanding into a wide dashboard.
- Verification:
  - Desktop `1440x900`: application shell and fixed voice bar both measured exactly `430px` and were horizontally centered.
  - No horizontal overflow or browser console warnings/errors.
  - Lint, 54 automated tests, and production build pass.

## 2026-07-19 — enlarged bottom voice action

- Session ID: `TBD` (supporting design and usability session)
- Objective: Replace the small circular recording control with a more forgiving, permanently accessible bottom action.
- Codex contributions:
  - Converted the fixed footer into one large, full-width mobile call-to-action with a constrained desktop width.
  - Kept the existing `Add by voice` and `Tap once and speak naturally` copy inside the clickable area.
  - Centered a 64-pixel microphone medallion across the button's top edge to follow the supplied sketch.
  - Preserved the existing recording workflow and accessible button name.
- Human design decision preserved:
  - Victoria identified the original circular control as too small and supplied the rectangular bottom-button direction.
  - Victoria refined the title treatment to be slightly smaller and clearly separated from the microphone circle while preserving the compact card, centered text, weight, and color.
  - Victoria extended the colored action surface through the lower safe area so it reads as a bottom action panel while keeping its width, top edge, microphone, text, and surrounding layout unchanged.
  - Victoria then requested the panel use the maximum horizontal space in both directions, so the footer inset was removed while the centered `430px` desktop shell remained unchanged.
  - Victoria selected a classical rectangular treatment with square corners, a slightly larger title, and explicit clearance below the microphone circle.
- Verification:
  - Mobile `390x844`: clickable control approximately `343x80` CSS pixels; fixed to the bottom; centered `64x64` microphone medallion; no horizontal overflow.
  - Desktop `1440x900`: clickable control `576x80` CSS pixels and centered at the bottom.
  - Follow-up spacing check: title `14px`/semibold with a measured `7px` circle-to-title gap at narrow and desktop viewport widths; horizontal center delta below `0.01px`.
  - Bottom-panel check: action height `96px` with a baseline `16px` safe area, bottom edge flush with the viewport at narrow and `1440px` widths, unchanged horizontal measurements, unchanged `64px` microphone, `16px` corner radius, and no overflow or console errors.
  - Edge-to-edge check: the action fills the footer's content box at both widths (`302.4px` within the `304px` narrow shell and `428.4px` within the bordered `430px` desktop shell); the only `0.8px` space per side is the shell border, and horizontal overflow remains zero.
  - Rectangular-panel check: measured corner radius `0px`; title `16px`/semibold with `20px` line height; `9px` clear vertical gap below the unchanged `64px` microphone at narrow and `1440px` widths; no horizontal overflow.
  - The control is uniquely exposed to assistive technology, visible, and enabled.
  - Browser console: no errors or warnings.
  - Lint, 54 automated tests, and the production build pass (run through the bundled Node runtime because the pnpm wrapper requested an interactive modules-directory confirmation).

## 2026-07-18 — expert usability walkthrough and participant protocol

- Session ID: `TBD` (supporting evaluation session)
- Objective: Evaluate the public first-run and recommendation experience
  against the confirmed success measures without inventing participant data.
- Codex contributions:
  - Ran an isolated mobile expert walkthrough of the public empty state and
    fictional sample.
  - Measured capture-button visibility, tap-target size, bottom reachability,
    and horizontal overflow.
  - Assessed the next-action hierarchy and reason comprehension.
  - Created a five-minute, three-to-five-participant protocol with operational
    definitions, thresholds, and an empty results table.
- Human input still required:
  - Recruit representative adults and record real observations.
  - Decide whether the high-priority read-only sample ambiguity should be fixed
    before the demo.
- Verification:
  - Public mobile viewport: `390x844`; capture control `64x64`, visible 16 px
    above the bottom edge; no horizontal overflow.
  - Expert comprehension: sample next action and reason were clear.
  - No ambient microphone content was captured and no provider call was made.
  - Participant success measure remains open.

## 2026-07-18 — deployment and supported-platform verification

- Session ID: `TBD` (supporting deployment/test session)
- Objective: Publish Flownee to Netlify and run the declared platform matrix.
- Codex contributions:
  - Verified the local HTTP surface for the home, fictional demo, manifest,
    service worker, recording diagnostic, and AI-status endpoints.
  - Confirmed the installed Windows browser versions and consolidated prior
    measured Chrome-engine recording and responsive-layout evidence.
  - Created a release-journey matrix that distinguishes measured tests,
    viewport simulation, product-owner assumptions, and unavailable devices.
  - Initiated Netlify CLI authorization without exposing the OpenAI key.
- Human product and engineering decisions preserved:
  - Physical Android recording remains explicitly deferred; it is not recorded
    as a pass.
  - The deployment must be public and account-free, with the OpenAI key stored
    only in Netlify's server-side environment.
- Verification:
  - Local endpoints `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`,
    `/diagnostics/recording`, and `/api/ai-status`: HTTP 200.
  - Installed browsers: Google Chrome `150.0.7871.125`; Microsoft Edge
    `150.0.4078.83`.
  - Netlify deployment: pass at `https://flownee-build-week.netlify.app`, deploy
    `6a5cc2dff6f76e3dde4de76e` (latest), built from repository commit `f417def`.
  - Latest production smoke check: HTTP 200 for `/`, `/manifest.webmanifest`,
    and `/api/ai-status`; Netlify reports the deploy state as `ready` with the
    Next.js server function available.
  - Signed-out production: HTTP 200 for home, fictional demo, manifest, service
    worker, icon, recording diagnostic, and AI status; AI enabled; untrusted
    origins rejected with HTTP 403 by both paid routes before provider use.
  - In-app browser retry: no result claimed because the browser surface
    returned stale-tab errors after its documented recovery path.

## 2026-07-18 — privacy, deletion, and public API safeguards

- Session ID: `TBD` (supporting implementation session; compare with the core voice/planning sessions before selecting `/feedback` evidence)
- Objective: Make Flownee’s data boundaries understandable and protect the public, sponsor-funded AI routes from accidental or abusive use.
- Codex contributions:
  - Added a responsive privacy/data panel describing browser storage, temporary audio handling, planning inputs, request throttling, and deletion limits.
  - Implemented confirmed atomic deletion of all IndexedDB user-content stores and immediate UI reset.
  - Added a no-store AI-availability endpoint and preflight check before microphone permission, while preserving authoritative switch checks in both paid POST routes.
  - Added configurable per-client request windows, hashed transient client keys, 429/Retry-After responses, expired-bucket cleanup, and provider-call prevention tests.
- Human product and engineering decisions preserved:
  - The privacy explanation uses precise behavior claims and does not promise that local deletion retracts data already processed by OpenAI.
  - Merely opening Flownee still performs no AI request; switch status is checked only when capture starts.
  - Default limits favor a short judge demo while bounding repeated use: 6 transcriptions and 20 plans per 10-minute warm instance.
  - The serverless in-memory limiter is documented as best effort; the environment kill switch and OpenAI project controls remain the authoritative budget protection.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 13 files and 54 tests passed.
  - `pnpm build`: pass; `/api/ai-status`, `/api/transcribe`, and `/api/plan` are dynamic routes.
  - Browser: privacy dialog passed at 390×844 without overflow; two-step deletion passed on an empty isolated local origin; no console warnings/errors.
  - Live provider: not called.

## 2026-07-18 — task actions and stale-response protection

- Session ID: `TBD` (reassess this task together with the interpretation/replanning task for the majority-core-functionality requirement)
- Objective: Let users manage every captured item while keeping local state immediate and preventing delayed GPT-5.6 responses from undoing newer decisions.
- Codex contributions:
  - Added atomic complete, postpone, restore, edit, and delete mutations with task-revision increments, inactive-dependency cleanup, and valid provisional plans.
  - Extended the strict GPT-5.6 contract with separate `capture` and transcript-free `replan` operations; replanning cannot create tasks or clarification questions.
  - Implemented client request cancellation, response-attempt tracking, and authoritative IndexedDB revision checks before plan replacement.
  - Added responsive task-management and edit UI, permanent-delete confirmation, completed/postponed item access, retryable planning failure UI, and automated concurrency coverage.
- Human product and engineering decisions preserved:
  - A confirmed task action takes effect locally before any network call and is never rolled back because AI is unavailable.
  - GPT-5.6 remains central to prioritizing remaining active work, but no provider request is needed when the active list becomes empty.
  - A locally derived provisional plan is visibly temporary and remains usable if GPT-5.6 fails; the user controls whether to retry.
  - Completed and postponed items stay recoverable in the local saved-items surface; destructive deletion requires a second explicit click.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 11 files and 47 tests passed.
  - `pnpm build`: pass.
  - Browser: fictional sample shell checked at 390×844; no horizontal overflow and no console warnings/errors.
  - Live provider: not called; provider request shape and semantic rejection remain covered at the mocked boundary.

## 2026-07-18 — interpretation review and automatic replanning

- Session ID: `TBD` (strong candidate for the majority-core-functionality session; reassess after task actions)
- Objective: Connect confirmed transcripts to protected GPT-5.6 reasoning, human interpretation review, and an atomically updated local execution flow.
- Codex contributions:
  - Verified the current Responses, GPT-5.6, reasoning, Structured Outputs, incomplete-output, and refusal contracts against official OpenAI documentation.
  - Implemented the protected `/api/plan` route with same-origin and request-size checks, server-only authentication, timeout, feature switch, stateless provider requests, safe errors, actual-model capture, and token accounting.
  - Added client-side revalidation, editable task interpretation, visible provenance and assumptions, blocking clarification handling, temporary-reference mapping, atomic IndexedDB commits, and local home-plan reload.
  - Added automated coverage for provider request shape, refusal, invalid semantic output, cross-site rejection, malformed input, edited estimates, required assumptions, and persisted-home-state conversion.
- Human product and engineering decisions preserved:
  - Transcript confirmation is saved before planning so user speech cannot be lost when GPT-5.6 fails.
  - GPT-5.6 plans automatically after transcript confirmation, while task records are committed only after the user reviews the interpretation.
  - Important assumptions require explicit human confirmation; blocking ambiguity returns to transcript revision instead of being guessed.
  - The prior valid plan remains visible while updating and is never replaced by an invalid or stale plan.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 11 files and 42 tests passed with mocked provider boundaries.
  - `pnpm build`: pass; `/api/plan` generated as a dynamic Node.js route.
  - Browser: fictional sample shell checked at 390×844; no horizontal overflow and no console warnings/errors.
  - Live provider: one fictional `Call Maria` request reached OpenAI through the protected route and returned HTTP 429. No retry loop was attempted; successful live fixture scoring and token measurement remain open.

## 2026-07-18 — GPT-5.6 planning contract and evaluation baseline

- Session ID: `TBD` (candidate core-functionality session; reassess after the planning route and review UI are complete)
- Objective: Define the strict boundary between confirmed voice captures, GPT-5.6 reasoning, and Flownee's local execution plan.
- Codex contributions:
  - Checked current official GPT-5.6 model and Structured Outputs guidance and selected the explicit `gpt-5.6-sol` Responses baseline with `medium` reasoning.
  - Implemented matching versioned TypeScript and JSON Schemas for compact active-task input and provenance-rich planning output.
  - Added semantic validation beyond JSON shape: complete plan coverage, stable/unique references, next-item consistency, dependency validity, deadline provenance, and explicit empty-plan behavior.
  - Added a lean planning prompt and six executable evaluation fixtures covering mixed household tasks, passing ideas, explicit deadlines, incremental replanning, non-actionable speech, and transcript prompt injection.
- Human product and engineering decisions preserved:
  - GPT-5.6 remains central to extracting multiple intentions and answering what to do now after every confirmed addition.
  - The system may estimate effort and infer reversible context, but it may not invent user facts or deadlines.
  - Existing active work must remain in every replan, while confirmed content and the last valid plan survive any provider or validation failure.
  - The quality-first Sol/medium baseline will be measured before lowering reasoning effort to save the capped API budget.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 8 files and 33 tests passed; provider calls remain mocked/not yet implemented.
  - `pnpm build`: pass.
  - Live GPT-5.6 fixture scoring, latency, and token-cost measurements are intentionally deferred until the protected reasoning route exists.

## 2026-07-18 — protected transcription and transcript review

- Session ID: `TBD` (candidate core-functionality session; reassess after GPT-5.6 planning is implemented)
- Objective: Connect Flownee's one-tap voice capture to a protected GPT-4o Transcribe boundary and user-controlled transcript confirmation.
- Codex contributions:
  - Verified the current `gpt-4o-transcribe` transcription endpoint, multipart input, JSON response, and accepted audio containers against official OpenAI documentation.
  - Implemented server-only authentication, feature switch, same-origin browser checks, bounded file/type validation, provider timeout, no-store responses, and safe error mapping.
  - Implemented a 90-second recorder session with start, stop, cancel, automatic limit, permission recovery, temporary audio retry, and race-safe cancellation.
  - Added editable transcript review and persisted only user-confirmed text to the native IndexedDB repository.
  - Found and fixed a late-permission race through production mobile-browser testing.
- Human product and engineering decisions preserved:
  - Capture remains voice-only; text editing exists solely to correct the transcript.
  - Audio remains temporary, is uploaded only after stop, survives a transcription failure for explicit retry, and is released after success or discard.
  - No live provider call was made during automated testing, avoiding accidental transmission of ambient microphone content and unnecessary budget use.
- Verification:
  - `.env.local` is ignored; key presence and feature-switch state were checked without printing their values.
  - `pnpm lint`: pass.
  - `pnpm test`: 7 files and 22 tests passed with a mocked OpenAI boundary.
  - `pnpm build`: pass; `/api/transcribe` generated as a dynamic Node.js route.
  - Production mobile browser: one-tap permission state and cancel recovery passed; dialog remained closed after a delayed permission result and console errors were empty.

## 2026-07-18 — audio compatibility diagnostic and desktop proof

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Measure real MediaRecorder support and Blob output on the available desktop Chrome engine, and prepare the identical proof path for Android.
- Codex contributions:
  - Implemented ordered audio MIME detection and WebM/Opus preference with MP4 and Ogg fallbacks measured independently.
  - Added a public, no-upload diagnostic route with secure-context checks, real microphone recording, bounded permission handling, actual Blob metadata, and recovery guidance.
  - Added unit coverage for format selection, missing APIs, and permission-denied guidance.
  - Ran a real three-second microphone test in the available Windows Chrome 150 engine and recorded the exact measured result.
- Human product and engineering decisions preserved:
  - Audio remains temporary and is neither uploaded nor persisted by the diagnostic.
  - Browser-reported support is not treated as proof until a non-empty Blob is produced from a real microphone stream.
  - WebM/Opus is provisional until current Chrome for Android completes the same physical-device test.
- Measured desktop evidence:
  - Identity: Win32, Chrome 150 Windows user agent; installed Google Chrome `150.0.7871.125`.
  - Preferred and actual type: `audio/webm;codecs=opus`.
  - Output: 47,639 bytes, 3,004 ms, one audio track.
  - Reported supported: WebM/Opus, WebM, MP4/AAC, and MP4. Reported unsupported: Ogg/Opus and Ogg.
- Remaining external evidence:
  - No Android ADB target or public HTTPS deployment was available, so Android remains explicitly unverified.
  - The product owner approved proceeding with Android recording as a provisional assumption and committed to later physical-device testing; this does not convert the assumption into evidence.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 5 files and 15 tests passed.
  - `pnpm build`: pass; `/diagnostics/recording` generated successfully.

## 2026-07-18 — native IndexedDB schemas and repositories

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Define and test durable local schemas for confirmed transcripts, tasks, execution plans, and task revisions.
- Codex contributions:
  - Implemented a versioned native IndexedDB database with indexed stores for transcripts, tasks, plans, and metadata.
  - Added strict runtime assertions for record shape, timestamp and enum validity, effort provenance, unique dependencies and assumptions, and plan/task consistency.
  - Added independent transcript and task writes, atomic task-plus-plan commits, stale-revision rejection, current snapshot loading, and delete-all behavior.
  - Found and fixed an upgrade-event boundary bug through the first automated schema test run.
  - Added deterministic IndexedDB tests using the Apache-2.0 licensed `fake-indexeddb` development dependency; it does not ship in the production runtime.
- Human product and engineering decisions preserved:
  - Use the browser's native IndexedDB API rather than introducing a production wrapper dependency.
  - Confirmed transcripts can survive a later reasoning failure, and the last valid plan cannot be replaced by a stale or invalid response.
  - AI effort estimates remain visibly distinguishable from user-stated or user-edited values.
  - Audio blobs are not part of the durable schema.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 4 files and 12 tests passed.
  - Coverage includes store/index creation, round trips, atomic commits, stale-plan preservation, invalid-record rejection, and complete local-data clearing.
  - `pnpm build`: pass.

## 2026-07-18 — responsive local-first PWA shell

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Implement Flownee's responsive application shell and the home-screen states required before local persistence and voice capture are connected.
- Codex contributions:
  - Built state-driven empty, loading, saved-plan, updating, all-complete, and offline presentations.
  - Added a fictional sample plan and explicit URL-driven preview fixtures without seeding fictional content into the default user experience.
  - Added the install manifest, repository-owned SVG app icon, production service-worker registration, and a shell-only offline fallback that bypasses all API traffic.
  - Preserved one prominent next action, its editable-estimate language, a concise reason, an ordered upcoming list, and the persistent voice-capture position.
  - Verified desktop and mobile layouts in a real browser, including overflow and console checks.
- Human product and engineering decisions preserved:
  - Users may open Flownee only to see what to do now, so the current valid recommendation remains the visual priority.
  - Voice remains the only capture method; disabled action affordances clearly reserve later task-action and recording behavior without pretending those integrations are complete.
  - User content remains local-first and account-free; the Cache API stores no task, transcript, plan, or API response data.
- Human design direction preserved:
  - Calm green visual system, generous spacing, plain-language explanations, and non-judgmental completion language.
  - Mobile capture action remains reachable while desktop uses a focused recommendation-plus-upcoming layout.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 3 files and 6 tests passed.
  - `pnpm build`: pass; `/`, `/icon.svg`, and `/manifest.webmanifest` generated successfully.
  - Manifest and service-worker endpoints: HTTP 200 with correct content types; API bypass present.
  - Browser: 1440×900 sample plan and 390×844 empty/sample states checked; no horizontal overflow or console errors.

## 2026-07-18 — shadcn/ui foundation

- Session ID: `TBD` (not expected to be the majority-core-functionality session)
- Objective: Establish reusable UI conventions for Flownee without beginning new MVP functionality.
- Codex contributions:
  - Verified the current shadcn/ui Tailwind v4 and React conventions.
  - Added CLI-compatible component configuration, semantic design tokens, and the shared class-merging utility.
  - Implemented reusable Button, Card, and Badge primitives with variants, focus states, disabled states, and `data-slot` hooks.
  - Added unit coverage for conditional and conflicting Tailwind class merging.
  - Reviewed the direct UI dependencies; their licenses are MIT, Apache-2.0, or ISC.
- Human product and engineering decisions preserved:
  - Keep this milestone to reusable UI foundations; do not expand the MVP.
  - Use Tailwind CSS and shadcn/ui conventions in the Next.js TypeScript application.
  - Maintain Flownee's calm, friendly visual direction through semantic tokens rather than page-specific styling.
- Verification:
  - `pnpm peers check`: pass.
  - `pnpm lint`: pass.
  - `pnpm test`: 2 files and 3 tests passed.
  - `pnpm build`: pass; `/` and `/_not-found` generated successfully.

## 2026-07-18 — Product definition and repository baseline

- Session ID: `TBD` (not expected to be the majority-core-functionality session)
- Objective: Define Flownee and establish a clean Next.js TypeScript repository baseline.
- Codex contributions:
  - Converted the official rules and confirmed product decisions into persistent repository guidance.
  - Created the Next.js, TypeScript, Tailwind, ESLint, and Vitest baseline.
  - Added a safe environment template, MIT License, README, package lockfile, and supply-chain build policy.
  - Resolved Next.js peer compatibility by pinning ESLint 9 and TypeScript 6 rather than unsupported newer majors.
  - Established and ran lint, unit-test, peer-dependency, and production-build gates.
- Human product decisions:
  - Voice-only capture with text review and correction.
  - Incremental capture throughout the day and automatic update of **What to do now**.
  - Apps for Your Life track and busy-adult/working-parent primary audience.
  - Account-free, local-first task storage and no permanent audio retention.
- Human engineering decisions:
  - Next.js, TypeScript, Tailwind CSS, shadcn/ui, Netlify, and IndexedDB direction.
  - GPT-4o Transcribe for speech-to-text and GPT-5.6 for central reasoning.
  - Supabase deferred and API expenditure capped at $10.
  - Public GitHub repository with MIT License.
- Human design decisions:
  - A calm, friendly, non-judgmental personality.
  - The home screen shows the last valid next action immediately and keeps voice capture continuously accessible.
- Verification:
  - `pnpm peers check`: pass.
  - `pnpm lint`: pass.
  - `pnpm test`: 1 test passed.
  - `pnpm build`: pass; `/` and `/_not-found` generated successfully.
- Public repository:
  - https://github.com/landofcash/flownee
