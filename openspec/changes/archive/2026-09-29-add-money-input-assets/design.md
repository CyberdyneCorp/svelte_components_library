## Context

`MoneyInput` parses typed text with `parseMoneyInput(raw, minorUnits)`, clamps with `clampMoney(value, minorUnits)`, and formats the unfocused value with `formatMoney` (Intl currency style). `minorUnits` comes from `currencyMinorUnits(currency)`, which throws for four-letter codes and returns 2 for unknown three-letter codes. Every parsing helper already takes `minorUnits` as a parameter, so assets only need a different source of precision and a different formatter. `CurrencyDisplay` already has that formatter (`formatAsset`) and the validation (integer 0–100, non-empty code).

## Goals / Non-Goals

**Goals**

- Same `decimals`/`symbol` semantics as `CurrencyDisplay`.
- Exact entry of 6-, 8- and 18-decimal assets in any locale.
- Zero change for ISO usage (value format, separator rule, display, hidden input).

**Non-Goals**

- No asset registry and no default decimals per ticker.
- No `currencyDisplay` prop on `MoneyInput`.

## Decisions

### Shared asset module

`formatAsset`, the decimals validation and the rounding options move from `currencyDisplay.ts` to `forms/MoneyInput/asset.ts`, next to `money.ts`. `CurrencyDisplay` already depended on `money.ts`, so the dependency direction is unchanged. `currencyDisplay.ts` re-exports `formatAsset` and the option types, so its existing imports keep working.

- `resolveMinorUnits(options)` returns `decimals` in asset mode (throws on invalid decimals or an empty code), else `currencyMinorUnits`.
- `amountRounding(options)` gives the Intl options that round like the displayed amount. It is used by the `CurrencyDisplay` sign probe and by `formatAsset`.
- `formatAmount(value, options)` dispatches to `formatAsset` or `formatMoney`.

### Separator rule and excess digits

The last-separator rule is unchanged: the last `.` or `,` is the decimal mark when at most `decimals` digits follow it. With 6–18 decimals this means `1.234` is 1.234 BTC in every locale, which is the natural reading for crypto.

For ISO currencies a longer tail means grouping (`1.500` JPY → 1500). For assets, a tail longer than `decimals` is almost always a mistyped or over-precise fraction (`0.1234567` USDC). Reading it as grouping would silently turn it into 1,234,567 USDC. So in asset mode the component rejects that input: the field keeps its previous text and `value` does not change. `exceedsDecimals(raw, decimals)` implements the check. A tail of exactly three digits is still accepted as a thousands group, which only matters for assets with fewer than three decimals. ISO mode never calls it.

### Invalid configuration

`CurrencyDisplay` shows an em dash and warns once. An input cannot show an em dash without losing the value. So with invalid `decimals` or an empty code, `MoneyInput`:

- renders the input `disabled` with `aria-invalid="true"`,
- shows the raw canonical `value` and keeps it, including the hidden form input,
- ignores input events,
- calls `console.warn` once per `currency|decimals` pair.

It does not throw. An invalid ISO code without `decimals` keeps today's behaviour, which is unchanged.

### Display and affix

The unfocused text uses `formatAmount`, so assets read exactly as in `CurrencyDisplay` (`1.234,567800000000000000 ETH`, `₿1.50000000`). While focused, the affix keeps showing the `currency` code, as it does for ISO currencies.

## Risks / Trade-offs

- Rejecting a pasted over-precise value drops the whole paste. Truncating would silently change the amount, so rejection is the safer choice for money.
- `1.234.567` with 8 decimals is read as 1234.567, as the separator rule requires. Users who type grouping must use a decimal mark too. This is the same rule as for ISO.
