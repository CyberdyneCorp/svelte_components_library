## Context

Form fields in core render a native control plus a label, hint and error. Their props list a fixed set of attributes, so anything else a consumer passes is dropped. `Button` already forwards `data-*` through a `dataAttrs` object. Labels copy the same mono uppercase style into 16 form components and two trading order-entry components, with no token between them and the theme.

## Goals / Non-Goals

**Goals**

- Consumers can set any native, `aria-*` or `data-*` attribute they need on the real control, without wrappers.
- Calm themes get sentence-case labels in the body font with no component props.
- No visual or behavioural change for existing usage.

**Non-Goals**

- No `Select` default change: the `"Select an option..."` placeholder stays the default.
- No generic rest props on every form control; this change covers the controls listed in issue #61.
- No change to the hidden-input technique of `Checkbox` / `Radio`.

## Decisions

### Rest props typed to `aria-*` and `data-*`

`TextInput` and `Button` spread the remaining props onto the native element, typed as `AriaAttributes` (from `svelte/elements`) plus a `data-${string}` index signature. `Select` accepts `data-*` only. The spread comes first, so component-managed attributes (`id`, `type`, `value`, `disabled`, `aria-invalid`, `aria-busy`, `aria-disabled`) always win. `TextInput` also declares `autocomplete`, `spellcheck`, `maxlength`, `name` and `inputmode` explicitly so they are documented and typed. Typing the rest props narrowly keeps `class` / `style` / event overrides out and makes typos a type error.

`Button` keeps `ariaLabel` and `dataAttrs`; an `aria-label` attribute is used when `ariaLabel` is empty.

### `aria-describedby` merge

`TextInput` removes `aria-describedby` from the rest props and joins it after its own id: `"<id>-error <consumer>"`, `"<id>-hint <consumer>"` or just `"<consumer>"`. The attribute is omitted when both are empty, as today.

### Select placeholder

`placeholder` becomes `string | null`. Falsy values (`null`, `""`) render no prompt option. The prompt option also loses its static `selected` attribute: `bind:value` already selects it while `value` is `""`, and a static `selected` competed with an explicit `""` option in `options`. When `options` contain a `""` option, the prompt is not rendered at all, so that option is the one shown checked. `id` falls back to the generated id; `ariaLabel` is applied only when there is no visible `label`, matching `Checkbox`.

### Label tokens live in typography.css

The five `--input-label-*` tokens sit in the `typography.css` `:root` block, next to `--heading-transform`, inside a delimited comment block. They are type style tokens with literal defaults, so presets are not required to redeclare them (unlike the Layer 3 colour tokens in `colors.css`). `calm.css` sets font, transform and letter spacing in the block shared by `calm` and `calm-dark`; size and weight keep the defaults. `--input-label-font` in calm is `var(--font-body)`, which resolves against calm's own `--font-body` (Inter).

The trading `LeverageSlider` label and `SegmentedRadio` legend use the same tokens because they paint `--input-label` and are form labels in `OrderTicket`. `ScheduleConfig` field labels (`.cy-sched__field-label`) use the font, transform and letter-spacing tokens but keep their smaller size and tertiary colour.

### Contract test

`style-contract.test.ts` lists every label rule and checks that `font-family`, `text-transform` and `letter-spacing` are the token references. A second check scans every rule painted with `color: var(--input-label)` so a new form label that hard-codes these properties fails the build.

### Playwright guidance

A probe against the real CSS showed that `getByLabel(...).check()` and `getByRole("checkbox").check()` time out ("waiting for element to be visible"), while `getByText(<label text>).check()` succeeds because Playwright forwards the action from a `<label>` to its control. The docs recommend the label-text locator for actions and `getByLabel` for assertions.

## Risks / Trade-offs

- A theme that redefines `--font-mono` on a subtree keeps the label font resolved at `:root` unless it also redeclares `--input-label-font`. No shipped preset changes `--font-mono`; the typography.css comment documents this.
- Rest props allow any `aria-*` attribute, including ones that conflict with the control's semantics. The component-managed ones are protected by attribute order; the rest are the consumer's responsibility.
