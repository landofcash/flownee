# Flownee Compliance Checklist

Status values: `TODO`, `IN PROGRESS`, `PASS`, `BLOCKED`, `N/A`.

## Eligibility and project baseline

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Team members are of legal age | PASS | Team confirmation | Victoria | 2026-07-18 |
| Team resides in an eligible territory | PASS | Portugal; Official Rules country list | Victoria | 2026-07-18 |
| Victoria is authorized Devpost representative | PASS | Team confirmation | Victoria | 2026-07-18 |
| No entrant exclusion or conflict applies | TODO | Final team declaration | Victoria | |
| Selected track is Apps for Your Life | PASS | `docs/product/PROJECT_BRIEF.md` | Victoria | 2026-07-18 |
| Project was created from scratch during submission period | PASS | Team confirmation; repository history | Team | 2026-07-18 |

## Required technology and functionality

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Codex is used throughout development | PASS | `README.md` collaboration narrative and dated `docs/execution/CODEX_SESSION_LOG.md` implementation evidence | Team | 2026-07-20 |
| GPT-5.6 performs central product reasoning | PASS | Protected planning route, strict contract, fixtures, and automated tests | Mike | 2026-07-18 |
| GPT-4o Transcribe handles voice input | PASS | Protected transcription route, transcript review, and automated tests | Mike | 2026-07-18 |
| Project is working and non-trivial | PASS | Public deployment, 130 automated tests, production build, successful owner-reported physical voice/AI journeys, and `docs/technical/PLATFORM_TEST_MATRIX.md` | Team | 2026-07-20 |
| Project installs/runs consistently on intended platforms | IN PROGRESS | `docs/technical/PLATFORM_TEST_MATRIX.md`; physical Redmi Note 12 Pro 5G installed-app/Chrome journey and iPhone 17/12/8 Safari journeys pass; Windows Chrome full journey, macOS Chrome, and Windows Edge remain | Mike | 2026-07-20 |
| Behavior matches demo and written description | TODO | Final cross-check | Team | |
| Stage One theme and technology gate passes | PASS | Direct Apps for Your Life fit, substantive Codex use, central GPT-5.6 reasoning, and working non-trivial public product verified against the official criteria | Team | 2026-07-20 |

## Repository and testing

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Public GitHub repository exists | PASS | https://github.com/landofcash/flownee; visibility verified public | Mike | 2026-07-18 |
| MIT License is included | PASS | `LICENSE` | Mike | 2026-07-18 |
| No secrets or private user data are committed | PASS | Placeholder-only `.env.example`; scoped secret scan | Mike | 2026-07-18 |
| README has setup and run instructions | PASS | `README.md`; clean lockfile verification | Mike | 2026-07-18 |
| README includes sample data when needed | PASS | `README.md` links `TESTING_INSTRUCTIONS.md`, which provides a fictional multi-intention voice script and read-only sample URLs | Mike | 2026-07-20 |
| README documents Codex acceleration and human decisions | PASS | `README.md` sections `How the team collaborated with Codex` and `Decisions made by humans` | Team | 2026-07-20 |
| Public Netlify deployment is available | PASS | https://flownee-build-week.netlify.app; deploy `6a5be6cc5715099f9535f7b8` | Mike | 2026-07-18 |
| Judges need no account, payment, invitation, or API key | PASS | Signed-out HTTPS checks returned 200 for the app, demo, PWA assets, diagnostic, and AI status | Team | 2026-07-18 |
| Judge access remains active through judging | TODO | Hosting/API budget check | Mike | |
| Testing instructions reproduce critical journey | PASS | `TESTING_INSTRUCTIONS.md`: public setup, fictional multi-intention voice path, interpretation, task actions, persistence, delete-all, recovery, privacy, and read-only previews | Team | 2026-07-20 |

## Submission

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Project description explains features and operation | TODO | Devpost draft | Victoria | |
| Correct category selected | TODO | Devpost draft | Victoria | |
| Public YouTube video is under three minutes | TODO | Video URL and duration | Victoria | |
| Video demonstrates working project | TODO | Final video review | Team | |
| Video audio explains Codex and GPT-5.6 use | TODO | Final video review | Team | |
| Video media and trademarks are authorized | TODO | Rights audit | Victoria | |
| Majority-core-functionality `/feedback` Session ID recorded | TODO | Session ID | Team | |
| Repository URL included | TODO | Devpost draft | Victoria | |
| Deployment and testing access included | TODO | Devpost draft | Victoria | |
| All submission materials are in English | TODO | Language review | Victoria | |
| Every URL passes a signed-out test | TODO | Link audit | Team | |
| Submission completed before July 21, 5:00 PM PT | TODO | Devpost confirmation | Victoria | |

## IP, privacy, and operational safety

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Dependencies and assets have compatible licenses | IN PROGRESS | Direct dependencies selected; full final dependency/asset audit remains | Mike | 2026-07-18 |
| OpenAI and other service terms are followed | TODO | Terms review | Team | |
| Originality and team ownership are confirmed | TODO | Final declaration | Team | |
| No unauthorized trademarks, music, images, or data are used | TODO | Rights audit | Victoria | |
| Audio is not intentionally retained after transcription | PASS | Temporary Blob lifecycle and privacy panel; mocked route/browser verification | Mike | 2026-07-18 |
| Logs exclude recordings, transcripts, task content, and secrets | PASS | Server/client implementation review; provider tests verify credential exclusion | Mike | 2026-07-18 |
| Delete-all-local-data control works | PASS | Atomic repository test and browser two-step deletion verification | Mike | 2026-07-18 |
| API request throttling and budget protection work | PASS | Configurable 429 limiter tests, route switch tests, and `AI_FEATURES_ENABLED` kill switch | Mike | 2026-07-18 |
