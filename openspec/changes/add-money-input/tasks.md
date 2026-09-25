## 1. Money helpers

- [x] 1.1 Add BigInt-based `toMinorUnits` / `fromMinorUnits`, `compareMoney` and `clampMoney` (no floats)
- [x] 1.2 Add `currencyMinorUnits` from `Intl.NumberFormat#resolvedOptions`
- [x] 1.3 Add `sanitizeMoneyTyping` and `parseMoneyInput` implementing the last-separator rule
- [x] 1.4 Add `formatMoney` (string input to Intl) and `toEditableMoney`
- [x] 1.5 Unit-test the helpers, including the `12345678901234.56` round-trip, JPY (0) and BHD (3)

## 2. MoneyInput component

- [x] 2.1 Build `MoneyInput.svelte` with bindable `value: string | null`, `currency`, `locale`, `min`, `max`, `label`, `error`, `hint`, `name`, `disabled`, `required`, `id`, `allowNegative`, `onchange`
- [x] 2.2 Format on blur and show the editable number on focus; clamp on blur
- [x] 2.3 Add a11y: tie the label with `for`/`id`, `inputmode="decimal"`, `aria-invalid`, `aria-describedby` linking the hint and the error, and `role="alert"` on the error
- [x] 2.4 Add component tests, stories (USD, EUR de-DE, JPY, error, disabled, negative, empty) and the barrel export

## 3. Release

- [x] 3.1 Add a changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [ ] 3.2 Archive this change once released
