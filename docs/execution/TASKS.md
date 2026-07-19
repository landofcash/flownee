# Flownee Tasks

Keep exactly one implementation task under **Now**. Move completed items to **Done** with test, commit, deployment, or screenshot evidence.

## Now

- [ ] Run three to five representative participant sessions using `docs/evaluation/USABILITY_TEST.md`, record real outcomes, and calculate the majority threshold.

## Next

- [ ] Prepare README, testing instructions, Codex session evidence, scorecard, demo script, and Devpost draft.

## Blocked

- Participant-based usability success requires representative humans. The expert walkthrough is complete; participant outcomes must not be invented.

## Done

- [x] Restyled the bottom voice action as a classical rectangle and enlarged its title without overlap. Evidence: the panel has a measured `0px` corner radius, `Add by voice` is `16px`/semibold with a `20px` line height, and the unchanged `64px` microphone has `9px` of clear space above the title at narrow and `1440px` widths; no horizontal overflow; 54 tests, lint, and production build pass.

- [x] Extended the bottom `Add by voice` panel to the maximum available horizontal space. Evidence: the footer's horizontal padding is removed, so the action fills the footer content width at the narrow browser viewport and the complete `430px` desktop app shell; only the shell's `0.8px` border remains on each edge, with no horizontal overflow; 54 tests, lint, and production build pass.

- [x] Extended the unchanged-width `Add by voice` action downward into a full bottom panel. Evidence: the button keeps its existing top and horizontal position, grows from `80px` to `96px` when the baseline safe area is `16px`, reaches the viewport bottom at narrow and `1440px` widths, retains the `64px` microphone and `7px` title gap, uses a less pill-like `16px` radius, and shows no overflow or console errors; 54 tests, lint, and production build pass.

- [x] Refined the bottom voice action's text spacing without changing its structure or dimensions. Evidence: `Add by voice` is now `14px`/semibold, centered approximately `7px` below the unchanged `64px` microphone circle; subtitle position remains compact; narrow and `1440px` viewport checks show no overflow or console errors; 54 tests, lint, and production build pass.

- [x] Constrained the desktop application to a centered `430px` mobile-style shell, including the home content, single-column task flow, fixed voice bar, and modal widths. Evidence: desktop browser measurement at `1440x900` showed both app shell and voice bar at exactly `430px`, centered with no horizontal overflow or console errors; 54 tests, lint, and production build pass.

- [x] Replaced the small circular voice control with a large bottom-fixed call-to-action based on the product-owner sketch. Evidence: the full `Add by voice` control is clickable; its microphone medallion is centered across the top edge; the existing `Tap once and speak naturally` guidance remains inside the button; measured at approximately `343x80` CSS pixels on a `390x844` mobile viewport and `576x80` on desktop; no horizontal overflow or browser console errors; 54 tests, lint, and production build pass.

- [x] Conducted an expert usability walkthrough against the confirmed success measures and prepared the representative test protocol. Evidence: public first-run and fictional sample inspected in an isolated Chrome 150-compatible browser at `390x844`; single `64x64` voice control visible 16 px above the viewport bottom; no horizontal overflow; next action and reason understandable; no microphone/provider use; read-only sample-control ambiguity documented. This is not participant research, so the majority-participant measure remains open.

- [x] Deployed Flownee publicly to Netlify and ran the available supported-platform matrix. Evidence: production URL `https://flownee-build-week.netlify.app`; latest ready deploy `6a5cc2dff6f76e3dde4de76e` from repository commit `f417def`; signed-out HTTP 200 for home, manifest, and AI-status routes after the latest deployment; earlier full smoke coverage includes the fictional demo, service worker, icon, and recording diagnostic; AI status enabled; both paid routes reject untrusted origins with HTTP 403 before provider use; Windows Chrome-engine recording/layout evidence documented. Physical Android, macOS Chrome, Edge journey, and Safari checks remain explicitly deferred or unavailable and are not represented as passes.

- [x] Added the privacy notice, atomic delete-all-local-data control, request limits, throttling, and emergency kill switch. Evidence: responsive privacy/data panel with precise local/OpenAI data boundaries and two-step deletion; `/api/ai-status` preflight before microphone permission; authoritative paid-route switch checks; configurable per-client fixed-window limits with HTTP 429, `Retry-After`, and provider-call prevention; 54 passing tests, lint, production build, and browser verification of the mobile dialog and empty-origin deletion with no overflow or console errors. No live provider call was made.

- [x] Implemented complete, postpone, edit, delete, restore, and stale-response protection. Evidence: immediate atomic IndexedDB mutation with revision increments and dependency cleanup; valid local provisional plans; transcript-free GPT-5.6 replanning that cannot create tasks; abort plus revision-based late-response rejection; responsive manage/edit/delete confirmation UI; saved completed/postponed items; 47 passing tests, lint, production build, and 390×844 browser verification with no overflow or console errors. No live provider call was made.

- [x] Implemented interpretation review and automatic replanning. Evidence: protected same-origin `/api/plan` Responses route; explicit `gpt-5.6-sol`/`medium`, strict output parsing and refusal handling; confirmed-transcript-first recovery; editable extracted titles, notes, and effort; visible provenance, deadlines, assumptions, and clarifications; required assumption confirmation; atomic task/plan commit with temporary-reference mapping and revision checks; local home-state reload; 42 passing tests, lint, production build, and 390×844 browser shell verification with no overflow or console warnings. One bounded fictional live call reached OpenAI but returned HTTP 429, so successful live-output scoring remains outstanding.
- [x] Defined the GPT-5.6 planning contract and executable evaluation baseline. Evidence: explicit `gpt-5.6-sol`/`medium` Responses configuration, strict versioned input/output JSON Schemas, lean prompt, semantic rejection of unknown/duplicate/incomplete/inconsistent plans and invented deadline provenance, six representative fixtures including incremental replanning, empty speech, and transcript prompt injection, 33 passing tests, lint, and production build.
- [x] Implemented the protected GPT-4o Transcribe route and editable transcript-review flow. Evidence: server-only key and feature switch, same-origin browser protection, 6 MiB/type validation, 45-second provider timeout, safe errors, no-store responses, one-tap 90-second recorder, cancel/retry/re-record states, temporary Blob retention on failure, confirmed IndexedDB transcript persistence, permission-race protection, 22 passing tests, production build, and mobile production-browser verification with no console errors.
- [x] Established the browser recording and MIME-format strategy. Evidence: real Windows Chrome 150 engine recording passed with WebM/Opus, 47,639 bytes, 3,004 ms, and one audio track; Android support accepted by the product owner as a provisional development assumption with physical-device verification explicitly deferred to the cross-platform release gate.
- [x] Implemented the no-upload recording diagnostic and proved recording in the available Windows Chrome 150 engine. Evidence: secure context, microphone, and MediaRecorder APIs available; WebM/Opus preferred and produced; 47,639-byte Blob, 3,004 ms, one audio track; MP4 reported supported; Ogg reported unsupported; permission timeout and recovery guidance included; 15 tests, lint, and production build passing.
- [x] Defined and tested native IndexedDB schemas and repositories for transcripts, tasks, execution plans, and revision metadata. Evidence: runtime record validation, provenance fields, indexed version-1 stores, atomic task/plan commits, stale-plan rejection, snapshot loading, delete-all transaction, Apache-2.0 test dependency review, 12 passing tests, lint, and production build.

- [x] Implemented the responsive local-first PWA shell and home-screen states. Evidence: empty, saved-plan, updating, all-complete, loading, and browser-offline UI paths; fictional demo fixtures; install manifest, owned SVG icon, API-bypassing service worker; responsive browser checks at 1440×900 and 390×844 with no horizontal overflow or console errors; 6 unit tests, lint, and production build passing.
- [x] Scaffolded the shadcn/ui foundation without expanding product scope. Evidence: `components.json`, semantic Tailwind v4 theme tokens, tested `cn` utility, Button/Card/Badge primitives, permissive-license dependency review, and passing peer, lint, unit-test, and production-build checks.
- [x] Completed Milestone 0 — repository and compliance baseline. Evidence: public `main` repository at https://github.com/landofcash/flownee, commit `34af729`, clean dependency install, and passing peer, lint, test, build, and credential-scan checks.
- [x] Confirmed project idea, audience, problem evidence, value proposition, MVP, architecture direction, team, platform, privacy model, success measures, and repository strategy. Evidence: product discovery conversation completed July 18, 2026.
- [x] Created the minimum pre-development Markdown documentation set. Evidence: files under `docs/` plus root `AGENTS.md`.
- [x] Initialized the local Git repository on `main`. Evidence: local `.git` metadata created July 18, 2026.
- [x] Established the Next.js TypeScript baseline with Tailwind CSS, ESLint, Vitest, pnpm lockfile, MIT License, safe `.env.example`, and setup README. Evidence: `pnpm lint`, `pnpm test`, and `pnpm build` all pass.
- [x] Connected the verified public GitHub repository. Evidence: https://github.com/landofcash/flownee.

## Build-generated information still required

- Successful live GPT-5.6 fixture results, token use, latency, and final reasoning comparison (the implemented `gpt-5.6-sol`/`medium` call reached OpenAI but returned HTTP 429 on July 18, 2026).
- Supported audio MIME-format results per browser.
- Codex `/feedback` Session ID from the task where most core functionality is built.
- Public YouTube demonstration URL.
- Devpost submission URL and confirmation timestamp.

## Session handoff

- Current state: The complete local-first product journey is publicly deployed with protected AI routes enabled; all automated and signed-out production smoke gates pass.
- Next action: Run the prepared five-minute protocol with three to five representative participants and record real results.
- Known failures: No code failures. A bounded fictional GPT-5.6 request reached the provider but returned HTTP 429; automated provider boundaries and all local gates pass.
- Uncommitted decisions: Final GPT-5.6 reasoning effort after live fixture evaluation; physical Android audio verification remains deferred.
