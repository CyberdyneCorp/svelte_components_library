## ADDED Requirements

### Requirement: Form label typography tokens

The system SHALL define, in the `:root` block of `typography.css`, five form label tokens whose defaults reproduce the previous label literals:

- `--input-label-font`: `var(--font-mono)`
- `--input-label-size`: `0.8125rem`
- `--input-label-weight`: `var(--font-weight-medium)`
- `--input-label-transform`: `uppercase`
- `--input-label-letter-spacing`: `0.04em`

The `calm` and `calm-dark` themes SHALL set `--input-label-font` to `var(--font-body)`, `--input-label-transform` to `none` and `--input-label-letter-spacing` to `normal`, and SHALL keep the default size and weight. Other presets MAY leave the tokens unset. (src: packages/ui/foundation/src/lib/styles/typography.css; packages/ui/foundation/src/lib/themes/calm.css; packages/ui/foundation/src/lib/styles/style-tokens.test.ts)

#### Scenario: Defaults keep the mono uppercase label

- **WHEN** the `:root` declarations of `typography.css` are read
- **THEN** the five `--input-label-*` tokens SHALL equal the defaults listed above

#### Scenario: Calm uses sentence case in the body font

- **GIVEN** an element with `data-theme="calm"` or `data-theme="calm-dark"`
- **WHEN** `--input-label-font` is resolved within that theme
- **THEN** it SHALL resolve to the Inter stack, not JetBrains Mono
- **AND** `--input-label-transform` SHALL be `none` and `--input-label-letter-spacing` SHALL be `normal`
