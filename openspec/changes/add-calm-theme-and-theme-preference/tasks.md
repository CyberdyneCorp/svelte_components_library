## 1. Calm theme preset (#10)

- [x] 1.1 Add `packages/ui/foundation/src/lib/themes/calm.css` with `[data-theme="calm"]` and `[data-theme="calm-dark"]`, redefining every default Layer 2 + Layer 3 token except `--video-*`
- [x] 1.2 Calm motion (≤ 200ms, no overshoot), Inter display font, softer radii, `--nav-height: 64px`
- [x] 1.3 Add the `./themes/calm.css` export to the foundation package
- [x] 1.4 Add vitest guards: token completeness, WCAG AA contrast over a declared pairing list with `var()` resolution, motion limits

## 2. Theme preference (#11)

- [x] 2.1 Add `packages/ui/foundation/src/lib/theme/` with `createThemePreference` (get/resolved/set/subscribe/destroy) and `themeInitScript`, SSR-safe with try/catch-wrapped storage
- [x] 2.2 Export it as `./theme` (types + default)
- [x] 2.3 Unit tests with mocked `matchMedia` / `localStorage`, including throwing storage and parity between the script and the helper

## 3. ThemeToggle

- [x] 3.1 Route `ThemeToggle` through the helper; keep the two-state switch and existing props as the default
- [x] 3.2 Add `includeSystem`, `themes`, bindable `preference`, `ariaLabel`, `onpreferencechange`
- [x] 3.3 Tests and stories (With System, Calm Themes With System)

## 4. Docs and release

- [x] 4.1 Storybook: Calm / Calm dark toolbar themes, `Design Tokens/Themes` story, `./theme` alias
- [x] 4.2 `DesignTokens.mdx` Themes section with the `app.html` snippet; README setup note
- [x] 4.3 Exclude `*.test.ts` from the foundation tarball
- [x] 4.4 Changeset: foundation minor, core minor
- [ ] 4.5 Archive this change once released
