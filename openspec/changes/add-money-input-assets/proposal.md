## Why

`CurrencyDisplay` gained asset mode (`decimals`, `symbol`) in core 0.12.0, but `MoneyInput` still derives its precision from `Intl` currency style. `USDC` throws, and `ETH`/`BTC` are accepted as unknown ISO codes with two fraction digits, so a consumer (CyberWealth) cannot let users enter crypto amounts. The design of `add-currency-display-assets` (`openspec/changes/archive/2026-09-29-add-currency-display-assets/design.md`) listed this as the follow-up.

## What Changes

- Add two optional props to `MoneyInput`, with the same meaning as on `CurrencyDisplay`:
  - `decimals?: number` switches to asset mode. `currency` may then be any non-empty asset code, and input is parsed, clamped and emitted with exactly `decimals` fraction digits (integer 0–100). String/BigInt math only, so 18-decimal values stay exact.
  - `symbol?: string` (asset mode only) is placed where the locale puts currency symbols in the unfocused text. `MoneyInput` already shows its amount with a currency affix (Intl currency style when unfocused), so the symbol mirrors `CurrencyDisplay` placement there.
- In asset mode, typed or pasted text whose fraction is longer than `decimals` is rejected (the field keeps its previous text) instead of being read as grouping.
- Invalid `decimals` or an empty asset code make the field read-only (`disabled`, `aria-invalid`), keep `value` and the hidden input untouched, show the raw value, and warn once. Nothing throws.
- Shared helpers move to `forms/MoneyInput/asset.ts` (`formatAsset`, `formatAmount`, `resolveMinorUnits`, `amountRounding`) and are reused by `CurrencyDisplay`. New `exceedsDecimals` in `money.ts`. `formatAmount`, `resolveMinorUnits`, `exceedsDecimals` and `AmountFormatOptions` are exported.
- Purely additive. Without `decimals`, ISO behaviour is unchanged.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the MoneyInput asset-mode requirement.

## Impact

- `packages/ui/core/src/lib/forms/MoneyInput/*`, `packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts` (refactor only), public exports in `src/lib/index.ts`, README Forms list.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
