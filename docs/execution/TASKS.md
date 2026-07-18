# Flownee Tasks

Keep exactly one implementation task under **Now**. Move completed items to **Done** with test, commit, deployment, or screenshot evidence.

## Now

- [ ] Scaffold shadcn/ui conventions and the first reusable UI primitives without expanding the MVP scope.

## Next

- [ ] Implement the responsive local-first PWA shell and home-screen states.
- [ ] Define and test IndexedDB schemas for transcripts, tasks, and execution plans.
- [ ] Prove browser recording and audio formats on Chrome desktop and Android.
- [ ] Implement the protected GPT-4o Transcribe route and transcript review.
- [ ] Define GPT-5.6 structured input/output schemas and evaluation fixtures.
- [ ] Implement interpretation review and automatic replanning.
- [ ] Implement complete, postpone, edit, delete, and stale-response protection.
- [ ] Add privacy notice, delete-all-data control, request limits, throttling, and kill switch.
- [ ] Deploy to Netlify and run the supported-platform test matrix.
- [ ] Conduct a small usability test against the confirmed success measures.
- [ ] Prepare README, testing instructions, Codex session evidence, scorecard, demo script, and Devpost draft.

## Blocked

- None.

## Done

- [x] Confirmed project idea, audience, problem evidence, value proposition, MVP, architecture direction, team, platform, privacy model, success measures, and repository strategy. Evidence: product discovery conversation completed July 18, 2026.
- [x] Created the minimum pre-development Markdown documentation set. Evidence: files under `docs/` plus root `AGENTS.md`.
- [x] Initialized the local Git repository on `main`. Evidence: local `.git` metadata created July 18, 2026.
- [x] Established the Next.js TypeScript baseline with Tailwind CSS, ESLint, Vitest, pnpm lockfile, MIT License, safe `.env.example`, and setup README. Evidence: `pnpm lint`, `pnpm test`, and `pnpm build` all pass.
- [x] Connected the verified public GitHub repository. Evidence: https://github.com/landofcash/flownee.

## Build-generated information still required

- Netlify deployment URL.
- Exact GPT-5.6 model ID and tested configuration.
- Supported audio MIME-format results per browser.
- Codex `/feedback` Session ID from the task where most core functionality is built.
- Public YouTube demonstration URL.
- Devpost submission URL and confirmation timestamp.

## Session handoff

- Current state: Milestone 0 is complete locally; the minimal application shell builds and tests successfully.
- Next action: Scaffold shadcn/ui conventions and begin the local-first PWA home-screen shell.
- Known failures: None.
- Uncommitted decisions: IndexedDB wrapper, GPT-5.6 family model ID, and audio-format strategy.
