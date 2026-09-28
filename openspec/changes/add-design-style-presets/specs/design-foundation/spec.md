## ADDED Requirements

### Requirement: Design-style tokens

The system SHALL define design-style tokens whose default values are no-ops. With these defaults, the default, light and calm themes SHALL render exactly as they did without the tokens.

The following tokens SHALL be declared in both the `:root` and `[data-theme="light"]` blocks of `colors.css`:

- **Gradients:** `--gradient-surface`, `--gradient-brand`, `--gradient-accent` and `--gradient-backdrop`, each defaulting to `none`.
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

## MODIFIED Requirements

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
