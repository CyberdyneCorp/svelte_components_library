## 1. Label tokens

- [x] 1.1 Add `--input-label-font`, `--input-label-size`, `--input-label-weight`, `--input-label-transform`, `--input-label-letter-spacing` to `typography.css` with the current literals as defaults
- [x] 1.2 Set font, transform and letter spacing for `calm` / `calm-dark` in `calm.css`
- [x] 1.3 Use the tokens in every form field label (16 form components, `ScheduleConfig` field labels, `LeverageSlider`, `SegmentedRadio`)
- [x] 1.4 Foundation test for defaults and calm values; core style-contract test against hard-coded label typography; Storybook play test comparing default and calm computed styles

## 2. Form controls

- [x] 2.1 `TextInput`: `autocomplete`, `spellcheck`, `maxlength`, `name`, `inputmode`, `aria-*` / `data-*` rest props, merged `aria-describedby`
- [x] 2.2 `Select`: `placeholder={null}` opt-out, no placeholder beside a `""` option, `id`, `ariaLabel`, `data-*`
- [x] 2.3 `Button`: `aria-*` / `data-*` rest props and `bind:ref`
- [x] 2.4 `NumberInput`: `decreaseLabel` / `increaseLabel`
- [x] 2.5 Unit tests for each passthrough, the placeholder default and opt-out, the `""` option regression, Button ARIA and ref, NumberInput labels

## 3. Docs

- [x] 3.1 Stories: TextInput `NativeAttributes` and `CalmLabels`, Select `NoPlaceholder` / `EmptyOption` / `VisuallyHiddenLabel`, Button `Disclosure`, NumberInput `LocalizedButtons`; component descriptions for TextInput, Select, Button, Checkbox, Radio
- [x] 3.2 README Form controls section (including Playwright guidance for Checkbox / Radio) and Typography note

## 4. Release

- [x] 4.1 Changesets: minor `@cyberdynecorp/svelte-ui-core`, minor `@cyberdynecorp/svelte-ui-foundation`
- [ ] 4.2 Archive this change once released
