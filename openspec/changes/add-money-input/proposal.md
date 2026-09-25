## Why

`NumberInput` has no currency or locale formatting, has no notion of a currency's minor units, and exposes its value as a JS `number`, which silently loses precision on large amounts. Finance consumers (CyberWealth, issue #12) need a money field whose value is exact and locale-aware.

## What Changes

- Add a `MoneyInput` form component (`forms/MoneyInput/`).
  - Its value is a canonical decimal string (`"1234.56"`) or `null` when empty, never a number.
  - It formats with `Intl.NumberFormat` currency style on blur and shows a plain editable number on focus.
  - While the user types, it accepts either `.` or `,` as the decimal separator and limits fraction digits to the currency's minor units.
  - It clamps to decimal-string `min`/`max` bounds on blur.
  - When `name` is set, it posts the canonical value through a hidden input.
- Add pure, float-free money helpers in `forms/MoneyInput/money.ts`: `parseMoneyInput`, `formatMoney`, `currencyMinorUnits`, `toMinorUnits`, `fromMinorUnits`, `compareMoney`, `clampMoney`, `sanitizeMoneyTyping`, `toEditableMoney`. They are exported from the package root so the upcoming `CurrencyDisplay` (#13) can reuse them.
- This change is purely additive; nothing breaks.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the MoneyInput contract.

## Impact

- `packages/ui/core/src/lib/forms/MoneyInput/*`, plus a barrel export in `packages/ui/core/src/lib/index.ts`.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
- Relies on `Intl.NumberFormat` formatting numeric strings exactly (NumberFormat v3), which is supported by current evergreen browsers and Node ≥ 19.
