## Why

CyberWealth moved its forms to `@cyberdynecorp/svelte-ui-core` 0.13.0 and reported the gaps that still force app-local controls (issue #61, part 4):

- `TextInput` drops native attributes it needs for wallet addresses, typed confirmations and secrets (`autocomplete`, `spellcheck`, `maxlength`, `name`, `inputmode`), replaces any consumer `aria-describedby`, and cannot carry `data-*` test hooks.
- `Select` has no `id`, `data-*` or accessible name without a visible label (list rows). Its hidden placeholder option also stays checked when `options` already contain an explicit `""` option such as "All".
- `Button` cannot express a disclosure (`aria-expanded`, `aria-controls`) and gives no handle on the native element for focus return.
- `NumberInput` step buttons are named in English only.
- `Checkbox` / `Radio` hide the native input (1×1 px, clipped), so Playwright's `getByLabel(...).check()` times out. This is not documented.
- Every form field label hard-codes `font-family: var(--font-mono)`, `text-transform: uppercase` and `letter-spacing: 0.04em`. In the calm themes this reads as a terminal and cannot be changed without overriding component CSS.

## What Changes

- New foundation typography tokens `--input-label-font`, `--input-label-size`, `--input-label-weight`, `--input-label-transform` and `--input-label-letter-spacing` in `typography.css`. Their defaults are the current literals (mono, 0.8125rem, medium, uppercase, 0.04em). `calm` / `calm-dark` set the font to `var(--font-body)`, the transform to `none` and the letter spacing to `normal`.
- Every form field label in core uses those tokens: `TextInput`, `Select`, `NumberInput`, `MoneyInput`, `PasswordInput`, `Textarea`, `DatePicker`, `DateRangePicker`, `TimePicker`, `ComboBox`, `MultiSelect`, `TagInput`, `RangeSlider`, `CodeEditor`, `ColorPicker`, `ScheduleConfig` (group and field labels), and the trading `LeverageSlider` / `SegmentedRadio` labels. A style-contract test forbids hard-coded label typography.
- `TextInput`: forwards `autocomplete`, `spellcheck`, `maxlength`, `name`, `inputmode` and any other `aria-*` / `data-*` attribute to the native `<input>`. A consumer `aria-describedby` is appended after the component's own hint / error id.
- `Select`: `placeholder` accepts `null` to opt out (the default string is unchanged); the placeholder is not rendered when `options` include a `""` option; new `id`, `ariaLabel` and `data-*` passthrough.
- `Button`: forwards any `aria-*` / `data-*` attribute and adds a bindable `ref` to the native `<button>`.
- `NumberInput`: `decreaseLabel` / `increaseLabel` props (defaults `"Decrease"` / `"Increase"`).
- `Checkbox` / `Radio`: README and Storybook docs explain how to drive them from Playwright.
- All changes are additive; default rendering and existing props are unchanged.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: form control attribute passthrough, `Select` placeholder opt-out, `Button` ARIA passthrough and ref, `NumberInput` step labels, tokenised form labels.
- `design-foundation`: form label typography tokens with calm overrides.

## Impact

- `packages/ui/foundation/src/lib/styles/typography.css`, `packages/ui/foundation/src/lib/themes/calm.css`, `style-tokens.test.ts`.
- `packages/ui/core/src/lib/forms/*` (label CSS; `TextInput`, `Select`, `NumberInput`, `Checkbox` / `Radio` docs), `primitives/Button`, `trading/order/LeverageSlider.svelte`, `trading/order/SegmentedRadio.svelte`, `style-contract.test.ts`.
- README (Form controls section, Typography note).
- Minor version bumps of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation`.
