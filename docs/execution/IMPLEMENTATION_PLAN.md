# Flownee Implementation Plan

## Delivery principle

Build a vertical, testable voice-to-action slice first. Do not start optional integrations or polish until the complete critical journey works on the public deployment.

## Milestone 0 — Repository and compliance baseline

Deliverables:

- Public repository with MIT License.
- Next.js TypeScript project scaffold.
- Environment-variable example with placeholders only.
- Initial test, lint, and build commands documented in `AGENTS.md`.
- Dated Codex session and human-decision recording process established.

Acceptance:

- Clean clone installs and builds.
- No secret is present in repository history.
- Compliance checklist has owners and current statuses.

## Milestone 1 — Local-first PWA shell

Deliverables:

- Responsive Next.js home screen using Tailwind and shadcn/ui.
- Installable PWA metadata and safe caching baseline.
- IndexedDB repositories for tasks, transcripts, and current plan.
- Empty, existing-plan, offline, and all-complete states.
- Fictional sample data fixture.

Acceptance:

- Stored plan renders immediately after refresh/reopen without an API request.
- Delete-all-local-data works.
- Mobile and desktop layouts are coherent.

## Milestone 2 — Voice capture and transcription

Deliverables:

- Central one-tap microphone action.
- Recording, stop, cancel, permission-denied, unsupported, and retry states.
- Bounded temporary audio capture.
- Protected server transcription route using GPT-4o Transcribe.
- Editable transcript review.

Acceptance:

- A supported browser records and transcribes a 60–90 second-or-shorter sample.
- OpenAI credentials are absent from the browser bundle.
- Failed transcription does not silently lose the temporary recording.
- Logs contain no audio or transcript content.

## Milestone 3 — GPT-5.6 extraction and planning

Deliverables:

- Strict request and response schemas.
- GPT-5.6 reasoning route.
- Multiple-intention extraction.
- Visible facts, estimates, and assumptions.
- Updated ordered plan with one next action and concise rationale.
- Atomic local persistence and plan revision handling.

Acceptance:

- One transcript with multiple intentions creates multiple editable tasks.
- New confirmed items update **What to do now**.
- Invalid or failed model responses preserve the last valid plan and confirmed user content.
- Representative fixtures pass schema and behavioral tests.

## Milestone 4 — Task actions and continuous flow

Deliverables:

- [x] Complete, postpone, edit, and delete actions.
- [x] Immediate local UI update plus replanning where required.
- [x] Stale-response protection when state changes during a request.
- [x] Cost controls, throttling, timeouts, and emergency kill switch.

Acceptance:

- Each material state change produces a consistent plan.
- Concurrent or delayed responses cannot overwrite newer state.
- No model call occurs when the app merely opens.
- API usage stays within the agreed $10 total ceiling during controlled testing/judging.

## Milestone 5 — Cross-platform and product-quality pass

Deliverables:

- Chrome desktop, Chrome Android, and Edge verification.
- Best-effort Safari iPhone/iPad verification.
- Accessibility and keyboard review for non-capture controls.
- Loading, error, retry, empty, offline, and recovery polish.
- Small usability test with representative participants.

Acceptance:

- Critical journey passes on primary and secondary browsers.
- Safari limitations are documented honestly.
- Most small-test participants capture an item and understand the next recommendation without assistance.
- Recommendations remain calm, concise, editable, and explainable.

## Milestone 6 — Judge-ready release

Deliverables:

- Public Netlify deployment.
- Final README and testing instructions.
- Codex collaboration evidence and majority-core-functionality `/feedback` Session ID.
- Judging scorecard, demo script, Devpost draft, and final checklist.
- Public YouTube demonstration video under three minutes.

Acceptance:

- Clean setup and signed-out judge path pass.
- Deployment requires no account, payment, invitation, or API key.
- Repository, deployment, and video URLs work while signed out.
- Demo, description, and delivered behavior match.
- All compliance checklist blockers are cleared before submission.

## Critical dependency order

1. Local data model and home screen.
2. Browser audio compatibility proof.
3. Server-side transcription proof.
4. GPT-5.6 structured-output proof.
5. End-to-end persistence and failure recovery.
6. Public deployment and cross-platform testing.
7. Submission artifacts.

## Principal risks

| Risk | Mitigation |
|---|---|
| Browser audio-format inconsistency | Test a minimal recorder on target browsers before UI expansion |
| Model output inconsistency | Strict schema, fixtures, validation, and last-valid-plan fallback |
| API abuse exhausts $10 budget | Server throttling, duration limits, usage alerts, kill switch |
| Planning latency harms capture flow | Preserve old plan, explicit progress, compact context, bounded timeout |
| Confirmed item lost after failure | Persist pending/confirmed content before replacing the plan |
| Scope expansion | Enforce `MVP_SCOPE.md`; defer integrations and accounts |
| Judge microphone unavailable | Provide fictional sample path and complete public video |
| Submission documentation left late | Begin README, testing instructions, session evidence, and Devpost draft before final polish |
