# Flownee Color System

Flownee uses color to clarify action and state while neutral backgrounds carry most of the interface. The target balance is approximately 70% neutrals, 15% violet, 8% teal, 5% muted blue, and 2% light-blue accents.

## Brand palette

| Token | Value | Role |
|---|---:|---|
| `--brand-primary` | `#525AFF` | Primary actions, selected states, links, voice action, next-task emphasis |
| `--brand-flow` | `#4AB5B5` | Completion, success, supportive actions, AI flow |
| `--brand-support` | `#6D8BC0` | Supporting icons, scheduling, inactive navigation, subtle borders |
| `--brand-highlight` | `#8FD9FB` | Suggested and empty-state tints, voice glow, restrained decoration |

## Neutrals

Light mode uses `#F8FAFC` for the background, white surfaces, `#17213F` primary text, `#667085` secondary text, and `#E5EAF2` borders. Dark mode uses `#10152B`, `#181F38`, `#2A3452`, `#F5F7FF`, and `#B7C0D8` respectively.

## Semantic colors

- Success uses teal.
- Warning uses `#E9A23B` with a dark foreground.
- The raw error token is `#D6455D`; destructive controls use the darker `#C7354F` so white normal-size text passes WCAG AA.
- The brand palette is not forced onto every semantic state.

## Gradient

```css
linear-gradient(135deg, #525AFF 0%, #6D8BC0 38%, #4AB5B5 72%, #8FD9FB 100%)
```

Use the gradient only for logo or hero treatments, active voice recording, AI processing, onboarding, and empty-state illustration. Do not apply it to ordinary buttons, cards, inputs, badges, or navigation.

## Component mapping

- Primary buttons: violet with white text.
- Secondary buttons: pale teal with a teal border and dark teal text.
- Next-task cards: white/dark surface with a violet edge.
- Completed cards: teal edge or tint.
- Scheduled cards: muted-blue edge or tint.
- Suggested cards: pale light-blue surface with navy text.
- Selected effort controls: violet.
- Inputs: neutral surface and border, violet focus, semantic error state.
- Bottom navigation: surface background, violet active item, gray-blue inactive items. This is a reusable preview and is not part of the current product shell.

## Accessibility

- White on primary violet is `4.92:1` and passes AA for normal text.
- Navy on teal is `6.46:1`; white on teal is only `2.45:1`, so teal controls use a dark foreground.
- Muted blue on white is `3.44:1`, so it is reserved for icons, borders, large elements, and tinted surfaces rather than important small text.
- Navy on light blue is `10.17:1`; light-blue text on white is prohibited.
- Primary navy on the light background is `15.14:1`; secondary neutral text on white is `4.97:1`.
- Dark-mode brand adaptations are lighter where they appear as text or focus indicators.
- Motion effects stop when `prefers-reduced-motion: reduce` is active.

The internal, no-index reference page is available at `/design-system`.

## Magic UI effects

Gate 2 stages only the MIT-licensed Magic UI Shine Border and Confetti source components. They are repository-owned adaptations rather than a new design system.

- Shine Border is used only inside the enabled primary current-task `Done` action and the circular microphone control within the fixed voice action. Each 1.5px violet/teal/light-blue border follows a five-second cycle: it makes one soft pass during approximately the first 2.5 seconds, fades fully, remains invisible for approximately 2.5 seconds, and repeats. The solid control fill is preserved, the overlay ignores pointer input, and reduced-motion users receive no animation. The disabled `Done` action has no shine overlay.
- Confetti is reserved for one 36-particle burst after a task completion is successfully stored and the blocking flow update closes. It uses the four Flownee brand colors, stays inside the 430px application shell, ignores pointer input, and is hidden for reduced-motion users. It fires for `Done` and dialog `Complete` only—not postpone, restore, edit, delete, clean-up, voice capture, failed storage, replanning, rerendering, or refresh. The internal `/design-system` preview is isolated from tasks, persistence, replanning, and APIs.
- Hyper Text is reserved for the single uppercase home-page heading. It performs one calm `1600ms` letter-scramble reveal when the heading mounts, never replays on hover, preserves the final violet treatment, exposes stable complete copy to assistive technology, and renders static text when reduced motion is preferred. The briefly scrambled visible characters are an intentional branded feature, not a loading or rendering fault: the transition gives the interface a modern, distinctive identity and visually suggests scattered thoughts resolving into a clear flow. Its one-time, short duration and reduced-motion fallback keep the effect restrained.
- The home Hyper Text heading is centered within the application content. The adjacent `Do this now` and effort badges share the same 28px important treatment, using Sparkles and Clock icons to preserve their different meanings. Primary capture and interpretation actions pair concise text with meaningful Lucide icons; saving uses a reduced-motion-safe Loader, revision uses Pencil, and cancellation uses X.
- Slide-to-confirm actions are used for the production current-task `Done` and `Do later` controls and remain previewable in `/design-system`. `Done` uses the teal flow color and `Do later` uses muted support blue; both use shadcn-inspired pill tracks, circular dark-navy-on-brand thumbs, subtle borders/shadows, adaptive tinted backgrounds, and brand-colored progress fills. Each control is 56px high, confirms at 75% horizontal travel, resets when incomplete or cancelled, supports Enter/Space, and suppresses transition motion when reduced motion is preferred. The production row places equal-width `Do later` and `Done` sliders before the fixed 44px management button; only enabled `Done` retains the repeating Shine Border.
- No other Magic UI effects, animation framework, gradients inside ordinary controls, particles, animated headings, or decorative section borders are approved.

### Gate 2 audit

Gate 2 is complete locally on `design-v2`. Automated coverage proves the storage-success boundary, one-time queue release, disabled-action behavior, non-interactive overlays, and reduced-motion gates. Responsive browser checks cover 320px, 360px, 390px, 430px, and a centered desktop viewport in light and dark modes. The available browser surface did not expose reduced-motion media emulation, so that safeguard is supported by executable unit tests, the `disableForReducedMotion` runtime option, and CSS inspection rather than represented as a simulated visual pass.

The completion canvas remains below the blocking update overlay (`70` versus `80`), exactly one canvas renders per page, and the stable worker configuration creates no application JavaScript timer or event-listener loop. The approved repeating shine is CSS-only. Optimized output contains one confetti-bearing chunk for the home route and one for the independently loaded internal design-system route; neither route duplicates the implementation within a single page load.

Upstream sources: [Shine Border](https://magicui.design/docs/components/shine-border), [Confetti](https://magicui.design/docs/components/confetti), [Hyper Text](https://magicui.design/docs/components/hyper-text), and the [Magic UI MIT license](https://github.com/magicuidesign/magicui/blob/main/LICENSE.md). The pinned `canvas-confetti` runtime dependency is ISC licensed; the pinned `motion` runtime dependency is MIT licensed; their copyright and permission notices remain in the installed packages and lockfile-managed dependencies.
