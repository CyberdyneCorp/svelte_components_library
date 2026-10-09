## Context

`amountRounding` in `forms/MoneyInput/asset.ts` builds the `Intl.NumberFormat` fraction-digit options for both the formatted text and the sign probe, with `minimumFractionDigits === maximumFractionDigits === decimals`. `MoneyInput` shares the same options type for parsing and clamping through `resolveMinorUnits`.

## Decisions

- **`minDecimals` rather than a boolean `trimTrailingZeros`.** A lower bound covers both "drop every trailing zero" (`0`) and "stablecoins keep two digits" (`2`) with one prop, and reads like `decimals`. Default `undefined` means `decimals`, so the fixed width stays the default.
- **Only `minimumFractionDigits` changes.** `maximumFractionDigits` stays `decimals`, so rounding (half-expand at the asset precision), the "displays as zero" judgement and masking keep their current semantics; the mask sizer simply follows the shorter text.
- **Validation mirrors `decimals`.** A non-integer, negative or greater-than-`decimals` value throws a `RangeError` in the helpers and renders the em dash with one `console.warn` in the component, so a bad prop never throws from render. The warning key includes `minDecimals` so changing it to another invalid value warns again.
- **Not exposed on `MoneyInput`.** An editable field keeps the fixed precision; the option lives on the shared type so `formatAmount` callers can use it, but `MoneyInput` does not pass it.
- **`TokenBalanceRow` forwards only `data-*`.** Typed like `TextInput`'s passthrough; `class`, `role` and event handlers stay owned by the component so the row keeps its styling and list semantics.
