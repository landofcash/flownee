# Flownee Compliance Checklist

Status values: `TODO`, `IN PROGRESS`, `PASS`, `BLOCKED`, `N/A`.

## Eligibility and project baseline

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Team members are of legal age | PASS | Team confirmation | Victoria | 2026-07-18 |
| Team resides in an eligible territory | PASS | Portugal; Official Rules country list | Victoria | 2026-07-18 |
| Victoria is authorized Devpost representative | PASS | Team confirmation | Victoria | 2026-07-18 |
| No entrant exclusion or conflict applies | PASS | Victoria and Mike final declaration | Team | 2026-07-21 |
| Selected track is Apps for Your Life | PASS | `docs/product/PROJECT_BRIEF.md` | Victoria | 2026-07-18 |
| Project was created from scratch during submission period | PASS | Team confirmation; repository history | Team | 2026-07-18 |

## Required technology and functionality

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Codex is used throughout development | PASS | `README.md` collaboration narrative and dated `docs/execution/CODEX_SESSION_LOG.md` implementation evidence | Team | 2026-07-20 |
| GPT-5.6 performs central product reasoning | PASS | Protected planning route, strict contract, fixtures, and automated tests | Mike | 2026-07-18 |
| GPT-4o Transcribe handles voice input | PASS | Protected transcription route, transcript review, and automated tests | Mike | 2026-07-18 |
| Project is working and non-trivial | PASS | Public deployment, 130 automated tests, production build, successful owner-reported physical voice/AI journeys, and `docs/technical/PLATFORM_TEST_MATRIX.md` | Team | 2026-07-20 |
| Project installs/runs consistently on intended platforms | PASS | Responsive web/PWA with no proprietary hardware or special installation requirements; named physical mobile and Windows Chrome-engine evidence in `docs/technical/PLATFORM_TEST_MATRIX.md`; team final acceptance confirmation for every platform represented in the submission | Mike | 2026-07-21 |
| Behavior matches demo and written description | PASS | Team final cross-check; public application, fictional sample, AI-status route, and public video verified | Team | 2026-07-21 |
| Stage One theme and technology gate passes | PASS | Direct Apps for Your Life fit, substantive Codex use, central GPT-5.6 reasoning, and working non-trivial public product verified against the official criteria | Team | 2026-07-20 |

## Repository and testing

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Public GitHub repository exists | PASS | https://github.com/vixfounder/flownee; visibility verified public | Mike | 2026-07-21 |
| MIT License is included | PASS | `LICENSE` | Mike | 2026-07-18 |
| No secrets or private user data are committed | PASS | Placeholder-only `.env.example`; scoped secret scan | Mike | 2026-07-18 |
| README has setup and run instructions | PASS | `README.md`; clean lockfile verification | Mike | 2026-07-18 |
| README includes sample data when needed | PASS | `README.md` links `TESTING_INSTRUCTIONS.md`, which provides a fictional multi-intention voice script and read-only sample URLs | Mike | 2026-07-20 |
| README documents Codex acceleration and human decisions | PASS | `README.md` sections `How the team collaborated with Codex` and `Decisions made by humans` | Team | 2026-07-20 |
| Public Netlify deployment is available | PASS | https://flownee-build-week.netlify.app; deploy `6a5be6cc5715099f9535f7b8` | Mike | 2026-07-18 |
| Judges need no account, payment, invitation, or API key | PASS | Signed-out HTTPS checks returned 200 for the app, demo, PWA assets, diagnostic, and AI status | Team | 2026-07-18 |
| Judge access remains active through judging | PASS | Account-free public deployment; team added API credits for judge-period use and confirmed availability plan | Mike | 2026-07-21 |
| Testing instructions reproduce critical journey | PASS | `TESTING_INSTRUCTIONS.md`: public setup, fictional multi-intention voice path, interpretation, task actions, persistence, delete-all, recovery, privacy, and read-only previews | Team | 2026-07-20 |

## Submission

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Project description explains features and operation | PASS | Completed Devpost draft; team confirmation | Victoria | 2026-07-21 |
| Correct category selected | PASS | Apps for Your Life selected in completed Devpost draft | Victoria | 2026-07-21 |
| Public YouTube video is under three minutes | PASS | https://youtu.be/xpT-oI0Lh4M; signed-out browser verification measured 2:36 | Victoria | 2026-07-21 |
| Video demonstrates working project | PASS | Final video completed and team-confirmed; public playback verified | Team | 2026-07-21 |
| Video audio explains Codex and GPT-5.6 use | PASS | Final technical narration and team confirmation | Team | 2026-07-21 |
| Video media and trademarks are authorized | PASS | Team final rights confirmation: no unauthorized copyrighted or trademarked content | Victoria | 2026-07-21 |
| Majority-core-functionality `/feedback` Session ID recorded | PASS | `019f709a-b5fb-7230-bf41-4c4508f7051f` | Team | 2026-07-21 |
| Repository URL included | PASS | Completed Devpost draft; https://github.com/vixfounder/flownee | Victoria | 2026-07-21 |
| Deployment and testing access included | PASS | Completed Devpost draft; public deployment and testing guide | Victoria | 2026-07-21 |
| All submission materials are in English | PASS | Team final language review; public video title/description and repository materials are English | Victoria | 2026-07-21 |
| Every URL passes a signed-out test | PASS | Team signed-out link audit plus independent public app, sample, AI-status, and YouTube checks | Team | 2026-07-21 |
| Submission completed before July 21, 5:00 PM PT | TODO | Devpost confirmation | Victoria | |

## IP, privacy, and operational safety

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Dependencies and assets have compatible licenses | PASS | Permissive direct-dependency review, recorded Magic UI/font/runtime licenses, repository-owned product assets, and team final rights confirmation | Mike | 2026-07-21 |
| OpenAI and other service terms are followed | PASS | Victoria and Mike final declaration | Team | 2026-07-21 |
| Originality and team ownership are confirmed | PASS | Team final ownership and rights confirmation; repository history shows work created during the submission period | Team | 2026-07-21 |
| No unauthorized trademarks, music, images, or data are used | PASS | Team final media and asset rights confirmation | Victoria | 2026-07-21 |
| Audio is not intentionally retained after transcription | PASS | Temporary Blob lifecycle and privacy panel; mocked route/browser verification | Mike | 2026-07-18 |
| Logs exclude recordings, transcripts, task content, and secrets | PASS | Server/client implementation review; provider tests verify credential exclusion | Mike | 2026-07-18 |
| Delete-all-local-data control works | PASS | Atomic repository test and browser two-step deletion verification | Mike | 2026-07-18 |
| API request throttling and budget protection work | PASS | Configurable 429 limiter tests, route switch tests, and `AI_FEATURES_ENABLED` kill switch | Mike | 2026-07-18 |
