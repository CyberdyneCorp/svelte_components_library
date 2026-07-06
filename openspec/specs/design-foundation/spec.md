# Design Foundation

## Purpose

The `@cyberdynecorp/svelte-ui-foundation` package provides the design system's tokens: colors, typography, spacing, radius, and animations. It follows a three-layer CSS custom-property architecture (primitives -> semantic -> component) so that all components consume tokens rather than literal values, and theming is achieved entirely at the token layer. The system is dark-first with an opt-in light theme. A TypeScript token object mirrors a subset of the CSS tokens for programmatic use.

## Requirements

### Requirement: Three-layer token architecture

The system SHALL define color tokens in three layers within a single `:root` block: Layer 1 primitives (raw hex values named `--primitive-{family}-{step}`), Layer 2 semantic tokens (named `--color-{category}-{role}`, each resolving to a `var(--primitive-*)` or `rgba()`), and Layer 3 component tokens (named `--{component}-{property}`, each resolving to a Layer 2 `var(--color-*)` token, except the two enumerated `--btn-danger-*` tokens that reference primitives directly). (src: packages/ui/foundation/src/lib/styles/colors.css:1-176)

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
