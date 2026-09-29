## ADDED Requirements

### Requirement: Stacking layer tokens

The system SHALL define, in `spacing.css` on `:root`, the theme-invariant stacking tokens `--z-nav` (fixed navigation, `1000`) and `--z-overlay` (modal overlays, `1100`). `--z-overlay` SHALL be greater than `--z-nav`. Theme presets SHALL NOT need to redefine them. (src: packages/ui/foundation/src/lib/styles/spacing.css; packages/ui/foundation/src/lib/styles/style-tokens.test.ts)

#### Scenario: Overlay above navigation

- **WHEN** `--z-nav` and `--z-overlay` are read from `spacing.css`
- **THEN** both SHALL be integers and `--z-overlay` SHALL be greater than `--z-nav`
