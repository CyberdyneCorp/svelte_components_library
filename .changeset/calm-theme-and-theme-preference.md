---
"@cyberdynecorp/svelte-ui-foundation": minor
"@cyberdynecorp/svelte-ui-core": minor
---

Add a calm theme preset and light/dark/system theme preference.

- foundation: new optional `@cyberdynecorp/svelte-ui-foundation/themes/calm.css` defining `[data-theme="calm"]` and `[data-theme="calm-dark"]`. Every Layer 2 and Layer 3 token is redefined (except `--video-*`), contrast is WCAG AA, motion stays at or under 200ms with no spring, and the display font is Inter.
- foundation: new `@cyberdynecorp/svelte-ui-foundation/theme` with `createThemePreference({ storageKey, themes })` and `themeInitScript(options)`. The helper follows `prefers-color-scheme` live under `system`, persists the choice to `localStorage` (storage failures fall back to `system`) and is SSR-safe. `themeInitScript` returns a pre-paint script for `app.html`.
- foundation: test files are no longer published.
- core: `ThemeToggle` gains an opt-in `includeSystem` light / dark / system radio group and a `themes` mapping (e.g. `{ light: "calm", dark: "calm-dark" }`), plus bindable `preference`, `ariaLabel` and `onpreferencechange`. The two-state switch remains the default and existing props are unchanged. Until the user picks a theme, the two-state switch now follows OS changes live.
