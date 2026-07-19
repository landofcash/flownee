# Audio compatibility evidence

Flownee must measure recording support on each committed platform. A positive
`MediaRecorder.isTypeSupported()` result is not sufficient by itself; a test is
complete only when the browser produces a non-empty audio Blob from a real
microphone stream.

## Diagnostic procedure

1. Open `/diagnostics/recording` over HTTPS or on localhost.
2. Record the exact browser version and operating-system/device version.
3. Confirm the required API checks are available.
4. Record the reported MIME support table and preferred type.
5. Run the three-second microphone proof and allow microphone access.
6. Confirm the result has one audio track, a non-zero byte length, an actual
   Blob MIME type, and a duration close to three seconds.
7. Reload and retry once to verify permission reuse and repeatability.

The diagnostic never uploads or persists the audio sample.

## Evidence matrix

| Platform | Browser/version | Device/OS | Secure context | Preferred type | Actual Blob type | Bytes/duration | Result | Evidence date |
|---|---|---|---|---|---|---|---|---|
| Desktop | Chrome 150 engine (`Chrome/150.0.0.0` UA); installed Google Chrome `150.0.7871.125` | Windows 10, Win64 x64 | Yes, localhost | `audio/webm;codecs=opus` | `audio/webm;codecs=opus` | 47,639 bytes / 3,004 ms / 1 audio track | **Pass** | 2026-07-18 |
| Android | Current Chrome, exact version pending | Physical Android device, exact model/OS pending | HTTPS required | Provisionally `audio/webm;codecs=opus` | Pending | Pending | **Assumed for development; verification deferred** | — |

Desktop `isTypeSupported()` results:

- Yes: `audio/webm;codecs=opus`, `audio/webm`,
  `audio/mp4;codecs=mp4a.40.2`, and `audio/mp4`.
- No: `audio/ogg;codecs=opus` and `audio/ogg`.

The desktop proof ran inside the Codex in-app Chromium surface reporting a
Chrome 150 Windows user agent. Its engine version aligns with the installed
Google Chrome 150 major version, but the physical Google Chrome executable must
still receive a final smoke test before the cross-platform release gate is
closed.

## Provisional Android decision

The product owner approved proceeding on the assumption that current Chrome for
Android will record successfully using the same ordered MIME negotiation. This
is a development assumption, not test evidence. The physical-device run remains
mandatory before the final cross-platform release and judging-readiness gates
can be marked complete.

## Candidate order

Flownee checks formats in this order and uses the first type the current browser
reports as supported:

1. `audio/webm;codecs=opus`
2. `audio/webm`
3. `audio/mp4;codecs=mp4a.40.2`
4. `audio/mp4`
5. `audio/ogg;codecs=opus`
6. `audio/ogg`

The runtime must retain the actual `MediaRecorder.mimeType`/Blob type rather
than assuming it equals the requested type. The transcription route must
validate the actual upload type and size.
