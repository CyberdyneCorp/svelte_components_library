## ADDED Requirements

### Requirement: Trade direction colour tokens

Foundation SHALL define `--color-trade-long`, `--color-trade-long-bg`, `--color-trade-long-text`, `--color-trade-short`, `--color-trade-short-bg` and `--color-trade-short-text` in `:root`, in `[data-theme="light"]` and in every theme preset. The `-text` variants SHALL meet WCAG AA (4.5:1) against the theme's default and raised surfaces. Core trading components SHALL use only these tokens for long/short, buy/sell and up/down colouring.

#### Scenario: A preset defines the trade tokens

- **GIVEN** any theme preset in `packages/ui/foundation/src/lib/themes/`
- **WHEN** the preset completeness and contrast tests run
- **THEN** all six trade tokens SHALL be defined and the `-text` variants SHALL pass AA on the preset's surfaces

#### Scenario: Red-up markets

- **GIVEN** an app that sets `--color-trade-long` to a red and `--color-trade-short` to a green
- **WHEN** trading components render
- **THEN** long / buy / up states SHALL render red and short / sell / down states green, with no component changes
