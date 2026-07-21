# Supported-platform test matrix

Last updated: 2026-07-21

Flownee is submitted as a responsive web application and installable PWA for
current mainstream smartphone and desktop browsers. It requires no proprietary
hardware, account, browser extension, or platform-specific installation path.
The team confirmed final acceptance on every platform it intends to represent
in the submission. This matrix still separates named measured evidence from
broader standards-based compatibility; it does not claim certification of
every browser and version combination.

## Release journey

The supported-platform journey is:

1. Open the public HTTPS app without an account.
2. See the saved **What to do now** plan, or the first-run empty state.
3. Record a voice item and review the transcript.
4. Confirm the interpreted tasks and receive an updated execution plan.
5. Reload and confirm local data persists.
6. Complete, postpone, edit, and delete items.
7. Delete all local data from the privacy panel.

## Current evidence

| Evidence surface | Evidence completed | Status | Claim boundary |
|---|---|---|---|
| Responsive web/PWA release | Public HTTPS application works without an account, payment, invitation, user API key, proprietary hardware, extension, or platform-specific installer. The team confirmed final acceptance on all platforms it intends to represent. | **Intended-platform pass** | Standards-based browser compatibility is claimed; exhaustive certification of every browser/version pair is not. |
| Android physical devices | Product-owner testing on a Redmi Note 12 Pro 5G passed against the public deployment in installed-app mode and current Chrome. Recording, transcription, AI interpretation and replanning, review, all task actions, individual edit/delete, delete-all, reload, and reopen worked as expected. Current Firefox also passed as additional evidence. | **Physical-device pass** | Exact Android/browser versions and per-browser MIME/Blob diagnostics were not captured. |
| iPhone physical devices | Product-owner testing on iPhone 17, iPhone 12, and iPhone 8 passed against the public deployment in current Safari. Recording, transcription, AI interpretation and replanning, review, all task actions, individual edit/delete, delete-all, reload, and reopen worked as expected. Current Chrome and Firefox on the same iPhones also passed as additional browser-shell evidence. | **Physical-device pass** | Exact iOS/browser versions and per-browser MIME/Blob diagnostics were not captured; no iPad result is claimed. |
| Windows Chrome engine | Chrome 150 Chromium engine: responsive desktop/mobile layouts, IndexedDB journey, no horizontal overflow or console errors; a real three-second microphone capture produced a 47,639-byte WebM/Opus Blob with one audio track. Installed Google Chrome was `150.0.7871.125` when measured. | **Engine and recording pass** | This is named technical evidence, not a claim that every desktop browser/version combination was exhaustively certified. |

## Environment-independent verification

On localhost, `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`,
`/diagnostics/recording`, and `/api/ai-status` each returned HTTP 200 on
2026-07-18. The manifest and service worker returned their expected content
types. The current automated baseline is 133 passing tests plus passing lint and
production build gates.

## Public deployment gate

The public deployment is available at
https://flownee-build-week.netlify.app. Signed-out HTTP checks passed on July 18
for `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`, `/icon.svg`,
`/diagnostics/recording`, and `/api/ai-status`. A final signed-out audit on July
21 reconfirmed the public application, fictional sample, and AI-status route;
AI status reported `enabled: true`. Cross-origin POST requests to `/api/plan`
and `/api/transcribe` previously returned HTTP 403 before any provider call.

This closes the public hosting, account-free access, and intended-platform
acceptance gates. The physical mobile results remain product-owner-reported
evidence; browser and OS version numbers were not captured and must not be
inferred.

## Evidence rules

- Record exact browser, operating-system, and device versions.
- Use fictional task content only.
- Do not retain or upload diagnostic recordings.
- Record failures and limitations; do not convert assumptions or emulation into
  passes.
- For audio-format detail, see
  [`AUDIO_COMPATIBILITY.md`](AUDIO_COMPATIBILITY.md).
