# Design Foundation

## Purpose

The `@cyberdynecorp/svelte-ui-foundation` package provides the design system's tokens: colors, typography, spacing, radius, and animations. It follows a three-layer CSS custom-property architecture (primitives -> semantic -> component) so that all components consume tokens rather than literal values, and theming is achieved entirely at the token layer. The system is dark-first with an opt-in light theme. A TypeScript token object mirrors a subset of the CSS tokens for programmatic use.
## Requirements
### Requirement: Three-layer token architecture

The system SHALL define color tokens in three layers within a single `:root` block: Layer 1 primitives (raw hex values named `--primitive-{family}-{step}`), Layer 2 semantic tokens (named `--color-{category}-{role}`, each resolving to a `var(--primitive-*)` or `rgba()`), and Layer 3 component tokens (named `--{component}-{property}`, each resolving to a Layer 2 `var(--color-*)` token, except the theme-invariant `--video-*` tokens, which are literal values because media surfaces stay black in every theme). (src: packages/ui/foundation/src/lib/styles/colors.css)

#### Scenario: Semantic token resolves to a primitive

- **GIVEN** the semantic token `--color-action-brand-default`
- **WHEN** its value is read from `colors.css:97`
- **THEN** the system SHALL resolve it to `var(--primitive-green-10)` rather than a raw hex value

#### Scenario: Component token aliases a semantic token

- **GIVEN** the component token `--btn-brand-bg`
- **WHEN** its value is read from `colors.css:135`
- **THEN** the system SHALL resolve it to `var(--color-action-brand-default)`

### Requirement: Signature brand colors

The system SHALL define three signature brand primitives: Neon Green `#00ff41` (crypto), Electric Cyan `#00d4ff` (ML/data), and Violet `#a855f7` (research/innovation), each promoted to an action role (brand=green, secondary=cyan, tertiary=violet) and each having a corresponding glow shadow token. The same three hex values SHALL be mirrored in the TypeScript token object. (src: packages/ui/foundation/src/lib/styles/colors.css:10,18,26,97,103,109,128-130; packages/ui/foundation/src/lib/tokens/tokens.ts:66,75,83)

#### Scenario: Brand color hex values

- **WHEN** `--primitive-green-10`, `--primitive-cyan-10`, and `--primitive-violet-10` are read from `colors.css:10,18,26`
- **THEN** the system SHALL define them as `#00ff41`, `#00d4ff`, and `#a855f7` respectively

### Requirement: Typography tokens

The system SHALL define three font-family tokens — `--font-display` ("Space Grotesk" first), `--font-body` ("Inter" first), and `--font-mono` ("JetBrains Mono" first) — four font-weight tokens (regular 400, medium 500, semibold 600, bold 700), and a set of `.cy-type-*` type-scale utility classes. Fonts SHALL be loaded via a Google Fonts `@import`. (src: packages/ui/foundation/src/lib/styles/typography.css:5,8-15,18-102)

#### Scenario: Font family tokens

- **WHEN** `--font-display`, `--font-body`, `--font-mono` are read from `typography.css:8-10`
- **THEN** the system SHALL define them with Space Grotesk, Inter, and JetBrains Mono as the respective primary families

### Requirement: Dark-first theming with light override

The system SHALL render the dark palette by default (the `:root` color block requires no attribute or media query) and SHALL provide a light theme via a `[data-theme="light"]` override block that redefines only Layer 2 (semantic) and Layer 3 (component) tokens without altering Layer 1 primitives. Consumers SHALL override any token by redefining the corresponding CSS custom property on a scoped selector. (src: packages/ui/foundation/src/lib/styles/colors.css:6,49,67,184,185-249,251-295)

#### Scenario: Default is dark

- **GIVEN** a document with no `data-theme` attribute
- **WHEN** foundation styles are applied
- **THEN** the system SHALL resolve `--color-bg-primary` to the darkest grey primitive `--primitive-grey-5`

#### Scenario: Light theme activation

- **GIVEN** an element with `data-theme="light"`
- **WHEN** the light override block at `colors.css:184` applies
- **THEN** the system SHALL remap semantic and component tokens without redefining any `--primitive-*` token

### Requirement: Reduced-motion accessibility

The system SHALL honor `prefers-reduced-motion: reduce` by forcing animation and transition durations to near-zero and animation iteration counts to 1 on all elements. (src: packages/ui/foundation/src/lib/styles/animations.css:46-54)

#### Scenario: User prefers reduced motion

- **GIVEN** a user agent reporting `prefers-reduced-motion: reduce`
- **WHEN** any animated element renders
- **THEN** the system SHALL reduce its animation/transition duration to approximately 0.01ms

### Requirement: Style aggregation order

The system SHALL aggregate stylesheets through `index.css` in the order colors, typography, spacing, radius, base, animations — loading token definitions before `base.css` (which consumes them). (src: packages/ui/foundation/src/lib/styles/index.css:1-6)

#### Scenario: Import order

- **WHEN** `index.css` is loaded
- **THEN** the system SHALL import `colors.css`, `typography.css`, `spacing.css`, `radius.css` before `base.css`, and `animations.css` last

### Requirement: TypeScript token export surface

The system SHALL export from `tokens.ts` the token objects `breakpoints`, `grid`, `typography`, `spacing`, `radius`, and `colors` (primitives only), plus the types `BreakpointKey`, `SpacingKey`, and `RadiusKey`. The exported `colors` object SHALL contain only Layer 1 primitives; semantic and component layers exist solely in CSS. (src: packages/ui/foundation/src/lib/tokens/tokens.ts:1-125)

#### Scenario: Colors export omits semantic layer

- **WHEN** the `colors` object is imported from `tokens.ts`
- **THEN** the system SHALL expose primitive families (neonGreen, cyan, violet, red, amber, grey) and SHALL NOT expose semantic `--color-*` or component tokens

### Requirement: Complete token surface for core

The system SHALL define, in both the default (dark) and `[data-theme="light"]` blocks, every token in a foundation-owned namespace that `@cyberdynecorp/svelte-ui-core` references. The namespaces are the prefixes foundation itself defines:

- `--color-`, `--primitive-`, `--shadow-`, `--font-`, `--space-`, `--radius-`, `--transition-`
- `--btn-`, `--input-`, `--card-`, `--table-`, `--nav-`, `--video-`
- the design-style prefixes `--gradient-`, `--texture-`, `--pattern-`, `--surface-`, `--border-` and `--heading-`

This includes:

- the action tint tokens `--color-action-{brand,secondary}-{bg,border}`;
- the danger action family `--color-action-danger-{default,hover,active,text}`;
- the decorative accents `--color-accent-{green,cyan,violet}` and `--color-accent-{1,2,3,4}`;
- `--color-syntax-number`, `--shadow-glow-red` and `--nav-height`.

`--btn-danger-*` SHALL alias `--color-action-danger-*`. (src: packages/ui/foundation/src/lib/styles/colors.css; packages/ui/core/src/lib/token-coverage.test.ts)

#### Scenario: Undefined token is rejected

- **GIVEN** a core component that references `var(--color-surface-base)`, which foundation does not define
- **WHEN** the unit test suite runs
- **THEN** `token-coverage.test.ts` SHALL fail and name the token and the file that references it

#### Scenario: Danger action token themed in light mode

- **GIVEN** an element inside `[data-theme="light"]`
- **WHEN** `--color-action-danger-default` is resolved
- **THEN** the system SHALL resolve it to `var(--primitive-red-30)`, with `--color-action-danger-text` resolving to `#ffffff`

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

### Requirement: Design-style tokens

The system SHALL define design-style tokens whose default values are no-ops. With these defaults, the default, light and calm themes SHALL render exactly as they did without the tokens.

The following tokens SHALL be declared in both the `:root` and `[data-theme="light"]` blocks of `colors.css`:

- **Gradients:** `--gradient-surface`, `--gradient-brand`, `--gradient-brand-hover`, `--gradient-brand-active`, `--gradient-accent` and `--gradient-backdrop`, each defaulting to `none`. `--gradient-brand-hover` and `--gradient-brand-active` replace `--gradient-brand` on the brand Button's hover and pressed states.
- **Layers:** `--texture-surface` and `--pattern-backdrop`, each defaulting to `none`.
- **Glass:** `--surface-blur`, a `backdrop-filter` value defaulting to `none`.
- **Style shadows:** `--shadow-offset`, `--shadow-raised`, `--shadow-pressed` and `--shadow-inset`, each defaulting to `0 0 0 0 transparent`.
- **Multi-accent palette:**
  - `--color-accent-1`, `--color-accent-2` and `--color-accent-3` SHALL alias `--color-accent-green`, `--color-accent-cyan` and `--color-accent-violet`.
  - `--color-accent-4` SHALL alias `--primitive-amber-10` in the default block and `--primitive-amber-40` in the light block.

Two further groups live in other files:

- `radius.css` SHALL define `--border-width: 1px`, `--border-width-strong: 2px` and `--border-style: solid`.
- `typography.css` SHALL define `--font-decorative: var(--font-display)` and `--heading-transform: none`.

Value rules:

- Gradient and layer tokens SHALL be usable as one or more non-final `background` layers. That is, an image with optional position/size, repeat and attachment, but no colour.
- Style-shadow tokens SHALL be usable as items of a `box-shadow` list.

`calm.css` SHALL declare every token in this requirement for both `calm` and `calm-dark`. (src: packages/ui/foundation/src/lib/styles/colors.css; packages/ui/foundation/src/lib/styles/radius.css; packages/ui/foundation/src/lib/styles/typography.css; packages/ui/foundation/src/lib/themes/calm.css; packages/ui/foundation/src/lib/styles/style-tokens.test.ts)

#### Scenario: Defaults are no-ops

- **WHEN** the style tokens are read from the default `:root` block and the light block
- **THEN** every gradient, layer and blur token SHALL be `none`, and every style shadow SHALL be `0 0 0 0 transparent`
- **AND** `--border-width`, `--border-width-strong` and `--border-style` SHALL be `1px`, `2px` and `solid`

#### Scenario: Calm stays complete

- **GIVEN** a new style token added to the default `:root` block of `colors.css`
- **WHEN** it has no value in `calm.css`
- **THEN** the calm token-completeness test SHALL fail and name the token

#### Scenario: A preset adds a texture with its own tile size

- **GIVEN** a theme that sets `--texture-surface: radial-gradient(#000 1px, transparent 1px) 0 0 / 12px 12px`
- **WHEN** a Card renders inside that theme
- **THEN** the Card background SHALL show the dot tile above its `--card-bg` colour

### Requirement: Design-style preset pack

The system SHALL ship optional design-style presets as CSS files at `packages/ui/foundation/src/lib/themes/<name>.css`, next to `calm.css`. Each preset SHALL define `[data-theme="<name>"]` and set `color-scheme`, and it MAY also define `[data-theme="<name>-dark"]`. The presets are: `minimal`, `flat`, `material`, `swiss`, `organic`, `maximalism`, `y2k`, `glass`, `neumorphism`, `skeuomorphism`, `brutalism`, `bento`, `clay`, `memphis`, `vaporwave`, `art-deco` and `editorial`.

A preset SHALL:

- be built only from foundation tokens;
- define every Layer 2 and Layer 3 token of the default `:root` block (except `--video-*`) and every design-style token;
- not redefine any `--primitive-*` or `--video-*` token;
- keep the calm pairing list at WCAG AA (at least 4.5:1 for text and 3:1 for UI);
- keep `--btn-brand-text` at 4.5:1 or more against every opaque `#rrggbb` stop of `--gradient-brand`, `--gradient-brand-hover` and `--gradient-brand-active`;
- when a layer of `--gradient-brand` is fully opaque, set `--gradient-brand-hover` and `--gradient-brand-active` to values distinct from it and from each other, so the brand Button keeps a visible hover and pressed colour change;
- keep every `--transition-*` at 200ms or less with a non-overshooting timing function.

The styles below SHALL be documented as covered by existing themes, not by new presets:

| Style | Covered by |
|-------|------------|
| Cyberpunk / neon | the default theme |
| Light | `[data-theme="light"]` |
| Corporate | `calm` / `calm-dark` |
| Retro | the `retro/` component family |

(src: packages/ui/foundation/src/lib/themes/; packages/ui/foundation/src/lib/themes/presets.test.ts; .storybook/static-docs/DesignTokens.mdx; README.md)

#### Scenario: Preset activation

- **GIVEN** the foundation styles and `themes/brutalism.css` are loaded
- **WHEN** `<html data-theme="brutalism">` is set
- **THEN** core components SHALL render with the preset's border, shadow and colour tokens, with no prop changes

#### Scenario: Preset contrast guard

- **WHEN** the preset guard test resolves the calm pairing list for every preset theme
- **THEN** every pairing SHALL meet WCAG AA

#### Scenario: Label on an opaque brand gradient

- **GIVEN** a preset whose `--gradient-brand-hover` has an opaque stop at 3:1 against `--btn-brand-text`
- **WHEN** the preset guard test runs
- **THEN** it SHALL fail and name the gradient token and the stop

#### Scenario: Opaque brand gradient without state variants

- **GIVEN** a preset with an opaque `--gradient-brand` and `--gradient-brand-hover: var(--gradient-brand)`
- **WHEN** the preset guard test runs
- **THEN** it SHALL fail, because the hover colour would be hidden

### Requirement: Stacking layer tokens

The system SHALL define, in `spacing.css` on `:root`, the theme-invariant stacking tokens `--z-nav` (fixed navigation, `1000`) and `--z-overlay` (modal overlays, `1100`). `--z-overlay` SHALL be greater than `--z-nav`. Theme presets SHALL NOT need to redefine them. (src: packages/ui/foundation/src/lib/styles/spacing.css; packages/ui/foundation/src/lib/styles/style-tokens.test.ts)

#### Scenario: Overlay above navigation

- **WHEN** `--z-nav` and `--z-overlay` are read from `spacing.css`
- **THEN** both SHALL be integers and `--z-overlay` SHALL be greater than `--z-nav`

