# Flownee usability test

Status: **Expert walkthrough complete; representative participant round pending**
Last updated: 2026-07-18
Production build: https://flownee-build-week.netlify.app

## Claim boundary

The completed session was an expert task walkthrough, not participant research.
No representative users were available in this workspace, so the team must not
claim that "most participants" succeeded yet. The participant table below must
contain real observed sessions only.

## Confirmed success measures

| Success measure | Walkthrough result | Evidence or remaining test |
|---|---|---|
| Voice capture starts with one tap from home | **Pass for discoverability and interaction count** | The first-run screen exposes one prominent button named `Add an intention by voice`; previous real Chrome evidence confirms the button starts recording after permission. A fresh microphone session was not run because it could capture ambient speech. |
| Capture and confirm a new intention in under 30 seconds | **Not measured** | Time this with every representative participant from first tap through transcript confirmation. |
| One recording separates multiple intentions correctly | **Not measured in usability session** | Covered by schema fixtures and implementation tests; requires one fictional live participant recording for usability evidence. |
| No confirmed item is lost if planning fails | **Implementation evidence only** | Automated persistence and failure tests pass; participant recovery comprehension remains untested. |
| Existing plan appears immediately on open | **Partial** | The first-run local-loading message explains that no AI call is made; automated storage tests cover reload. Repeat with participant-created local data. |
| **What to do now** updates after additions/status changes | **Implementation evidence only** | Automated state and stale-response tests pass. Observe this in the participant journey. |
| Recommendation includes an understandable reason | **Pass for expert comprehension** | The sample makes `Start the dark-clothes wash` prominent and immediately explains that it takes little active time while the machine runs. |
| Users can correct transcripts, interpretations, and estimates | **Implementation evidence only** | Controls exist and are automated-test covered; the full voice journey was not activated in this session. |
| Local state survives refresh and reopen | **Implementation evidence only** | IndexedDB tests pass; repeat using participant-created data. |
| Full journey works on primary browsers | **Open** | See `docs/technical/PLATFORM_TEST_MATRIX.md`; physical Android and other declared browsers remain incomplete. |
| Most small-test participants capture an item and understand the next recommendation without help | **Not assessed** | Requires at least three representative sessions; a majority must complete both tasks without help. |

## Walkthrough setup

- Evaluator: Codex acting as an expert evaluator, not a target user.
- Browser surface: isolated Chrome 150-compatible Chromium session.
- Viewport: `390x844` mobile layout.
- Data: clean first-run state and the public fictional sample at
  `/?demo=sample`.
- Provider use: none.
- Microphone use: none; ambient audio was not captured or transmitted.

## Observations

### What worked

- The first-run page explains the value before asking for input.
- The single voice button has a clear accessible name, a `64x64` tap target,
  remains visible 16 pixels above the mobile viewport bottom, and needs no
  horizontal scrolling.
- "Speak naturally. Organize later." communicates low capture effort.
- The sample establishes a clear visual hierarchy: one next action, effort,
  reason, then the ordered upcoming list.
- The recommendation reason is concise and explains parallel use of time.
- Local-storage and voice-processing boundaries are surfaced on the home page.

### Findings

| Priority | Finding | Why it matters | Recommended follow-up |
|---|---|---|---|
| High | The fictional sample shows disabled `Done`, `Do later`, and more-action controls without explaining that the preview is read-only. | A judge or participant may interpret the disabled controls as a broken application. | Label the sample clearly as a read-only fictional preview and provide one short explanation near the controls, or make the preview seed disposable local data so actions can be demonstrated. |
| Medium | Product terminology alternates between `What makes sense next`, `What should I do now?`, and `Do this now`. | All phrases are understandable, but variation weakens the central product promise and may complicate recall in a short demo. | Select one primary phrase and use the others only as supporting language. |
| Medium | Several success measures rely on implementation evidence because the full voice journey was not run in this session. | Technical correctness does not establish that a target user understands the interaction. | Complete the representative protocol below on the deployed app. |

No critical accessibility, overflow, first-run comprehension, or
recommendation-comprehension blocker was observed in the expert walkthrough.

## Five-minute representative-participant protocol

Recruit three to five adults who resemble the primary audience. Use a clean
browser profile or delete local Flownee data before each session. Use fictional
tasks only.

Do not explain Flownee before starting. Read only the prompts below and do not
help unless the participant is blocked; record every intervention.

1. **Capture:** "You just remembered that you need to pay the electricity bill
   and call Maria. Add both to this app."
2. **Comprehension:** "Without changing anything, tell me what the app thinks
   you should do next and why."
3. **Correction:** "Imagine one word or effort estimate is wrong. Show me how
   you would correct it."
4. **Status change:** "Mark the recommended action done or postpone it. Tell me
   what changed."
5. **Persistence:** Close and reopen Flownee, then ask: "What would you do next
   now?"

After the tasks, ask:

- What, if anything, was confusing?
- Did the tone feel calm, pressuring, or neutral?
- Did you trust the recommendation? Why?
- What did you think was stored on this device or sent for processing?

## Measurements and thresholds

- Start the capture timer on the first tap; stop it when the participant
  confirms the transcript. Target: under 30 seconds.
- `Unassisted capture`: no hint beyond the task prompt.
- `Understood recommendation`: participant identifies both the top action and
  a substantially correct reason.
- Product threshold: a majority of participants completes both unassisted
  capture and recommendation comprehension.
- Record transcription/extraction correctness separately from usability.

## Participant results

| Participant | Audience fit | Device/browser | Capture seconds | Two tasks separated | Unassisted capture | Understood action and reason | Corrected content | Status update understood | Reopen preserved state | Notes/interventions |
|---|---|---|---:|---|---|---|---|---|---|---|
| P1 | Pending | Pending |  |  |  |  |  |  |  |  |
| P2 | Pending | Pending |  |  |  |  |  |  |  |  |
| P3 | Pending | Pending |  |  |  |  |  |  |  |  |

## Decision rule

Mark the participant usability task complete only after the real table is
filled and the majority threshold is calculated. Record failures as findings;
do not silently coach participants or replace outcomes with synthetic personas.
