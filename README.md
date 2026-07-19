# Flownee

Flownee is a calm, voice-first AI productivity assistant that turns spoken everyday intentions into a continuously updated answer to: **What should I do now?**

Flownee is being built from scratch for the OpenAI Build Week **Apps for Your Life** track.

## Current status

The voice-to-plan journey, local task actions, privacy controls, and protected
AI routes are implemented. The default home screen shows the truthful
first-run empty state; fictional state previews remain available locally at
`/?demo=sample`, `/?demo=updating`, `/?demo=complete`, and `/?demo=loading`.
Product implementation remains in progress; see
[`docs/execution/TASKS.md`](docs/execution/TASKS.md).

Public deployment: [flownee-build-week.netlify.app](https://flownee-build-week.netlify.app)

## Technology baseline

- Next.js and TypeScript
- Tailwind CSS with shadcn/ui-compatible primitives
- Native IndexedDB for account-free local persistence
- Vitest
- ESLint
- pnpm
- Netlify production deployment

AI workflow:

- GPT-4o Transcribe converts bounded temporary voice recordings to editable text through a protected server route.
- GPT-5.6 extracts structured intentions and updates the execution flow.

## Local setup

Prerequisites:

- Node.js 20.9 or newer
- pnpm 11

```bash
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

Do not place a real OpenAI key in a committed file. Set `OPENAI_API_KEY` and
`AI_FEATURES_ENABLED=true` only in `.env.local` or the deployment environment.
Set it to `false` to stop both paid AI routes immediately while preserving the
local experience. Optional `AI_RATE_LIMIT_WINDOW_SECONDS`,
`AI_TRANSCRIBE_RATE_LIMIT`, and `AI_PLAN_RATE_LIMIT` values control the
best-effort per-client limits described in `.env.example`.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
```

## Project documentation

- Product brief: [`docs/product/PROJECT_BRIEF.md`](docs/product/PROJECT_BRIEF.md)
- MVP scope: [`docs/product/MVP_SCOPE.md`](docs/product/MVP_SCOPE.md)
- Architecture: [`docs/technical/ARCHITECTURE.md`](docs/technical/ARCHITECTURE.md)
- Supported-platform evidence: [`docs/technical/PLATFORM_TEST_MATRIX.md`](docs/technical/PLATFORM_TEST_MATRIX.md)
- Implementation plan: [`docs/execution/IMPLEMENTATION_PLAN.md`](docs/execution/IMPLEMENTATION_PLAN.md)
- Hackathon rules: [`docs/compliance/HACKATHON_RULES.md`](docs/compliance/HACKATHON_RULES.md)

## License

MIT. See [`LICENSE`](LICENSE).
