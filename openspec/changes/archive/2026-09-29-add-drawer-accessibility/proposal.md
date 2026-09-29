## Why

`Drawer` (core 0.11) renders `role="dialog"` with `aria-modal="true"`, but it does not behave like a modal dialog (issue #43, requested by CyberWealth):

- focus does not move into the panel on open, and Tab / Shift+Tab can leave it (WCAG 2.4.3, 2.1.2);
- focus is not returned to the opener when it closes;
- the close button name "Close drawer" is hard-coded English;
- there is no close callback, only the bindable `open`, so a parent cannot react to an Escape or backdrop close;
- it shares `z-index: 1000` with `BottomNav`, so on phones the nav can cover the drawer footer.

## What Changes

- `Drawer`:
  - On open, focus the first focusable element in the panel, or the panel itself (`tabindex="-1"`).
  - Keep Tab / Shift+Tab inside the panel (wrap at both ends).
  - Close on Escape, backdrop click and the close button, and call the new `onclose?: () => void` for each. `open` stays bindable and is set to `false` first. Closing by setting `open` from the parent does not call `onclose`.
  - Restore focus to the element that was focused before opening when it closes.
  - Add `closeLabel?: string` (default `"Close drawer"`) for the close button's accessible name.
- Extract the Tab trap that `Modal` and `Dialog` each inlined into a shared `overlay/focusTrap.ts` (`focusableElements`, `trapTab`, `moveFocusInto`). `Modal` and `Dialog` use it; their behaviour is unchanged apart from skipping disabled controls and pulling focus back in when it sits outside the panel.
- Foundation: add theme-invariant stacking tokens `--z-nav` (1000) and `--z-overlay` (1100) in `spacing.css`. `BottomNav` uses `--z-nav`; `Drawer`, `Modal` and `Dialog` overlays use `--z-overlay`, so an open overlay always covers the bottom nav.
- Drawer stories run axe in failing mode (`parameters.a11y.test = "error"`), with a keyboard story (play function) and a phone story that shows the drawer footer above `BottomNav`.
- Non-breaking: existing props keep their meaning.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the Drawer accessibility contract and overlay layering above navigation.
- `design-foundation`: adds the stacking layer tokens.

## Impact

- `packages/ui/core/src/lib/layout/Drawer/*`, new `packages/ui/core/src/lib/overlay/focusTrap.ts`, `Modal.svelte`, `Dialog.svelte`, `BottomNav.svelte`, `style-contract.test.ts`.
- `packages/ui/foundation/src/lib/styles/spacing.css` and `style-tokens.test.ts`. The tokens are theme-invariant, so presets do not redefine them.
- README, TRD and the Storybook design-token page.
- Minor bumps of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation`.
