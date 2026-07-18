# Flownee Codex Instructions

## Mission

Build Flownee for the OpenAI Build Week **Apps for Your Life** track. Flownee is a calm, voice-first personal productivity PWA that turns spoken everyday intentions into a continuously updated answer to: **“What should I do now?”**

The submission deadline is **July 21, 2026 at 5:00 PM Pacific Time** (July 22 at 1:00 AM WEST in Lisbon).

## Required reading

Before making material product, architecture, or implementation changes, read:

1. `docs/product/PROJECT_BRIEF.md`
2. `docs/product/MVP_SCOPE.md`
3. `docs/technical/ARCHITECTURE.md`
4. `docs/execution/TASKS.md`
5. `docs/compliance/COMPLIANCE_CHECKLIST.md`

Read `docs/compliance/HACKATHON_RULES.md` before changing the AI workflow, repository access, demo, testing path, or submission materials.

## Product invariants

- Task capture is voice-only; text is available to review and correct transcripts and AI interpretations.
- The home screen immediately shows the last valid **Do this now** recommendation.
- The user can add a spoken intention from the home screen in one tap.
- Every confirmed addition updates the current execution flow automatically.
- Flownee must distinguish user-stated facts from AI estimates and assumptions.
- The user remains able to edit, complete, postpone, and delete items.
- The tone is calm, friendly, concise, and non-judgmental.
- Core data is local-first and account-free.

## Technical boundaries

- Use TypeScript and Next.js.
- Use Tailwind CSS and shadcn/ui for the interface.
- Deploy to Netlify as an installable responsive PWA.
- Store confirmed transcripts, tasks, preferences, task state, and plans in IndexedDB.
- Do not expose OpenAI keys to the browser. OpenAI requests must pass through protected server-side routes.
- Use GPT-4o Transcribe for speech-to-text.
- Use GPT-5.6 for structured task extraction, clarification, reasoning, and execution planning.
- Do not retain audio after successful transcription by default.
- Supabase is deferred unless a concrete server-persistence requirement is approved.
- Do not introduce accounts, calendar integration, background listening, push reminders, multi-device sync, routine learning, or location-aware recommendations into the MVP.

## Implementation rules

- Work in small, testable increments following `docs/execution/IMPLEMENTATION_PLAN.md`.
- Keep one active task under `Now` in `docs/execution/TASKS.md`.
- Preserve the last valid plan while transcription or replanning is in progress.
- Never lose a confirmed item because an AI request failed.
- Validate model outputs against a strict schema before saving them.
- Keep model input compact and never send unrelated local data.
- Do not log recordings, full transcripts, personal task contents, or secrets.
- Add no dependency, dataset, API, font, icon set, image, or media without checking its license and terms.
- Record consequential human product, engineering, and design decisions for the later Codex collaboration narrative.
- Add a concise entry to `docs/execution/CODEX_SESSION_LOG.md` after each material Codex work session.

## Commands

- Install: `pnpm install --frozen-lockfile`
- Develop: `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Build: `pnpm build`

## Definition of done

A task is complete only when:

- Its acceptance criteria pass.
- Relevant automated or manual verification passes.
- Loading, empty, error, and recovery states are handled where applicable.
- No secrets or unauthorized third-party material were added.
- Documentation affected by the change remains accurate.
- `docs/execution/TASKS.md` is updated with evidence and a clear handoff.
