## ADDED Requirements

### Requirement: Liquidity component tokens

Foundation SHALL define Layer 3 tokens for the liquidity widgets in `colors.css`, in both `:root` and `[data-theme="light"]`, within one comment-delimited block:

- `--lpos-border` and `--lpos-radius`, for the `LiquidityPositionCard` frame.

#### Scenario: Complete Liquidity component tokens contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

Foundation SHALL define Layer 3 tokens for the liquidity widgets in `colors.css`, in both `:root` and `[data-theme="light"]`, within one comment-delimited block:

- `--lpos-border` and `--lpos-radius`, for the `LiquidityPositionCard` frame.
- `--lrange-track-bg`, `--lrange-track-border`, `--lrange-radius` and `--lrange-marker-color`, for the `LiquidityRangeBar` track and marker.
- `--tpair-ring-border`, `--tpair-a-bg`, `--tpair-b-bg` and `--tpair-initials-color`, for the `TokenPairIcon` rings and initials.

The defaults SHALL reproduce the previous hard-coded look: `2px solid var(--color-text-primary)` borders, `0` radii, `var(--color-surface-raised)` track, `var(--color-text-primary)` marker, brand / secondary default ring fills and `var(--color-text-inverse)` initials. Every design-style preset SHALL redefine them with the same values. `calm` and `calm-dark` SHALL use `1px solid var(--color-border-subtle)` borders, `var(--radius-pill)` for the track, `var(--radius-lg)` for the card, `var(--color-action-brand-bg)` / `var(--color-action-secondary-bg)` ring fills and `var(--color-text-primary)` initials. In every preset, `--tpair-initials-color` SHALL meet 4.5:1 on `--tpair-a-bg` and `--tpair-b-bg`. (src: packages/ui/foundation/src/lib/styles/colors.css; packages/ui/foundation/src/lib/themes/calm.css; packages/ui/foundation/src/lib/themes/presets.test.ts; packages/ui/foundation/src/lib/styles/style-tokens.test.ts)

#### Scenario: Defaults keep today's look

- **WHEN** the `:root` and light declarations of `colors.css` are read
- **THEN** `--lrange-track-border`, `--tpair-ring-border` and `--lpos-border` SHALL be `2px solid var(--color-text-primary)` and `--lrange-radius` SHALL be `0`

#### Scenario: Calm softens the widgets

- **WHEN** the declarations for `data-theme="calm"` or `data-theme="calm-dark"` are collected
- **THEN** the three border tokens SHALL be `1px solid var(--color-border-subtle)`, `--lrange-radius` SHALL be `var(--radius-pill)` and `--tpair-initials-color` SHALL be `var(--color-text-primary)`

#### Scenario: Presets stay complete and legible

- **GIVEN** the preset completeness and contrast guards
- **WHEN** they run for every preset
- **THEN** every preset SHALL define all ten tokens
- **AND** `--tpair-initials-color` SHALL reach at least 4.5:1 on both ring fills
