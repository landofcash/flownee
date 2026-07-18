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
| Codex is used throughout development | IN PROGRESS | Codex task history; later session log | Team | 2026-07-18 |
| GPT-5.6 performs central product reasoning | TODO | Implementation and tests | Mike | |
| GPT-4o Transcribe handles voice input | TODO | Implementation and tests | Mike | |
| Project is working and non-trivial | TODO | Deployment and test report | Team | |
| Project installs/runs consistently on intended platforms | TODO | Browser/PWA test matrix | Mike | |
| Behavior matches demo and written description | TODO | Final cross-check | Team | |
| Stage One theme and technology gate passes | TODO | Scorecard review | Team | |

## Repository and testing

| Requirement | Status | Evidence | Owner | Last verified |
|---|---|---|---|---|
| Public GitHub repository exists | PASS | https://github.com/landofcash/flownee; visibility verified public | Mike | 2026-07-18 |
| MIT License is included | PASS | `LICENSE` | Mike | 2026-07-18 |
| No secrets or private user data are committed | PASS | Placeholder-only `.env.example`; scoped secret scan | Mike | 2026-07-18 |
| README has setup and run instructions | PASS | `README.md`; clean lockfile verification | Mike | 2026-07-18 |
| README includes sample data when needed | TODO | README/sample fixture | Mike | |
| README documents Codex acceleration and human decisions | TODO | `README.md` | Team | |
| Public Netlify deployment is available | TODO | Deployment URL | Mike | |
| Judges need no account, payment, invitation, or API key | TODO | Signed-out test | Team | |
| Judge access remains active through judging | TODO | Hosting/API budget check | Mike | |
| Testing instructions reproduce critical journey | TODO | `TESTING_INSTRUCTIONS.md` | Team | |

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
| Audio is not intentionally retained after transcription | TODO | Implementation and privacy test | Mike | |
| Logs exclude recordings, transcripts, task content, and secrets | TODO | Logging review | Mike | |
| Delete-all-local-data control works | TODO | Test result | Mike | |
| API request throttling and budget protection work | TODO | Configuration/test | Mike | |
