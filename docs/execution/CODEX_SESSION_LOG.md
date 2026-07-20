# Codex Session Log

Use this file to preserve evidence of Codex contributions and human judgment. Do not record secrets, personal task content, raw recordings, or private transcripts.

The `/feedback` Session ID required by the hackathon must come from the project task where most core functionality is built. A baseline or documentation session should not be presented as that session unless it genuinely contains the majority of core functionality.

## 2026-07-20 — AI-selected intention emoji

- Session ID: `TBD` (supporting AI interpretation and visual scanning)
- Objective: Have GPT-5.6 return one fitting emoji for each extracted intention and display it beside that intention throughout Flownee.
- Codex contributions:
  - Upgraded the strict planning contract to version 2 with one required emoji per new intention and concise model guidance.
  - Added grapheme-aware runtime validation that accepts one emoji, including joined and skin-tone sequences, while rejecting words, mixed content, and multiple icons.
  - Persisted validated emojis with new task records while keeping existing version-1 IndexedDB records readable through a neutral display fallback.
  - Integrated the visual cue into interpretation review, current and upcoming flow, saved items, and task management without adding manual emoji entry.
  - Extended contract, commit, evaluation, compatibility, and component coverage.
- Human product and interaction decisions preserved:
  - Victoria requested that AI choose an emoji fitting each intention and that the icon appear next to the intention.
  - Emoji selection remains automated; the existing editable title and effort controls are unchanged.
- Verification:
  - 30 test files and 106 tests pass; ESLint passes with zero warnings; the optimized Next.js production build passes.
  - Local browser checks confirm sample icons and legacy fallbacks in light and dark themes, the `430px` centered shell, no horizontal overflow, and no task mutation.
  - No live OpenAI request was made; the provider boundary is covered with strict schemas, fixtures, and mocked tests.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — Clean done confirmation modal

- Session ID: `TBD` (supporting destructive-action clarity)
- Objective: Present `Clean done` confirmation as a consistent Flownee modal instead of an inline panel.
- Codex contributions:
  - Replaced the saved-card inline confirmation with the established mobile bottom-sheet and centered-desktop dialog pattern.
  - Added a dimmed blurred backdrop, initial focus, body scroll lock, inert/`aria-hidden` background, Escape cancellation, close icon, cancel action, and destructive confirmation.
  - Preserved singular/plural removal copy and surfaced local deletion errors inside the modal.
  - Kept the existing atomic completed-item deletion operation unchanged.
  - Updated component coverage for closed/open rendering, modal semantics, warning copy, and close controls.
- Human product and interaction decisions preserved:
  - Victoria requested the `Permanently remove...` confirmation be presented as a modal consistent with the rest of Flownee.
- Verification:
  - Focused component coverage passes for closed/open rendering, modal semantics, warning copy, and close controls.
  - Full verification passes: 28 test files and 90 tests, ESLint with zero warnings, and the optimized Next.js production build.
  - Local browser checks at `1280x720` confirm dark and light rendering, initial dialog focus, `aria-modal`, inert/`aria-hidden` background, hidden body overflow, no horizontal overflow, and safe cancellation with all saved-item fixtures preserved.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — blocking flow-update progress

- Session ID: `TBD` (supporting task-action feedback and replanning safety)
- Objective: Make the post-action flow update unmistakable and prevent interaction until it settles.
- Codex contributions:
  - Added a full-viewport, focused, accessible modal progress overlay with Flownee processing animation and explicit saved/update language.
  - Connected its lifecycle across the local IndexedDB mutation and the complete protected replan request instead of ending it after the local write.
  - Made the underlying application inert and locked document scrolling while the overlay is visible.
  - Closed the overlay on success, handled failure, timeout, local mutation failure, or the all-complete no-replan path.
  - Reused the overlay for all task changes that require replanning and retries, while excluding completed-history cleanup.
  - Added regression coverage for visibility, modal semantics, explanatory copy, and the absence of a dismiss action.
- Human product and interaction decisions preserved:
  - Victoria requested that updating the flow after completing an item be clearly visible and block the screen.
- Verification:
  - The safe fictional `?demo=updating` state renders the real blocker without changing saved tasks or calling GPT-5.6.
  - Browser measurements confirm the dialog is focused and `aria-modal`, the app is inert and `aria-hidden`, body overflow is hidden, no dismiss button exists, the overlay covers the complete `1280x720` viewport at z-index 80, and there is no horizontal overflow.
  - Visual inspection confirms the dark-theme Flownee processing treatment and readable saved/update message over the blurred previous flow.
  - 28 test files and 90 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — saved-items bulk controls

- Session ID: `TBD` (supporting local-first task-state management)
- Objective: Add bulk controls beneath `Saved items` for removing completed history and restoring postponed work.
- Codex contributions:
  - Added matching primary `Clean done` and `Restore for later` controls with status-aware disabled states.
  - Added an explicit destructive confirmation before cleaning completed items.
  - Extended the IndexedDB mutation contract so both actions operate atomically on the current stored collection rather than looping over stale UI items.
  - Preserved dependency cleanup, revision checks, provisional planning, request abortion, and stale-response protection.
  - Avoided an unnecessary GPT-5.6 call when only completed history is removed; restored work triggers one replan.
  - Added repository and component regression coverage for atomic behavior, revision counts, button variants, and confirmation.
- Human product and engineering decisions preserved:
  - Victoria selected both labels, placed the controls after the saved-items list, requested matching colors, confirmed that `Clean done` removes completed items, and confirmed that `Restore for later` returns all postponed items to the active flow.
- Verification:
  - Local light and dark browser checks show both controls after the saved-items list with matching `rgb(82, 90, 255)` backgrounds and no horizontal overflow.
  - The clean confirmation opens and cancels safely; the completed and postponed browser fixtures remain present afterward. The destructive confirmation and restore action were not executed during visual QA.
  - 28 test files and 89 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — completed saved-item treatment

- Session ID: `TBD` (supporting home-screen state clarity)
- Objective: Make completed intentions visibly distinct in the saved-items list.
- Codex contributions:
  - Added a muted line-through treatment only to completed task titles.
  - Preserved the existing status badges so completion is not communicated by styling alone.
  - Added regression coverage proving postponed titles remain uncrossed.
- Human product and design decisions preserved:
  - Victoria requested completed saved items be crossed out.
- Verification:
  - Server-rendered component coverage proves completed titles receive muted line-through classes and postponed titles do not.
  - No local user task was mutated solely to manufacture a visual test state.
  - 28 test files and 86 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — matching recommendation actions

- Session ID: `TBD` (supporting home-screen interaction refinement)
- Objective: Give the `Done` and `Do later` actions the same color and make postponement easier to recognize.
- Codex contributions:
  - Applied the same primary action variant to both task-state buttons.
  - Added the existing clock icon before `Do later` without adding a dependency.
  - Added component regression coverage for the shared variant and icon.
- Human product and design decisions preserved:
  - Victoria selected matching colors for both actions and requested a clock icon for `Do later`.
- Verification:
  - Local light and dark browser measurements confirm identical `rgb(82, 90, 255)` backgrounds and white text for both actions.
  - `Do later` contains the clock icon and the centered app layout has no horizontal overflow.
  - 28 test files and 85 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — 30-second voice-capture limit

- Session ID: `TBD` (supporting voice interaction and cost-control refinement)
- Objective: Reduce the maximum voice recording from 90 seconds to 30 seconds.
- Codex contributions:
  - Changed the browser's actual automatic-stop timeout rather than only changing visible copy.
  - Updated the recording guidance and oversized-audio recovery message.
  - Aligned MVP and architecture documentation with the new limit.
  - Added regression coverage for the default timeout and server guidance.
- Human product and engineering decisions preserved:
  - Victoria selected a 30-second maximum and approved applying it to both behavior and messaging.
- Verification:
  - Local browser verification finds the exact 30-second recording guidance and no legacy 90-second copy.
  - The dialog retains equal `597px` client and scroll heights with no internal or horizontal overflow and was closed before transcription or upload.
  - 27 test files and 84 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — capture illustration spacing refinement

- Session ID: `TBD` (supporting voice interaction and visual-design refinement)
- Objective: Add slightly more breathing room immediately above and below the Flownee illustration.
- Codex contributions:
  - Increased title-to-image and image-to-microphone spacing by one `4px` spacing step each.
  - Preserved all component sizes, content, colors, animation, and recording behavior.
- Human product and design decisions preserved:
  - Victoria requested slightly more space on both sides of the illustration, approved the initial `4px` adjustments, and then approved one additional `4px` below the image.
- Verification:
  - Local browser measurements confirm both title-to-image and image-to-microphone gaps are exactly `20px`.
  - At the available `1280x720` viewport, the dialog is approximately `599px` high with equal `597px` client and scroll heights, no internal scrollbar, and no horizontal overflow.
  - The dialog was closed without transcription or upload; 26 test files and 83 tests, lint, and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — compact voice-capture dialog

- Session ID: `TBD` (supporting voice interaction and visual-design refinement)
- Objective: Fit the complete initial recording experience in the available viewport without an internal scrollbar.
- Codex contributions:
  - Removed unused square layout space around the landscape illustration without reducing its rendered width.
  - Reduced only the vertical gaps and padding around the header, illustration, microphone, recording copy, actions, and privacy note.
  - Preserved component sizes, wording, colors, animation, recording controls, and responsive width.
- Human product and design decisions preserved:
  - Victoria requested the spacing reduction and explicitly required the dialog to fit the page without scrolling.
- Verification:
  - At the available `1280x720` viewport, the centered `430px` dialog is approximately `587px` high; its client and scroll heights are both `585px`, so no internal scrollbar is present.
  - The image still renders `365px` wide; measured header-to-image, image-to-microphone, and microphone-to-status gaps are `16px`, `12px`, and `8px`.
  - No horizontal overflow was found; the recording dialog was closed without transcription or upload.
  - 26 test files and 83 tests pass; lint and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — Flownee illustration timing refinement

- Session ID: `TBD` (supporting voice interaction and visual-design refinement)
- Objective: Simplify the layered illustration and slow the changing intention details.
- Codex contributions:
  - Removed the circular background, border, inset shadow, and circular clipping without changing artwork alignment or size.
  - Changed the intention-layer interval from one second to two seconds and made the timing an explicitly tested constant.
- Human product and design decisions preserved:
  - Victoria requested the large circle be removed and selected a two-second interval between intention images.
- Verification:
  - Local browser measurement confirms the `365x365` artwork area now has a transparent background, `0px` border and radius, no shadow, and no clipping.
  - Observed intention changes were approximately two seconds apart and remained in sequence.
  - No horizontal overflow was found; the dialog was closed without transcription or upload.
  - 26 test files and 83 tests pass; lint and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — layered Flownee intention illustration

- Session ID: `TBD` (supporting voice interaction and visual-design refinement)
- Objective: Replace the temporary capture-screen mock with the approved Flownee artwork and rotating intention details.
- Codex contributions:
  - Inspected the five supplied WebP assets and confirmed that the four intention images are transparent, aligned overlays for the fixed main illustration.
  - Built a responsive circular composite with one fixed background layer and a one-second, four-step detail cycle.
  - Added a short opacity transition and stopped the cycle when the illustration unmounts.
  - Honored reduced-motion preferences by keeping the first intention layer static.
  - Added regression coverage for asset order and cycle wraparound.
- Human product and design decisions preserved:
  - Victoria supplied the final artwork, selected `main.webp` as the permanent first layer, specified the four intention layers and their order, chose a one-second interval, and requested a circular presentation.
- Verification:
  - Local browser inspection in light and dark modes shows a responsive `365x365` circular composite with the fixed main layer and one transparent detail layer.
  - Timing samples confirm the visible order `1 → 2 → 3 → 4 → 1`, with each change driven by the one-second interval.
  - No horizontal overflow was found; the dialog was closed during recording without transcription or upload.
  - 26 test files and 83 tests pass; lint and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — initial voice-capture image mock

- Session ID: `TBD` (supporting voice interaction and visual-design refinement)
- Objective: Simplify the initial capture hierarchy and reserve a prominent location for a future Flownee image.
- Codex contributions:
  - Removed the modal-only `Add by voice` eyebrow without changing the fixed bottom entry action.
  - Reduced the dynamic capture title to `20px` and kept the existing accessible dialog label.
  - Enlarged the mobile bottom sheet to a `90svh` minimum with a `96svh` maximum and safe vertical scrolling.
  - Added a responsive 4:3 image placeholder beneath the title and restricted it to checking, microphone-request, and recording states.
  - Added explicit state-visibility coverage so the placeholder cannot leak into transcription, review, planning, error, or saved states.
- Human product and design decisions preserved:
  - Victoria removed the redundant modal label, requested a slightly smaller title, and chose to reserve space beneath it for a future image of Flownee.
  - Victoria explicitly approved increasing the mobile dialog so the future image can be larger.
- Verification:
  - Local browser inspection shows one `Tell Flownee what’s on your mind` heading at `20px`, followed by an accessible Flownee-image placeholder.
  - At the available `1280x720` viewport, the centered sheet is `430px` wide, the placeholder is approximately `365x274px` at a 4:3 ratio, vertical overflow is safely scrollable, and there is no horizontal overflow.
  - The sheet was closed during microphone request; no audio was stopped, transcribed, or uploaded.
  - 26 test files and 82 tests pass; lint and production build pass.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — installed-app icon alignment

- Session ID: `TBD` (supporting brand and PWA refinement)
- Objective: Make the installed desktop/PWA icon use the same approved Flownee artwork as the shared header.
- Codex contributions:
  - Identified the legacy `/icon.svg` as the installed-app source while the header used `/flownee-mark-v2.png`.
  - Followed the image-preservation workflow and rejected a generative redraw in favor of deterministic scaling and centering of the exact approved pixels.
  - Created standard `192x192` and `512x512` manifest icons, a safe-zone `512x512` maskable icon, a `512x512` Next metadata icon, and a `180x180` Apple touch icon.
  - Updated the manifest, added icon regression coverage, removed the obsolete SVG, and versioned the service-worker icon cache.
- Human product and design decisions preserved:
  - Victoria required the desktop-installed icon to match the approved Flownee logo and approved a light-neutral square presentation.
  - The wave artwork and its colors remain unchanged; only square composition, scale, background, and maskable safe margins were added.
- Verification:
  - All five generated assets have their exact expected dimensions and `#F8FAFC` corner/background pixels.
  - The manifest returns HTTP 200 with two standard PNG icons and one maskable PNG icon.
  - `/icon.png`, `/apple-icon.png`, and all three `/icons/` files return HTTP 200 with `image/png`.
  - Rendered metadata links expose the `512x512` favicon, `180x180` Apple icon, and web manifest.
  - 25 test files and 81 tests pass; lint and production build pass.
  - Existing installed copies may need to be uninstalled and reinstalled after deployment because desktop launchers cache PWA icons.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — Help privacy consolidation and header simplification

- Session ID: `TBD` (supporting navigation and privacy refinement)
- Objective: Remove ambiguous header indicators and make Help the single destination for privacy information and local-data deletion.
- Codex contributions:
  - Removed the permanent saved-status dot and privacy shield from the home header.
  - Removed the home-only privacy query, modal, and deletion state while preserving unrelated local task workflows.
  - Moved the complete local-storage, voice-processing, planning, rate-limit, and deletion guidance into an accessible `Privacy & data` region on Help.
  - Preserved the two-step, atomic IndexedDB deletion control with busy, success, error, and safe-cancel states.
  - Redirected the Settings privacy action to `/help#privacy-data` and updated regression coverage.
- Human product and design decisions preserved:
  - Victoria identified the saved-status dot as unexplained and removed both it and the privacy shield.
  - Victoria selected Help as the single home for privacy/data information and approved the consolidation plan before implementation.
- Verification:
  - Home header exposes Help, Settings, and theme controls only; no saved-status dot or privacy shield remains.
  - Settings navigates to `/help#privacy-data`, where the complete privacy content and deletion control render as an accessible region.
  - Browser verification entered and safely cancelled the delete confirmation without deleting local data.
  - Centered desktop Help layout has no horizontal overflow.
  - 24 test files and 80 tests pass; lint and production build pass; `/help` remains statically generated.
  - Commit and production deployment intentionally await separate product-owner approval.

## 2026-07-19 — Settings app version

- Session ID: `TBD` (supporting Settings refinement)
- Objective: Show the current application version in the About Flownee section.
- Codex contributions:
  - Passed the repository version from the server-rendered Settings route into the client Settings screen.
  - Added a separated `App version 0.1.0` line to the existing About Flownee card.
  - Used `package.json` as the single source of truth so future release-version changes update the UI automatically.
  - Added a regression assertion that the rendered About version matches package metadata.
- Human product decision preserved:
  - Victoria requested the app version in About Flownee and approved using the existing repository version `0.1.0`.
- Verification:
  - Settings at `390x844` displays `App version 0.1.0` with zero horizontal overflow.
  - 24 test files and 80 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — Help and Settings screens

- Session ID: `TBD` (supporting navigation and product-guidance session)
- Objective: Add focused Help and Settings destinations and make them accessible from every shared header.
- Codex contributions:
  - Added active, accessible Help and Settings icon links to the shared header while preserving the privacy and theme controls.
  - Replaced the long saved-on-device header label with the same status as a compact titled dot so all controls fit the fixed `430px` shell.
  - Added a reusable internal-page shell matching Flownee's mobile-first layout.
  - Built `/help` with the product journey, voice tips, correction guidance, recording diagnostics, and privacy summary.
  - Built `/settings` with synchronized light/dark controls, local-data and privacy access, AI-processing boundaries, and product information.
  - Added a server-driven privacy deep link that opens the existing dialog and clears its query when closed, without duplicating or weakening the confirmed delete flow.
  - Added route, navigation, active-state, content, and settings-control coverage.
- Human product and design decisions preserved:
  - Victoria requested two new screens and matching Help and Settings icons on the header's right side.
  - Victoria approved the exact screen scope and shared-header implementation plan before development.
- Verification:
  - Home at `390x844`: Help, Settings, privacy, and theme controls each measure `36x36`; the logo link remains `155x44`; no horizontal overflow.
  - Help: `/help`, `Using Flownee` heading, active Help icon, microphone diagnostic link, and no overflow.
  - Settings: `/settings`, `Your preferences` heading, active Settings icon, synchronized appearance buttons, privacy deep link, and no overflow.
  - Privacy deep link opens the existing `privacy-title` dialog; closing it returns to `/` with no query and no data deletion.
  - Desktop `1024x900`: all four home controls remain visible with no header or document overflow.
  - 24 test files and 80 tests pass; lint and production build pass; `/help` and `/settings` are statically generated.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — interpretation-review label refinement

- Session ID: `TBD` (supporting interaction-design session)
- Objective: Remove the remaining redundant labels and provenance badges from the simplified interpretation review.
- Codex contributions:
  - Renamed each review card from `Item N` to `Intention N`.
  - Removed the visible `Action` label while adding a per-intention accessible name to the editable title input.
  - Consolidated `Choose one` and the selector's `Time effort` legend into one `Choose time effort` legend.
  - Removed all effort-provenance badges from the review while retaining provenance in the task commit model.
  - Preserved the stated-deadline badge because it represents an explicit user constraint.
  - Expanded review-component tests to assert the new wording, removed copy, and accessible input name.
- Human product and design decisions preserved:
  - Victoria selected the exact `Intention N` and `Choose time effort` wording and removed visible action and provenance labels.
  - Victoria approved the refinement plan before implementation.
- Verification:
  - Static rendering includes `Intention 1`, `Choose time effort`, and `aria-label="Intention 1 action"`.
  - Static rendering excludes visible `Action`, `Choose one`, `Time effort`, `AI estimate`, `Changed by you`, and `You stated this` copy.
  - 22 test files and 77 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — simplified interpretation review

- Session ID: `TBD` (supporting interaction-design session)
- Objective: Reduce the post-interpretation review to the few decisions that require user attention.
- Codex contributions:
  - Removed the optional-notes editor while preserving automatic AI-generated notes through the existing commit path.
  - Removed assumption headings, text, and checkboxes from the review surface.
  - Preserved safety by keeping important uncertainty blocking and replacing assumption confirmation with one concise `More detail is needed` message and transcript-revision path.
  - Shortened the primary confirmation from `Add and update my flow` to `Add to my flow`.
  - Added focused component coverage for the simplified surface and hidden-safety behavior, plus commit coverage proving automatic notes still persist.
- Human product and design decisions preserved:
  - Victoria identified the review as too complicated and explicitly removed optional notes and assumption controls.
  - Victoria selected the shorter `Add to my flow` action and approved the simplification plan before implementation.
- Verification:
  - Static component rendering contains action editing, effort selection, and `Add to my flow`; it contains no Notes label, Assumptions label, assumption text, checkbox, or former primary-action copy.
  - A required uncertainty renders the generic blocker, keeps the save button disabled, and retains `Revise transcript`; no important assumption is silently accepted.
  - AI-generated notes are still committed automatically when present.
  - Mobile `390x844` and desktop `1024x900` app-shell checks retain the header and voice action with zero horizontal overflow; no paid AI request was made for visual verification.
  - 22 test files and 77 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — second approved wave-logo replacement

- Session ID: `TBD` (supporting brand-integration session)
- Objective: Replace the shared Flownee mark with the newly supplied blue/cyan/violet wave while preserving its exact artwork on both themes.
- Codex contributions:
  - Confirmed that the `1536x1024` source was an opaque RGB image with a subtly varying near-white background.
  - Attempted a preservation-locked background extraction, inspected the result, and rejected it because it contained a baked checkerboard instead of alpha.
  - Extracted the background deterministically from the original pixels using edge-connected background segmentation, retaining exact opaque artwork pixels and a 24 px transparent margin.
  - Added the cache-safe `/flownee-mark-v2.png` asset URL and corrected intrinsic dimensions for the mark's wider aspect ratio.
  - Reused the shared header and design-system integration without changing the wordmark, theme control, privacy action, header height, or square PWA icon.
- Human product and design decisions preserved:
  - Victoria supplied the replacement artwork and approved the background-removal and integration plan before implementation.
  - The new horizontal mark replaces only the product-header treatment; the installed square icon remains unchanged.
- Verification:
  - Final asset: `1389x381`, `Format32bppArgb`, transparent corners, 24 px safety margin, and `513374` bytes.
  - Header: `80x22`; design-system reference: `116x32`; optimized image requests load from the versioned source at the correct aspect ratio.
  - Light and dark previews show no white rectangle, visible halo, or distortion.
  - Mobile and centered-desktop app checks show zero horizontal overflow; the home link remains approximately `155px` wide and the shield/theme alignment is unchanged.
  - 21 test files and 75 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — persistent header theme switch

- Session ID: `TBD` (supporting interaction and accessibility session)
- Objective: Make light and dark modes directly selectable from every app header using compact sun and moon icons.
- Codex contributions:
  - Added one reusable header theme control backed by the document theme as an external React store.
  - Added device-preference fallback, safe browser persistence, same-tab notification, and cross-tab storage synchronization.
  - Added an early root-theme initializer to avoid displaying the wrong theme before hydration.
  - Removed the duplicate design-system-only text toggle so the shared header remains the single theme control.
  - Added pure theme-resolution tests and shared-header accessibility coverage.
- Human product and design decisions preserved:
  - Victoria requested icon-only sun/moon switching in the header beside the privacy shield and approved the plan before implementation.
  - The existing header size, logo, privacy action, color tokens, and mobile-shell width remain unchanged.
- Verification:
  - Home at `390x844`: privacy and theme controls are adjacent `36px` targets, with the theme control immediately to the shield's right; horizontal overflow is zero.
  - Light selection applies `#F8FAFC`, exposes `Switch to dark mode`, and remains selected after a full navigation reload.
  - Dark selection applies `#10152B` and exposes `Switch to light mode`.
  - Design-system page contains exactly one theme control and no former `Show light/dark mode` text button.
  - Desktop and mobile checks show zero horizontal overflow.
  - 21 test files and 75 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — approved wave-logo integration

- Session ID: `TBD` (supporting brand-integration session)
- Objective: Integrate the supplied Flownee wave mark into the shared application identity without changing the installed PWA icon.
- Codex contributions:
  - Inspected the source PNG's alpha channel and visible pixel bounds before implementation.
  - Preserved the supplied artwork exactly and removed only excess transparent canvas, retaining a transparent safety margin in `public/flownee-mark.png`.
  - Replaced the shared header's previous square symbol with the horizontal mark while retaining the Flownee wordmark, accessible home link, page actions, and responsive header structure.
  - Added the mark to the design-system reference and updated component coverage.
- Human product and design decisions preserved:
  - Victoria supplied the exact logo artwork and approved the integration plan before implementation.
  - The new horizontal mark is used for product branding; the existing square icon remains the installed PWA and favicon asset until a dedicated square composition is approved.
- Verification:
  - Cropped asset: `530x171`, transparent ARGB PNG, with transparent corners and unchanged visible artwork.
  - Mobile `390x844`: header mark renders at `80x26`, the design-system example at approximately `116x37`, all image requests load, and horizontal overflow is zero.
  - Desktop `1024x900`: centered app shell renders the `80x26` mark; the linked home target is approximately `155x44`; horizontal overflow is zero.
  - Light and dark design-system previews both retain a clear logo treatment.
  - 20 test files and 72 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — Flownee color system

- Session ID: `TBD` (supporting product-design and frontend-system session)
- Objective: Integrate a calm, functional violet/teal/blue brand palette without sacrificing readability or over-coloring the product.
- Codex contributions:
  - Centralized raw brand, neutral, semantic, component, gradient, overlay, light-mode, and dark-mode tokens and exposed them through Tailwind v4.
  - Added accessible reusable variants for buttons, badges, task cards, inputs, textareas, navigation, effort selection, voice states, warnings, and errors.
  - Applied restrained status accents to the real home hierarchy and added gradient motion only to recording, AI processing, onboarding, and reference examples.
  - Updated the owned logo, PWA colors, dialogs, and voice action while preserving product behavior.
  - Added the no-index `/design-system` reference page and `docs/design/COLOR_SYSTEM.md`.
- Human product and design decisions preserved:
  - Victoria supplied the exact brand and neutral palettes, semantic roles, approximate usage ratio, gradient restrictions, dark-mode direction, component rules, and accessibility requirements.
  - Victoria approved the implementation plan before code changes began.
  - Bottom navigation is demonstrated as a reusable pattern but not inserted into the current product shell because Flownee has no real navigation destinations and the voice panel owns the bottom action area.
- Accessibility evidence:
  - White on primary violet: `4.92:1`; navy on teal: `6.46:1`; navy on light blue: `10.17:1`; primary navy on the light background: `15.14:1`; neutral secondary text on white: `4.97:1`.
  - White on raw error red was insufficient at `4.31:1`, so destructive controls use the derived `#C7354F` at `5.18:1` while preserving `#D6455D` as the raw error token.
  - Muted blue is not used for important small text on white; gradient text is placed on an accessible surface; animation stops under reduced-motion preference.
- Verification:
  - Desktop design-system page: nine component sections, all four task tones, all badge roles, shared inputs, and active navigation present; computed primary button is `#525AFF` with white text.
  - Dark preview: background `#10152B`, surface border `#2A3452`, text `#F5F7FF`, adapted active navigation `#737BFF`, and zero overflow.
  - Mobile `390x844`: home voice action remains flush to the bottom, the next-task card uses the dark surface with violet accent, effort prime notation remains intact, and both home and design-system pages have zero horizontal overflow.
  - 20 test files and 72 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — discrete time-effort controls

- Session ID: `TBD` (supporting product and interaction-design session)
- Objective: Replace arbitrary minute entry with consistent, low-friction effort categories selected by AI and adjustable by the user.
- Codex contributions:
  - Added the approved `5`, `10`, `15`, `30`, `60`, and `120` minute contract, presented consistently as `5′`, `10′`, `15′`, `30′`, `60′`, and `120′+`.
  - Constrained the GPT-5.6 schema and parser to reject all other new-task effort values and added conservative upward mapping instructions for spoken in-between durations.
  - Built one accessible six-option radio selector for interpretation review and later task editing, with no number or text input.
  - Preserved AI, user-stated, and user-edited provenance and retained legacy custom values until the user explicitly chooses a new option.
  - Centralized effort display labels throughout the home screen.
- Human product decision preserved:
  - Victoria required small single-choice buttons, automatic AI selection, colored selection state, and manual changes by tapping another option.
  - Victoria approved the implementation plan before any code changes began.
- Verification:
  - Static component coverage confirms six radio inputs, exactly one checked option, and no numeric input.
  - Contract and commit tests reject unsupported values such as `20` minutes.
  - Local sample UI displays `About 10′`, `Estimated 5′`, and `Estimated 30′`; old `min`, `hour`, and `hours` effort labels are absent and horizontal overflow is zero.
  - 18 test files and 66 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — shared application header

- Session ID: `TBD` (supporting design session)
- Objective: Give every rendered Flownee page a consistent header with the product logo.
- Codex contributions:
  - Extracted a reusable application-header component with the owned Flownee SVG logo and linked wordmark.
  - Preserved the home privacy action and added the shared header to the recording diagnostic.
  - Added component coverage for branding, home navigation, and optional page actions.
- Human design decision preserved:
  - Victoria required a plan-and-approval gate before implementation and approved the shared-header proposal before code changes began.
- Verification:
  - Narrow viewport: header approximately `64px` high, logo `36x36px`, privacy action retained, and no overflow.
  - Desktop diagnostic: header content and page content both measure `896px` and share the same left and right alignment.
  - 16 test files and 61 tests pass; lint and production build pass.
  - Production deployment intentionally awaits separate product-owner approval.

## 2026-07-19 — cross-capture task batching

- Session ID: `TBD` (supporting planning-quality session)
- Objective: Group compatible intentions even when they are spoken in separate captures.
- Codex contributions:
  - Verified that every capture already sends the complete active-task snapshot to GPT-5.6.
  - Required an explicit comparison of each new intention with every active task before rebuilding the complete execution order.
  - Added context-label reuse and adjacency rules for compatible same-place or same-session tasks without merging their records.
  - Added the reported coffee-beans plus milk/fish/green-beans case as an executable evaluation fixture.
- Human product decision preserved:
  - Victoria identified that related shopping intentions captured at different moments should be grouped into one practical errand flow.
- Verification:
  - A request-construction regression proves that all active tasks and their contexts accompany the new transcript; completed and postponed tasks remain intentionally outside the current execution plan.
  - The evaluation detects both non-adjacent shopping tasks and inconsistent grocery context labels.
  - 15 test files and 59 tests pass; lint and production build pass.
  - Production deploy `6a5cc8f228d4a4911924b2ee`, built from commit `b35dc53`.

## 2026-07-19 — Netlify same-origin hotfix

- Session ID: `TBD` (supporting production-fix session)
- Objective: Restore production voice and planning requests without weakening cross-site protections.
- Codex contributions:
  - Reproduced the production HTTP 403 with an audio-free request carrying the exact public Flownee origin.
  - Traced the failure to comparing the browser origin with Netlify's proxy-rewritten internal `request.nextUrl.origin`.
  - Added one shared proxy-aware origin validator for both paid routes.
- Human input preserved:
  - Victoria reported the real production error immediately after deployment.
- Verification:
  - Public-host/proxy regression, mismatched-origin, and explicit cross-site tests pass.
  - 14 test files and 57 tests pass; lint and production build pass.
  - Production deploy `6a5cc5ff68d958941cc7bed1`: the public same-origin diagnostic advances to normal HTTP 400 request validation, while the attacker-origin diagnostic remains blocked with HTTP 403.

## 2026-07-19 — mobile-width desktop shell

- Session ID: `TBD` (supporting design session)
- Objective: Make the desktop presentation retain Flownee's focused mobile-app proportions.
- Codex contributions:
  - Capped the application shell at `430px` and centered it in wider viewports.
  - Kept the recommendation and upcoming flow in one column at desktop widths.
  - Matched the fixed voice bar and voice, task, and privacy dialog widths to the shell.
  - Added subtle edge definition so the application remains visually distinct on a wide screen.
- Human design decision preserved:
  - Victoria requested that desktop Flownee look like the mobile experience rather than expanding into a wide dashboard.
- Verification:
  - Desktop `1440x900`: application shell and fixed voice bar both measured exactly `430px` and were horizontally centered.
  - No horizontal overflow or browser console warnings/errors.
  - Lint, 54 automated tests, and production build pass.

## 2026-07-19 — enlarged bottom voice action

- Session ID: `TBD` (supporting design and usability session)
- Objective: Replace the small circular recording control with a more forgiving, permanently accessible bottom action.
- Codex contributions:
  - Converted the fixed footer into one large, full-width mobile call-to-action with a constrained desktop width.
  - Kept the existing `Add by voice` and `Tap once and speak naturally` copy inside the clickable area.
  - Centered a 64-pixel microphone medallion across the button's top edge to follow the supplied sketch.
  - Preserved the existing recording workflow and accessible button name.
- Human design decision preserved:
  - Victoria identified the original circular control as too small and supplied the rectangular bottom-button direction.
  - Victoria refined the title treatment to be slightly smaller and clearly separated from the microphone circle while preserving the compact card, centered text, weight, and color.
  - Victoria extended the colored action surface through the lower safe area so it reads as a bottom action panel while keeping its width, top edge, microphone, text, and surrounding layout unchanged.
  - Victoria then requested the panel use the maximum horizontal space in both directions, so the footer inset was removed while the centered `430px` desktop shell remained unchanged.
  - Victoria selected a classical rectangular treatment with square corners, a slightly larger title, and explicit clearance below the microphone circle.
- Verification:
  - Mobile `390x844`: clickable control approximately `343x80` CSS pixels; fixed to the bottom; centered `64x64` microphone medallion; no horizontal overflow.
  - Desktop `1440x900`: clickable control `576x80` CSS pixels and centered at the bottom.
  - Follow-up spacing check: title `14px`/semibold with a measured `7px` circle-to-title gap at narrow and desktop viewport widths; horizontal center delta below `0.01px`.
  - Bottom-panel check: action height `96px` with a baseline `16px` safe area, bottom edge flush with the viewport at narrow and `1440px` widths, unchanged horizontal measurements, unchanged `64px` microphone, `16px` corner radius, and no overflow or console errors.
  - Edge-to-edge check: the action fills the footer's content box at both widths (`302.4px` within the `304px` narrow shell and `428.4px` within the bordered `430px` desktop shell); the only `0.8px` space per side is the shell border, and horizontal overflow remains zero.
  - Rectangular-panel check: measured corner radius `0px`; title `16px`/semibold with `20px` line height; `9px` clear vertical gap below the unchanged `64px` microphone at narrow and `1440px` widths; no horizontal overflow.
  - The control is uniquely exposed to assistive technology, visible, and enabled.
  - Browser console: no errors or warnings.
  - Lint, 54 automated tests, and the production build pass (run through the bundled Node runtime because the pnpm wrapper requested an interactive modules-directory confirmation).

## 2026-07-18 — expert usability walkthrough and participant protocol

- Session ID: `TBD` (supporting evaluation session)
- Objective: Evaluate the public first-run and recommendation experience
  against the confirmed success measures without inventing participant data.
- Codex contributions:
  - Ran an isolated mobile expert walkthrough of the public empty state and
    fictional sample.
  - Measured capture-button visibility, tap-target size, bottom reachability,
    and horizontal overflow.
  - Assessed the next-action hierarchy and reason comprehension.
  - Created a five-minute, three-to-five-participant protocol with operational
    definitions, thresholds, and an empty results table.
- Human input still required:
  - Recruit representative adults and record real observations.
  - Decide whether the high-priority read-only sample ambiguity should be fixed
    before the demo.
- Verification:
  - Public mobile viewport: `390x844`; capture control `64x64`, visible 16 px
    above the bottom edge; no horizontal overflow.
  - Expert comprehension: sample next action and reason were clear.
  - No ambient microphone content was captured and no provider call was made.
  - Participant success measure remains open.

## 2026-07-18 — deployment and supported-platform verification

- Session ID: `TBD` (supporting deployment/test session)
- Objective: Publish Flownee to Netlify and run the declared platform matrix.
- Codex contributions:
  - Verified the local HTTP surface for the home, fictional demo, manifest,
    service worker, recording diagnostic, and AI-status endpoints.
  - Confirmed the installed Windows browser versions and consolidated prior
    measured Chrome-engine recording and responsive-layout evidence.
  - Created a release-journey matrix that distinguishes measured tests,
    viewport simulation, product-owner assumptions, and unavailable devices.
  - Initiated Netlify CLI authorization without exposing the OpenAI key.
- Human product and engineering decisions preserved:
  - Physical Android recording remains explicitly deferred; it is not recorded
    as a pass.
  - The deployment must be public and account-free, with the OpenAI key stored
    only in Netlify's server-side environment.
- Verification:
  - Local endpoints `/`, `/?demo=sample`, `/manifest.webmanifest`, `/sw.js`,
    `/diagnostics/recording`, and `/api/ai-status`: HTTP 200.
  - Installed browsers: Google Chrome `150.0.7871.125`; Microsoft Edge
    `150.0.4078.83`.
  - Netlify deployment: pass at `https://flownee-build-week.netlify.app`, deploy
    `6a5cc8f228d4a4911924b2ee` (latest), including planning-quality commit `b35dc53` and same-origin hotfix commit `6c217ae`.
  - Latest production smoke check: HTTP 200 for `/`, `/manifest.webmanifest`,
    and `/api/ai-status`; Netlify reports the deploy state as `ready` with the
    Next.js server function available.
  - Signed-out production: HTTP 200 for home, fictional demo, manifest, service
    worker, icon, recording diagnostic, and AI status; AI enabled; untrusted
    origins rejected with HTTP 403 by both paid routes before provider use.
  - In-app browser retry: no result claimed because the browser surface
    returned stale-tab errors after its documented recovery path.

## 2026-07-18 — privacy, deletion, and public API safeguards

- Session ID: `TBD` (supporting implementation session; compare with the core voice/planning sessions before selecting `/feedback` evidence)
- Objective: Make Flownee’s data boundaries understandable and protect the public, sponsor-funded AI routes from accidental or abusive use.
- Codex contributions:
  - Added a responsive privacy/data panel describing browser storage, temporary audio handling, planning inputs, request throttling, and deletion limits.
  - Implemented confirmed atomic deletion of all IndexedDB user-content stores and immediate UI reset.
  - Added a no-store AI-availability endpoint and preflight check before microphone permission, while preserving authoritative switch checks in both paid POST routes.
  - Added configurable per-client request windows, hashed transient client keys, 429/Retry-After responses, expired-bucket cleanup, and provider-call prevention tests.
- Human product and engineering decisions preserved:
  - The privacy explanation uses precise behavior claims and does not promise that local deletion retracts data already processed by OpenAI.
  - Merely opening Flownee still performs no AI request; switch status is checked only when capture starts.
  - Default limits favor a short judge demo while bounding repeated use: 6 transcriptions and 20 plans per 10-minute warm instance.
  - The serverless in-memory limiter is documented as best effort; the environment kill switch and OpenAI project controls remain the authoritative budget protection.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 13 files and 54 tests passed.
  - `pnpm build`: pass; `/api/ai-status`, `/api/transcribe`, and `/api/plan` are dynamic routes.
  - Browser: privacy dialog passed at 390×844 without overflow; two-step deletion passed on an empty isolated local origin; no console warnings/errors.
  - Live provider: not called.

## 2026-07-18 — task actions and stale-response protection

- Session ID: `TBD` (reassess this task together with the interpretation/replanning task for the majority-core-functionality requirement)
- Objective: Let users manage every captured item while keeping local state immediate and preventing delayed GPT-5.6 responses from undoing newer decisions.
- Codex contributions:
  - Added atomic complete, postpone, restore, edit, and delete mutations with task-revision increments, inactive-dependency cleanup, and valid provisional plans.
  - Extended the strict GPT-5.6 contract with separate `capture` and transcript-free `replan` operations; replanning cannot create tasks or clarification questions.
  - Implemented client request cancellation, response-attempt tracking, and authoritative IndexedDB revision checks before plan replacement.
  - Added responsive task-management and edit UI, permanent-delete confirmation, completed/postponed item access, retryable planning failure UI, and automated concurrency coverage.
- Human product and engineering decisions preserved:
  - A confirmed task action takes effect locally before any network call and is never rolled back because AI is unavailable.
  - GPT-5.6 remains central to prioritizing remaining active work, but no provider request is needed when the active list becomes empty.
  - A locally derived provisional plan is visibly temporary and remains usable if GPT-5.6 fails; the user controls whether to retry.
  - Completed and postponed items stay recoverable in the local saved-items surface; destructive deletion requires a second explicit click.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 11 files and 47 tests passed.
  - `pnpm build`: pass.
  - Browser: fictional sample shell checked at 390×844; no horizontal overflow and no console warnings/errors.
  - Live provider: not called; provider request shape and semantic rejection remain covered at the mocked boundary.

## 2026-07-18 — interpretation review and automatic replanning

- Session ID: `TBD` (strong candidate for the majority-core-functionality session; reassess after task actions)
- Objective: Connect confirmed transcripts to protected GPT-5.6 reasoning, human interpretation review, and an atomically updated local execution flow.
- Codex contributions:
  - Verified the current Responses, GPT-5.6, reasoning, Structured Outputs, incomplete-output, and refusal contracts against official OpenAI documentation.
  - Implemented the protected `/api/plan` route with same-origin and request-size checks, server-only authentication, timeout, feature switch, stateless provider requests, safe errors, actual-model capture, and token accounting.
  - Added client-side revalidation, editable task interpretation, visible provenance and assumptions, blocking clarification handling, temporary-reference mapping, atomic IndexedDB commits, and local home-plan reload.
  - Added automated coverage for provider request shape, refusal, invalid semantic output, cross-site rejection, malformed input, edited estimates, required assumptions, and persisted-home-state conversion.
- Human product and engineering decisions preserved:
  - Transcript confirmation is saved before planning so user speech cannot be lost when GPT-5.6 fails.
  - GPT-5.6 plans automatically after transcript confirmation, while task records are committed only after the user reviews the interpretation.
  - Important assumptions require explicit human confirmation; blocking ambiguity returns to transcript revision instead of being guessed.
  - The prior valid plan remains visible while updating and is never replaced by an invalid or stale plan.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 11 files and 42 tests passed with mocked provider boundaries.
  - `pnpm build`: pass; `/api/plan` generated as a dynamic Node.js route.
  - Browser: fictional sample shell checked at 390×844; no horizontal overflow and no console warnings/errors.
  - Live provider: one fictional `Call Maria` request reached OpenAI through the protected route and returned HTTP 429. No retry loop was attempted; successful live fixture scoring and token measurement remain open.

## 2026-07-18 — GPT-5.6 planning contract and evaluation baseline

- Session ID: `TBD` (candidate core-functionality session; reassess after the planning route and review UI are complete)
- Objective: Define the strict boundary between confirmed voice captures, GPT-5.6 reasoning, and Flownee's local execution plan.
- Codex contributions:
  - Checked current official GPT-5.6 model and Structured Outputs guidance and selected the explicit `gpt-5.6-sol` Responses baseline with `medium` reasoning.
  - Implemented matching versioned TypeScript and JSON Schemas for compact active-task input and provenance-rich planning output.
  - Added semantic validation beyond JSON shape: complete plan coverage, stable/unique references, next-item consistency, dependency validity, deadline provenance, and explicit empty-plan behavior.
  - Added a lean planning prompt and six executable evaluation fixtures covering mixed household tasks, passing ideas, explicit deadlines, incremental replanning, non-actionable speech, and transcript prompt injection.
- Human product and engineering decisions preserved:
  - GPT-5.6 remains central to extracting multiple intentions and answering what to do now after every confirmed addition.
  - The system may estimate effort and infer reversible context, but it may not invent user facts or deadlines.
  - Existing active work must remain in every replan, while confirmed content and the last valid plan survive any provider or validation failure.
  - The quality-first Sol/medium baseline will be measured before lowering reasoning effort to save the capped API budget.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 8 files and 33 tests passed; provider calls remain mocked/not yet implemented.
  - `pnpm build`: pass.
  - Live GPT-5.6 fixture scoring, latency, and token-cost measurements are intentionally deferred until the protected reasoning route exists.

## 2026-07-18 — protected transcription and transcript review

- Session ID: `TBD` (candidate core-functionality session; reassess after GPT-5.6 planning is implemented)
- Objective: Connect Flownee's one-tap voice capture to a protected GPT-4o Transcribe boundary and user-controlled transcript confirmation.
- Codex contributions:
  - Verified the current `gpt-4o-transcribe` transcription endpoint, multipart input, JSON response, and accepted audio containers against official OpenAI documentation.
  - Implemented server-only authentication, feature switch, same-origin browser checks, bounded file/type validation, provider timeout, no-store responses, and safe error mapping.
  - Implemented a 90-second recorder session with start, stop, cancel, automatic limit, permission recovery, temporary audio retry, and race-safe cancellation.
  - Added editable transcript review and persisted only user-confirmed text to the native IndexedDB repository.
  - Found and fixed a late-permission race through production mobile-browser testing.
- Human product and engineering decisions preserved:
  - Capture remains voice-only; text editing exists solely to correct the transcript.
  - Audio remains temporary, is uploaded only after stop, survives a transcription failure for explicit retry, and is released after success or discard.
  - No live provider call was made during automated testing, avoiding accidental transmission of ambient microphone content and unnecessary budget use.
- Verification:
  - `.env.local` is ignored; key presence and feature-switch state were checked without printing their values.
  - `pnpm lint`: pass.
  - `pnpm test`: 7 files and 22 tests passed with a mocked OpenAI boundary.
  - `pnpm build`: pass; `/api/transcribe` generated as a dynamic Node.js route.
  - Production mobile browser: one-tap permission state and cancel recovery passed; dialog remained closed after a delayed permission result and console errors were empty.

## 2026-07-18 — audio compatibility diagnostic and desktop proof

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Measure real MediaRecorder support and Blob output on the available desktop Chrome engine, and prepare the identical proof path for Android.
- Codex contributions:
  - Implemented ordered audio MIME detection and WebM/Opus preference with MP4 and Ogg fallbacks measured independently.
  - Added a public, no-upload diagnostic route with secure-context checks, real microphone recording, bounded permission handling, actual Blob metadata, and recovery guidance.
  - Added unit coverage for format selection, missing APIs, and permission-denied guidance.
  - Ran a real three-second microphone test in the available Windows Chrome 150 engine and recorded the exact measured result.
- Human product and engineering decisions preserved:
  - Audio remains temporary and is neither uploaded nor persisted by the diagnostic.
  - Browser-reported support is not treated as proof until a non-empty Blob is produced from a real microphone stream.
  - WebM/Opus is provisional until current Chrome for Android completes the same physical-device test.
- Measured desktop evidence:
  - Identity: Win32, Chrome 150 Windows user agent; installed Google Chrome `150.0.7871.125`.
  - Preferred and actual type: `audio/webm;codecs=opus`.
  - Output: 47,639 bytes, 3,004 ms, one audio track.
  - Reported supported: WebM/Opus, WebM, MP4/AAC, and MP4. Reported unsupported: Ogg/Opus and Ogg.
- Remaining external evidence:
  - No Android ADB target or public HTTPS deployment was available, so Android remains explicitly unverified.
  - The product owner approved proceeding with Android recording as a provisional assumption and committed to later physical-device testing; this does not convert the assumption into evidence.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 5 files and 15 tests passed.
  - `pnpm build`: pass; `/diagnostics/recording` generated successfully.

## 2026-07-18 — native IndexedDB schemas and repositories

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Define and test durable local schemas for confirmed transcripts, tasks, execution plans, and task revisions.
- Codex contributions:
  - Implemented a versioned native IndexedDB database with indexed stores for transcripts, tasks, plans, and metadata.
  - Added strict runtime assertions for record shape, timestamp and enum validity, effort provenance, unique dependencies and assumptions, and plan/task consistency.
  - Added independent transcript and task writes, atomic task-plus-plan commits, stale-revision rejection, current snapshot loading, and delete-all behavior.
  - Found and fixed an upgrade-event boundary bug through the first automated schema test run.
  - Added deterministic IndexedDB tests using the Apache-2.0 licensed `fake-indexeddb` development dependency; it does not ship in the production runtime.
- Human product and engineering decisions preserved:
  - Use the browser's native IndexedDB API rather than introducing a production wrapper dependency.
  - Confirmed transcripts can survive a later reasoning failure, and the last valid plan cannot be replaced by a stale or invalid response.
  - AI effort estimates remain visibly distinguishable from user-stated or user-edited values.
  - Audio blobs are not part of the durable schema.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 4 files and 12 tests passed.
  - Coverage includes store/index creation, round trips, atomic commits, stale-plan preservation, invalid-record rejection, and complete local-data clearing.
  - `pnpm build`: pass.

## 2026-07-18 — responsive local-first PWA shell

- Session ID: `TBD` (not yet confirmed as the majority-core-functionality session)
- Objective: Implement Flownee's responsive application shell and the home-screen states required before local persistence and voice capture are connected.
- Codex contributions:
  - Built state-driven empty, loading, saved-plan, updating, all-complete, and offline presentations.
  - Added a fictional sample plan and explicit URL-driven preview fixtures without seeding fictional content into the default user experience.
  - Added the install manifest, repository-owned SVG app icon, production service-worker registration, and a shell-only offline fallback that bypasses all API traffic.
  - Preserved one prominent next action, its editable-estimate language, a concise reason, an ordered upcoming list, and the persistent voice-capture position.
  - Verified desktop and mobile layouts in a real browser, including overflow and console checks.
- Human product and engineering decisions preserved:
  - Users may open Flownee only to see what to do now, so the current valid recommendation remains the visual priority.
  - Voice remains the only capture method; disabled action affordances clearly reserve later task-action and recording behavior without pretending those integrations are complete.
  - User content remains local-first and account-free; the Cache API stores no task, transcript, plan, or API response data.
- Human design direction preserved:
  - Calm green visual system, generous spacing, plain-language explanations, and non-judgmental completion language.
  - Mobile capture action remains reachable while desktop uses a focused recommendation-plus-upcoming layout.
- Verification:
  - `pnpm lint`: pass.
  - `pnpm test`: 3 files and 6 tests passed.
  - `pnpm build`: pass; `/`, `/icon.svg`, and `/manifest.webmanifest` generated successfully.
  - Manifest and service-worker endpoints: HTTP 200 with correct content types; API bypass present.
  - Browser: 1440×900 sample plan and 390×844 empty/sample states checked; no horizontal overflow or console errors.

## 2026-07-18 — shadcn/ui foundation

- Session ID: `TBD` (not expected to be the majority-core-functionality session)
- Objective: Establish reusable UI conventions for Flownee without beginning new MVP functionality.
- Codex contributions:
  - Verified the current shadcn/ui Tailwind v4 and React conventions.
  - Added CLI-compatible component configuration, semantic design tokens, and the shared class-merging utility.
  - Implemented reusable Button, Card, and Badge primitives with variants, focus states, disabled states, and `data-slot` hooks.
  - Added unit coverage for conditional and conflicting Tailwind class merging.
  - Reviewed the direct UI dependencies; their licenses are MIT, Apache-2.0, or ISC.
- Human product and engineering decisions preserved:
  - Keep this milestone to reusable UI foundations; do not expand the MVP.
  - Use Tailwind CSS and shadcn/ui conventions in the Next.js TypeScript application.
  - Maintain Flownee's calm, friendly visual direction through semantic tokens rather than page-specific styling.
- Verification:
  - `pnpm peers check`: pass.
  - `pnpm lint`: pass.
  - `pnpm test`: 2 files and 3 tests passed.
  - `pnpm build`: pass; `/` and `/_not-found` generated successfully.

## 2026-07-18 — Product definition and repository baseline

- Session ID: `TBD` (not expected to be the majority-core-functionality session)
- Objective: Define Flownee and establish a clean Next.js TypeScript repository baseline.
- Codex contributions:
  - Converted the official rules and confirmed product decisions into persistent repository guidance.
  - Created the Next.js, TypeScript, Tailwind, ESLint, and Vitest baseline.
  - Added a safe environment template, MIT License, README, package lockfile, and supply-chain build policy.
  - Resolved Next.js peer compatibility by pinning ESLint 9 and TypeScript 6 rather than unsupported newer majors.
  - Established and ran lint, unit-test, peer-dependency, and production-build gates.
- Human product decisions:
  - Voice-only capture with text review and correction.
  - Incremental capture throughout the day and automatic update of **What to do now**.
  - Apps for Your Life track and busy-adult/working-parent primary audience.
  - Account-free, local-first task storage and no permanent audio retention.
- Human engineering decisions:
  - Next.js, TypeScript, Tailwind CSS, shadcn/ui, Netlify, and IndexedDB direction.
  - GPT-4o Transcribe for speech-to-text and GPT-5.6 for central reasoning.
  - Supabase deferred and API expenditure capped at $10.
  - Public GitHub repository with MIT License.
- Human design decisions:
  - A calm, friendly, non-judgmental personality.
  - The home screen shows the last valid next action immediately and keeps voice capture continuously accessible.
- Verification:
  - `pnpm peers check`: pass.
  - `pnpm lint`: pass.
  - `pnpm test`: 1 test passed.
  - `pnpm build`: pass; `/` and `/_not-found` generated successfully.
- Public repository:
  - https://github.com/landofcash/flownee
