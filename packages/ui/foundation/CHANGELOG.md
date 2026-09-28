# @cyberdynecorp/svelte-ui-foundation

## 0.5.0

### Minor Changes

- 90e2653: Add design-style tokens so theme presets can reach gradients, textures, glass blur, style shadows, border shape and decorative type.
  - foundation: new tokens with no-op defaults: `--gradient-{surface,brand,brand-hover,brand-active,accent,backdrop}`, `--texture-surface`, `--pattern-backdrop`, `--surface-blur`, `--shadow-{offset,raised,pressed,inset}`, `--border-width`, `--border-width-strong`, `--border-style`, `--font-decorative`, `--heading-transform`, `--color-accent-1..4`. The default, light and calm themes render unchanged. `body` paints the backdrop layers.
  - core: Button, Badge, Card, TextInput, Textarea, Select, Modal, Dialog, Drawer, Popover, Tabs, NavBar, Header, Sidebar, BottomNav, Table, DataTable, PageHeader, PageShell, AppLayout and CommentThread consume the new tokens.

- 90e2653: Add 17 design-style theme presets, each an optional CSS file activated with `data-theme="<id>"`: `minimal`, `flat`, `material`, `swiss`, `organic`, `maximalism`, `y2k`, `glass`, `neumorphism`, `skeuomorphism`, `brutalism`, `bento`, `clay`, `memphis`, `vaporwave`, `art-deco` and `editorial`.
  - Import with `@cyberdynecorp/svelte-ui-foundation/themes/<id>.css` after the foundation styles.
  - Every preset defines all Layer 2/3 and design-style tokens, never touches primitives or `--video-*`, meets WCAG AA on the calm pairing list and keeps motion at 200ms or less. `themes/presets.test.ts` (generalized from `calm.test.ts`) guards calm and every new preset.
  - Presets name their web fonts (see each file's header) but do not load them; system fallbacks apply otherwise.

## 0.4.0

### Minor Changes

- 480e597: Add a calm theme preset and light/dark/system theme preference.
  - foundation: new optional `@cyberdynecorp/svelte-ui-foundation/themes/calm.css` defining `[data-theme="calm"]` and `[data-theme="calm-dark"]`. Every Layer 2 and Layer 3 token is redefined (except `--video-*`), contrast is WCAG AA, motion stays at or under 200ms with no spring, and the display font is Inter.
  - foundation: new `@cyberdynecorp/svelte-ui-foundation/theme` with `createThemePreference({ storageKey, themes })` and `themeInitScript(options)`. The helper follows `prefers-color-scheme` live under `system`, persists the choice to `localStorage` (storage failures fall back to `system`) and is SSR-safe. `themeInitScript` returns a pre-paint script for `app.html`.
  - foundation: test files are no longer published.
  - core: `ThemeToggle` gains an opt-in `includeSystem` light / dark / system radio group and a `themes` mapping (e.g. `{ light: "calm", dark: "calm-dark" }`), plus bindable `preference`, `ariaLabel` and `onpreferencechange`. The two-state switch remains the default and existing props are unchanged. Until the user picks a theme, the two-state switch now follows OS changes live.

## 0.3.0

### Minor Changes

- 8d11e04: Define every foundation-namespaced token that core references (#17).
  - Foundation adds `--color-action-{brand,secondary}-{bg,border}`, `--color-action-danger-*`, `--color-accent-*`, `--color-syntax-number`, `--shadow-glow-red`, `--nav-height` and `--video-*`, each in dark and light.
  - Core now references existing tokens where it used synonyms, e.g. `--color-surface-base` → `--color-surface-default` and `--radius-full` → `--radius-pill`.
  - A new unit test fails on any undefined token.

  `Sidebar` and `BottomNav` accept an optional `ariaLabel` for their `<nav>` landmark (#16).

## 0.2.0

Not released from this repository. `0.2.0` was already taken on GitHub Packages by an earlier publish (2026-04-15) that predates the token work. The version is recorded here only so changesets skips it; the next release is `0.3.0`.
