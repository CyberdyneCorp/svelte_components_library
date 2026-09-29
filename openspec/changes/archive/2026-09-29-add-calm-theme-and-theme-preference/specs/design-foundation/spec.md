## ADDED Requirements

### Requirement: Calm theme preset

The system SHALL ship an optional stylesheet `@cyberdynecorp/svelte-ui-foundation/themes/calm.css`, loaded after the foundation styles, that defines two themes: `[data-theme="calm"]` (light) and `[data-theme="calm-dark"]`. Each theme SHALL redefine every Layer 2 (`--color-*`, `--shadow-*`) and Layer 3 (`--btn-*`, `--input-*`, `--card-*`, `--table-*`, `--nav-*`) token that the default `:root` block defines, except the theme-invariant `--video-*` tokens. Neither theme SHALL redefine any `--primitive-*` or `--video-*` token. Both themes SHALL set `--font-display` to Inter. Every `--transition-*` token SHALL use a duration of at most 200ms and a timing function that does not overshoot. `--transition-spring` SHALL be a plain ease. Declared text/background pairings SHALL meet a WCAG 2.x contrast ratio of at least 4.5:1, and declared non-text UI pairings (focus rings, input and strong borders, accents) SHALL meet at least 3:1. (src: packages/ui/foundation/src/lib/themes/calm.css; packages/ui/foundation/src/lib/themes/presets.test.ts)

#### Scenario: Calm redefines every themed token

- **GIVEN** the list of non-primitive, non-`--video-*` custom properties declared in the default `:root` block of `colors.css`
- **WHEN** the declarations that apply to an element with `data-theme="calm"` or `data-theme="calm-dark"` are collected
- **THEN** every token in that list SHALL have a value in both themes

#### Scenario: New semantic token without a calm value fails

- **GIVEN** a new `--color-*` token added to the default `:root` block
- **WHEN** it has no value in `calm.css`
- **THEN** the token-completeness test SHALL fail and name the missing token

#### Scenario: Contrast is AA for every declared pairing

- **GIVEN** the pairing list declared in the calm test, with every `var()` chain resolved within the theme
- **WHEN** the WCAG relative-luminance contrast is computed for each pairing in `calm` and in `calm-dark`
- **THEN** every text pairing SHALL be at least 4.5:1 and every UI pairing at least 3:1

#### Scenario: Motion is calm

- **WHEN** the `--transition-*` tokens of either calm theme are read
- **THEN** each duration SHALL be at most 200ms and no `cubic-bezier` y control point SHALL lie outside [0, 1]

#### Scenario: Theme scoped to a subtree

- **GIVEN** an element with `data-theme="calm-dark"` inside a document themed otherwise
- **WHEN** components render inside that element
- **THEN** they SHALL resolve the calm-dark semantic and component tokens

### Requirement: Theme preference helper

The system SHALL export from `@cyberdynecorp/svelte-ui-foundation/theme` a framework-agnostic `createThemePreference({ storageKey, themes: { light, dark } })`. It SHALL return an object with these members:

- `get()`, which returns the stored preference: `"system"`, `themes.light` or `themes.dark`.
- `resolved()`, which returns the theme name actually applied.
- `set(preference)`.
- `subscribe(listener)`, which calls the listener immediately and on every change with `{ preference, resolved }`, and returns an unsubscribe function.
- `destroy()`.

The helper SHALL apply the resolved theme to `document.documentElement.dataset.theme` and persist the preference to `localStorage` under `storageKey`. An empty or absent key SHALL keep the choice in memory only. While the preference is `"system"`, the helper SHALL follow `matchMedia('(prefers-color-scheme: dark)')` live. It SHALL add the change listener when entering `"system"` and remove it when leaving `"system"` or on `destroy()`. Every storage access SHALL be wrapped so that failures never throw. A failed or invalid read SHALL fall back to `"system"`, and invalid `set` values SHALL be coerced to `"system"`. The module SHALL NOT access `window` at import time. When `matchMedia` is unavailable, `"system"` SHALL resolve to the light theme. (src: packages/ui/foundation/src/lib/theme/themePreference.ts)

#### Scenario: System follows the OS live

- **GIVEN** a helper created with no stored preference while the OS prefers light
- **WHEN** the OS switches to dark
- **THEN** `data-theme` on `<html>` SHALL change to `themes.dark` without a reload

#### Scenario: Explicit choice stops following the OS

- **GIVEN** a helper on `"system"`
- **WHEN** `set(themes.light)` is called
- **THEN** the helper SHALL persist `themes.light`, remove its `prefers-color-scheme` listener, and ignore later OS changes

#### Scenario: Storage failure

- **GIVEN** `localStorage.getItem` and `setItem` throw
- **WHEN** the helper is created and `set` is called
- **THEN** nothing SHALL throw, `get()` SHALL start as `"system"`, and the chosen theme SHALL still be applied

### Requirement: Pre-paint theme init script

The system SHALL export `themeInitScript({ storageKey, themes })` from `@cyberdynecorp/svelte-ui-foundation/theme`. It SHALL return a self-contained inline-script string for `app.html` that sets `document.documentElement.dataset.theme` before first paint, using the same storage key and resolution rules as `createThemePreference`. A stored explicit theme SHALL win. Otherwise `prefers-color-scheme: dark` SHALL pick between the two themes, and storage or `matchMedia` failures SHALL fall back without throwing. Option values SHALL be escaped so that they cannot terminate the surrounding `<script>` element. (src: packages/ui/foundation/src/lib/theme/themePreference.ts)

#### Scenario: No flash of the wrong theme

- **GIVEN** a stored preference of `themes.dark`
- **WHEN** the script runs in `<head>` before the stylesheets paint
- **THEN** `<html>` SHALL carry `data-theme` equal to `themes.dark` before the body renders

#### Scenario: Script and helper agree

- **GIVEN** any stored value (`"system"`, either theme or garbage) and either OS scheme
- **WHEN** the script runs and a helper is then created with the same options
- **THEN** the theme applied by the script SHALL equal the helper's `resolved()`
