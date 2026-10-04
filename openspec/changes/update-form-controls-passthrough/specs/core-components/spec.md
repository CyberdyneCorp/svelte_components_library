## ADDED Requirements

### Requirement: Form labels use label typography tokens

Every form field label in core SHALL take `font-family`, `text-transform` and `letter-spacing` from `var(--input-label-font)`, `var(--input-label-transform)` and `var(--input-label-letter-spacing)`, and SHALL NOT hard-code those properties. Labels that used the default label size and weight SHALL take them from `var(--input-label-size)` and `var(--input-label-weight)`. This covers `TextInput`, `Select`, `NumberInput`, `MoneyInput`, `PasswordInput`, `Textarea`, `DatePicker`, `DateRangePicker`, `TimePicker`, `ComboBox`, `MultiSelect`, `TagInput`, `RangeSlider`, `CodeEditor`, `ColorPicker`, `ScheduleConfig` (group and field labels), `LeverageSlider` and the `SegmentedRadio` legend, and any rule painted with `color: var(--input-label)`. With default tokens every label SHALL render as before. (src: packages/ui/core/src/lib/forms; packages/ui/core/src/lib/trading/order/LeverageSlider.svelte; packages/ui/core/src/lib/trading/order/SegmentedRadio.svelte; packages/ui/core/src/lib/style-contract.test.ts)

#### Scenario: Hard-coded label typography fails

- **GIVEN** a form label rule that declares `text-transform: uppercase` or `font-family: var(--font-mono)`
- **WHEN** the style-contract test runs
- **THEN** it SHALL fail and name the rule and declaration

#### Scenario: Calm label

- **GIVEN** a `TextInput` with `label="Full name"` inside `data-theme="calm"`
- **WHEN** it renders
- **THEN** the label's computed `text-transform` SHALL be `none`, its `letter-spacing` `normal`, and its font family SHALL start with Inter
- **AND** a `TextInput` label outside the calm subtree SHALL stay uppercase in JetBrains Mono

### Requirement: TextInput native attribute passthrough

`TextInput` SHALL forward `autocomplete`, `spellcheck`, `maxlength`, `name` and `inputmode` to its native `<input>`, and SHALL forward any other `aria-*` or `data-*` attribute passed to it. Component-managed attributes (`id`, `type`, `value`, `disabled`, `required`, `placeholder`, `aria-invalid`) SHALL take precedence over forwarded ones. A consumer `aria-describedby` SHALL be appended after the component's own error or hint id, separated by a space, and the attribute SHALL be omitted when neither exists. (src: packages/ui/core/src/lib/forms/TextInput/TextInput.svelte)

#### Scenario: Native attributes reach the input

- **GIVEN** `autocomplete="off"`, `spellcheck={false}`, `maxlength={42}`, `name="wallet"`, `inputmode="text"` and `data-testid="address"`
- **WHEN** the `TextInput` renders
- **THEN** the native `<input>` SHALL carry `autocomplete="off"`, `spellcheck="false"`, `maxlength="42"`, `name="wallet"`, `inputmode="text"` and `data-testid="address"`

#### Scenario: aria-describedby is merged

- **GIVEN** `id="addr"`, `hint="0x…"` and `aria-describedby="external"`
- **WHEN** the `TextInput` renders
- **THEN** the input's `aria-describedby` SHALL be `"addr-hint external"`
- **AND** with `error="Invalid"` instead of a hint it SHALL be `"addr-error external"`
- **AND** without hint or error it SHALL be `"external"`

### Requirement: Select placeholder and attributes

`Select` SHALL keep `"Select an option..."` as the default `placeholder`, rendered as a hidden, disabled `""` option that is selected while `value` is `""`. It SHALL accept `placeholder={null}` (or `""`) to render only `options`. It SHALL NOT render the placeholder option when `options` contain an option whose value is `""`. It SHALL forward `id` to the native `<select>` (and its label), use `ariaLabel` as the `aria-label` when no visible `label` is set, and forward `data-*` attributes to the native `<select>`. (src: packages/ui/core/src/lib/forms/Select/Select.svelte)

#### Scenario: Default placeholder unchanged

- **GIVEN** two options and no `value`
- **WHEN** the `Select` renders
- **THEN** it SHALL render three options, the first being the hidden, disabled `"Select an option..."` option, and it SHALL be selected

#### Scenario: Placeholder opt-out

- **GIVEN** `placeholder={null}`, options `a` and `b`, and `value="b"`
- **WHEN** the `Select` renders
- **THEN** it SHALL render only the options `a` and `b`, with no hidden option, and `b` SHALL be selected

#### Scenario: Explicit empty option wins

- **GIVEN** options `""` ("All"), `a` and `b`, the default placeholder, and `value=""`
- **WHEN** the `Select` renders
- **THEN** no hidden placeholder option SHALL be rendered and the checked option SHALL be "All"

#### Scenario: Visually hidden label

- **GIVEN** `ariaLabel="Category"`, `id="row-1"` and `data-row="1"`, and no `label`
- **WHEN** the `Select` renders
- **THEN** the native `<select>` SHALL have the accessible name "Category", `id="row-1"` and `data-row="1"`

### Requirement: Button ARIA passthrough and element ref

`Button` SHALL forward any `aria-*` and `data-*` attribute passed to it (e.g. `aria-expanded`, `aria-controls`, `aria-pressed`) to the native `<button>`, while `aria-busy` and `aria-disabled` stay driven by `loading` and `disabled`. An `aria-label` attribute SHALL be used when `ariaLabel` is empty. `Button` SHALL expose a bindable `ref` holding the native `<button>` element. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte)

#### Scenario: Disclosure button

- **GIVEN** `aria-expanded={false}` and `aria-controls="panel-1"`
- **WHEN** the `Button` renders
- **THEN** the native `<button>` SHALL carry `aria-expanded="false"` and `aria-controls="panel-1"`

#### Scenario: Focus through ref

- **GIVEN** a parent that binds `bind:ref` on a `Button`
- **WHEN** the parent calls `ref.focus()`
- **THEN** the native `<button>` SHALL become the active element

### Requirement: NumberInput step button labels

`NumberInput` SHALL accept `decreaseLabel` and `increaseLabel` props, defaulting to `"Decrease"` and `"Increase"`, and SHALL use them as the accessible names of its decrement and increment buttons. (src: packages/ui/core/src/lib/forms/NumberInput/NumberInput.svelte)

#### Scenario: Localised step buttons

- **GIVEN** `decreaseLabel="Diminuir"` and `increaseLabel="Aumentar"`
- **WHEN** the `NumberInput` renders
- **THEN** its step buttons SHALL be named "Diminuir" and "Aumentar"
- **AND** without those props they SHALL be named "Decrease" and "Increase"

### Requirement: Checkbox and Radio end-to-end testing guidance

The README and the `Checkbox` / `Radio` Storybook descriptions SHALL state that the native input is visually hidden (1×1 px, clipped), that Playwright's `.check()` on a `getByLabel` / `getByRole` locator does not pass the visibility check, and that tests SHALL call `.check()` on the visible label text (e.g. `page.getByText("Accept terms").check()`) and use `getByLabel` / `getByRole` for assertions. (src: README.md; packages/ui/core/src/lib/forms/Checkbox/Checkbox.stories.svelte; packages/ui/core/src/lib/forms/Radio/Radio.stories.svelte)

#### Scenario: Documented locator

- **WHEN** a consumer reads the README Form controls section or the Checkbox / Radio docs page
- **THEN** it SHALL show `page.getByText(<label>).check()` for the action and `expect(page.getByLabel(<label>)).toBeChecked()` for the assertion
