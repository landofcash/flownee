# Flownee Project Brief

## One-line concept

**Flownee is a calm, voice-first AI productivity assistant that turns spoken everyday intentions into a continuously updated answer to: “What should I do now?”**

## Working title and track

- Product name: **Flownee**
- Hackathon track: **Apps for Your Life**
- Product form: Installable, responsive Progressive Web App

## Target users

### Primary audience

Busy adults aged 30–50, especially working parents and people managing many small personal, household, family, social, shopping, and administrative responsibilities.

### Secondary audiences

- Young professionals aged 22–30 who feel overwhelmed by scattered everyday tasks.
- Adults aged 50–65 who want a simple voice-first way to capture responsibilities and understand what to do next.

## Problem

Busy adults accumulate small but mentally persistent intentions across different parts of life. These items are often too informal, flexible, or minor for a calendar or structured task-management system. Recording, categorizing, prioritizing, scheduling, and maintaining them manually creates additional organizational work when the user is already overloaded.

As a result, intentions remain in memory, disappear, or are repeatedly postponed.

## Early evidence

Early problem evidence comes from:

- The founder's first-hand experience.
- A detailed second household case from her husband.
- Ten informal interviews with friends.

Participants repeatedly described small, non-urgent intentions that remain in memory because they do not feel important enough for formal calendars or task systems. Examples included researching family activities, reviewing recommendations, calling friends, comparing providers, finding household products, planning children's activities, and completing small repairs.

Participants associated completing these items with greater calm, control, satisfaction, and efficiency.

This is early qualitative evidence from a small convenience sample. It supports exploration but is not representative market research.

## Product validation

Validation continued beyond the initial problem interviews. The team reports
that independent validation was conducted during and after product development.
The product and voice-first approach continued to resonate, and users reported:

- forgetting fewer everyday tasks;
- experiencing less mental clutter; and
- greater day-to-day satisfaction.

These outcomes are qualitative and self-reported. The available project record
does not specify the participant count, recruitment method, standardized
instrument, comparison baseline, effect size, or observation period. The
results therefore support the product's potential impact but must not be
described as statistically representative, experimentally controlled, or proof
that Flownee alone caused the reported changes.

## Product hypothesis

If people can capture informal intentions immediately through natural voice and receive an automatically updated, explainable execution flow, fewer intentions will be forgotten and users will spend less mental effort deciding what to do next.

## Solution

Flownee provides a persistent voice inbox used incrementally throughout the day:

1. The user opens Flownee when a task or idea occurs.
2. The user taps the central microphone button and speaks naturally.
3. GPT-4o Transcribe produces an editable transcript.
4. GPT-5.6 separates and interprets the intentions.
5. Confirmed items are added to the local collection.
6. GPT-5.6 reevaluates the active items immediately.
7. Flownee updates **Do this now** and the remaining execution flow.

When the user opens Flownee only to check what to do, the last valid plan loads immediately without an AI request.

## Intentional next-action language

Flownee uses **What should I do now?**, **What makes sense next?**, and **Do this
now** as contextual expressions of one product concept: the current recommended
next action. **What should I do now?** voices the user's need, **What makes sense
next?** communicates Flownee's calm guidance, and **Do this now** fits compact
action surfaces. Their use varies by context, screen size, and tone; it does not
represent different functionality or an inconsistent product promise.

## Value proposition

**Capture naturally; organize automatically; act with less friction.**

Flownee bridges the gap between a passing thought and a completed action. It accepts casual and important responsibilities without requiring the user to maintain a productivity system manually.

The intended benefit is freedom from productivity-system maintenance. The user
does not have to decide how to categorize a thought, construct a prompt, keep a
chatbot's context current, or continuously reorganize a list. A quick spoken
capture is enough; Flownee performs the organizational work and returns one
clear next-action suggestion while preserving user control.

Candidate tagline:

> From what's on your mind to what makes sense next.

## Differentiation

| Alternative | Existing strength | Flownee difference |
|---|---|---|
| Built-in voice assistant | Creates individual reminders, timers, or events | Reasons across the user's complete mix of active intentions |
| Voice notes | Captures thoughts quickly | Converts recordings into structured, actionable items and a next action |
| Conventional task app | Manages carefully entered tasks | Minimizes manual classification, estimation, and prioritization |
| Calendar | Manages fixed-time commitments | Keeps flexible activities flexible instead of manufacturing appointments |
| General AI chatbot | Can organize a supplied list | Maintains persistent local task state and continuously updates guidance |

Flownee's simplicity is part of the product idea, not a missing feature. Many
assistants expose broad capabilities but require setup, repeated prompting, and
ongoing system maintenance. Flownee deliberately narrows the interaction to a
fast voice capture and a continuously updated answer. It gives users freedom
from another task-management obligation rather than asking them to think about
how to operate an assistant.

Concise positioning:

> Voice notes remember what you said. Task managers store what you entered. Flownee helps you act on what is occupying your mind.

Short-form differentiation:

> Other productivity assistants help you manage a system. Flownee quietly
> manages the flow so you can get back to your life.

## Product principles

- Voice-only capture; text-assisted review and correction.
- One-tap access to capture from the home screen.
- Immediate access to the last valid recommendation.
- Automatic replanning after every confirmed task-state change.
- Explainable recommendations instead of unexplained rankings.
- User control over transcripts, interpretations, estimates, and order.
- Calm, friendly, concise, and non-judgmental interaction.
- Local-first storage and no account requirement.

## AI roles

- **GPT-4o Transcribe:** Convert voice recordings to text.
- **GPT-5.6:** Extract structured intentions, identify essential clarification needs, estimate effort, reason about context and dependencies, group related work, and produce the updated execution flow.
- **Codex:** Accelerate architecture, implementation, testing, debugging, documentation, and submission preparation under human direction.

GPT-5.6 must distinguish:

- Facts stated by the user.
- Model-generated estimates.
- Assumptions that require user confirmation.

## Team

- **Victoria:** Authorized Devpost representative; product, market research, positioning, and submission strategy. More than 15 years of marketing-research experience.
- **Mike:** Technical lead; architecture, full-stack development, AI integration, deployment, and testing. Approximately 20 years of full-stack experience.

Both team members reside in Portugal and have confirmed legal age.

## Success measures

- Voice capture starts with one tap from the home screen.
- A new intention can be captured and confirmed in under 30 seconds.
- Multiple intentions spoken in one recording are separated correctly.
- No confirmed item is lost if planning fails.
- The existing plan appears immediately when Flownee opens.
- **What to do now** updates after every confirmed addition or status change.
- Every recommendation includes a concise, understandable reason.
- Users can correct transcripts, interpretations, and estimates.
- Local state survives refresh, closing, and reopening.
- The full journey works on primary supported browsers.
- Most participants in a small usability test can capture an item and understand the next recommendation without assistance.

## Claim boundaries

- Say **recommended** or **practical** execution order, not mathematically optimal order.
- Do not claim Flownee knows an unstated deadline or context.
- Present effort values as editable estimates.
- Do not claim routine learning, calendar awareness, or location awareness in the MVP.
- Describe the early interviews accurately as informal qualitative evidence.
- Describe the later independent validation as qualitative, self-reported
  evidence unless participant counts, methods, measurements, and observation
  periods are separately documented; do not invent quantitative or causal
  claims.
