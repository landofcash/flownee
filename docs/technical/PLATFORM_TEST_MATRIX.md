# Supported-platform test matrix

Last updated: 2026-07-18

This matrix separates measured evidence from assumptions. A responsive viewport
simulation is useful layout evidence, but it is not a physical-device or
browser-engine pass.

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

| Platform | Support level | Evidence completed | Status | Remaining release evidence |
|---|---|---|---|---|
| Windows, current Chrome | Primary | Chrome 150 Chromium engine: responsive desktop/mobile layouts, IndexedDB journey, no horizontal overflow or console errors; real three-second microphone capture produced a 47,639-byte WebM/Opus Blob with one audio track. Installed Google Chrome is `150.0.7871.125`. | **Partial pass** | Repeat the complete journey in the installed Google Chrome executable against the public HTTPS deployment. |
| Android, current Chrome | Primary | Product owner approved Android recording as a development assumption. Mobile viewport `390x844` passed responsive layout checks in the Chrome 150 engine. | **Deferred; not a test pass** | Run the complete journey and `/diagnostics/recording` on a named physical Android device; record exact Chrome/Android versions and Blob evidence. |
| macOS, current Chrome | Primary | No macOS device was available in this workspace. | **Not run** | Run the complete journey on a named macOS device and record exact Chrome/macOS versions. |
| Windows, current Edge | Secondary | Microsoft Edge `150.0.4078.83` is installed. No trustworthy interactive Edge run has been completed. | **Not run** | Run the complete journey in Edge against the public HTTPS deployment. |
| iPhone/iPad, current Safari | Best effort | No iOS/iPadOS device or Safari runtime was available in this workspace. | **Not run** | Run the journey and recording diagnostic on an available physical Apple device; document any limitation honestly. |

## Environment-independent verification

On localhost, `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`,
`/diagnostics/recording`, and `/api/ai-status` each returned HTTP 200 on
2026-07-18. The manifest and service worker returned their expected content
types. The automated baseline is 54 passing tests plus passing lint and
production build gates.

## Public deployment gate

The public deployment is available at
https://flownee-build-week.netlify.app. Signed-out HTTP checks passed on
2026-07-18 for `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`,
`/icon.svg`, `/diagnostics/recording`, and `/api/ai-status`. The AI-status route
reported `enabled: true`; cross-origin POST requests to `/api/plan` and
`/api/transcribe` returned HTTP 403 before any provider call.

This closes the public hosting and account-free access gates. It does not close
the remaining physical-device and browser-engine rows above.

## Evidence rules

- Record exact browser, operating-system, and device versions.
- Use fictional task content only.
- Do not retain or upload diagnostic recordings.
- Record failures and limitations; do not convert assumptions or emulation into
  passes.
- For audio-format detail, see
  [`AUDIO_COMPATIBILITY.md`](AUDIO_COMPATIBILITY.md).
