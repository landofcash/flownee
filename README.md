# Flownee

Flownee is a calm, voice-first AI productivity assistant that turns spoken everyday intentions into a continuously updated answer to: **What should I do now?**

Flownee is being built from scratch for the OpenAI Build Week **Apps for Your Life** track.

## Current status

The repository baseline is initialized. The product implementation is in progress; see [`docs/execution/TASKS.md`](docs/execution/TASKS.md).

## Technology baseline

- Next.js and TypeScript
- Tailwind CSS
- Vitest
- ESLint
- pnpm
- Netlify deployment target

Planned AI workflow:

- GPT-4o Transcribe converts voice recordings to text.
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

Do not place a real OpenAI key in a committed file. AI routes are not implemented in the baseline.

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
- Implementation plan: [`docs/execution/IMPLEMENTATION_PLAN.md`](docs/execution/IMPLEMENTATION_PLAN.md)
- Hackathon rules: [`docs/compliance/HACKATHON_RULES.md`](docs/compliance/HACKATHON_RULES.md)

## License

MIT. See [`LICENSE`](LICENSE).
