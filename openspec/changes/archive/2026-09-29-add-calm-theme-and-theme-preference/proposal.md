## Why

The foundation ships the neon dark theme by default plus a light override. Products that need a quiet, trustworthy look, such as finance or health apps, must redefine every semantic and component token themselves. Any token they miss lets the neon default leak through (issue #10). The foundation also has no automatic light/dark switching: `ThemeToggle` only flips a stored value, and apps have to write their own pre-paint script to avoid a flash of the wrong theme (issue #11). CyberWealth currently keeps interim copies of both and will switch to the library versions.

## What Changes

- Add an optional preset, `@cyberdynecorp/svelte-ui-foundation/themes/calm.css`, with `[data-theme="calm"]` (sage/sand/mist/stone) and `[data-theme="calm-dark"]`.
  - Each theme redefines every Layer 2 and Layer 3 token that the default `:root` defines, except the theme-invariant `--video-*` tokens.
  - It sets calmer motion (every `--transition-*` ≤ 200 ms, no spring overshoot), makes Inter the display font, uses softer radii, and sets a 64 px `--nav-height`.
- Add vitest guards for the preset:
  - token completeness against `colors.css`;
  - WCAG AA contrast for a declared pairing list (≥ 4.5:1 for text, ≥ 3:1 for UI), resolving `var()` chains;
  - motion limits.
- Add `@cyberdynecorp/svelte-ui-foundation/theme`, a framework-agnostic and SSR-safe module:
  - `createThemePreference({ storageKey, themes: { light, dark } })` returns `get`, `resolved`, `set`, `subscribe` and `destroy`. It applies `data-theme` to `<html>` and persists the choice to `localStorage`, with storage failures falling back to `system`. Under `system` it follows `prefers-color-scheme: dark` live.
  - `themeInitScript(options)` returns a tiny inline script for `app.html` that sets `data-theme` before first paint.
- `ThemeToggle` now uses the helper.
  - New opt-in `includeSystem` prop renders a light / dark / system radio group.
  - New `themes` prop maps the modes to theme names (for example `{ light: "calm", dark: "calm-dark" }`).
  - Also new: bindable `preference`, `ariaLabel` and `onpreferencechange`.
  - Existing props and the default two-state switch are unchanged.
- The foundation package no longer publishes `*.test.ts`. Storybook gets Calm / Calm dark toolbar themes and a `Design Tokens/Themes` story. `DesignTokens.mdx` gets a Themes section.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `design-foundation`: adds the calm preset contract and the theme preference helper and pre-paint script.
- `core-components`: adds the `ThemeToggle` system-preference contract.
- `packaging-and-tooling`: adds the foundation subpath exports and excludes tests from the foundation tarball.

## Impact

- `packages/ui/foundation`: new `src/lib/themes/calm.css`, new `src/lib/theme/*`, new `exports` entries (`./themes/calm.css`, `./theme`), and a `files` exclusion for tests. Minor bump.
- `packages/ui/core`: `primitives/ThemeToggle` now imports `@cyberdynecorp/svelte-ui-foundation/theme`. Minor bump. The change is additive.
- There is one behavioural nuance in the default two-state toggle. Until the user clicks, the toggle now follows the OS scheme live, where before it snapshotted it on mount. Without `matchMedia` it resolves to light; before, it resolved to dark. Legacy stored `light`/`dark` values still restore.
- `.storybook/main.ts` gains an alias for the `./theme` subpath.
