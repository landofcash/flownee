# Codex Session Log

Use this file to preserve evidence of Codex contributions and human judgment. Do not record secrets, personal task content, raw recordings, or private transcripts.

The `/feedback` Session ID required by the hackathon must come from the project task where most core functionality is built. A baseline or documentation session should not be presented as that session unless it genuinely contains the majority of core functionality.

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
