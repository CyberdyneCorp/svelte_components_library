## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Complete token surface for core

The system SHALL define, in both the default (dark) and `[data-theme="light"]` blocks, every token in a foundation-owned namespace that `@cyberdynecorp/svelte-ui-core` references. The namespaces are the prefixes foundation itself defines: `--color-`, `--primitive-`, `--shadow-`, `--font-`, `--space-`, `--radius-`, `--transition-`, `--btn-`, `--input-`, `--card-`, `--table-`, `--nav-` and `--video-`. This includes the action tint tokens `--color-action-{brand,secondary}-{bg,border}`, the danger action family `--color-action-danger-{default,hover,active,text}`, the decorative accents `--color-accent-{green,cyan,violet}`, `--color-syntax-number`, `--shadow-glow-red`, and `--nav-height`. `--btn-danger-*` SHALL alias `--color-action-danger-*`. (src: packages/ui/foundation/src/lib/styles/colors.css; packages/ui/core/src/lib/token-coverage.test.ts)

#### Scenario: Undefined token is rejected

- **GIVEN** a core component that references `var(--color-surface-base)`, which foundation does not define
- **WHEN** the unit test suite runs
- **THEN** `token-coverage.test.ts` SHALL fail and name the token and the file that references it

#### Scenario: Danger action token themed in light mode

- **GIVEN** an element inside `[data-theme="light"]`
- **WHEN** `--color-action-danger-default` is resolved
- **THEN** the system SHALL resolve it to `var(--primitive-red-30)`, with `--color-action-danger-text` resolving to `#ffffff`
