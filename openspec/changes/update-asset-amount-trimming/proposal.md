## Why

In asset mode `CurrencyDisplay` always shows exactly `decimals` fraction digits, so a `TokenBalanceRow` with `decimals={6}` renders `2.000000 ETH`. CyberWealth's holdings rule is "at most 6 fraction digits with trailing zeros dropped, stablecoins fixed at 2", which the fixed width cannot express; the app also keeps `data-holding` hooks on its wallet rows and `TokenBalanceRow` drops unknown attributes. Both keep the app on its own row component (UP-12).

## What Changes

- `CurrencyDisplay` (and the shared `AmountFormatOptions` behind `formatAmount` / `formatAsset`): optional `minDecimals` in asset mode. Trailing zeros are dropped down to `minDecimals` fraction digits; `decimals` still sets the rounding precision and the parsing precision of `resolveMinorUnits`. Invalid values (not an integer, below 0 or above `decimals`) are treated like invalid `decimals`: em dash plus a single warning. Ignored in ISO mode, like `symbol`.
- `TokenBalanceRow`: optional `minDecimals` forwarded to the amount's `CurrencyDisplay`; `data-*` attributes forwarded to the root element (`div` or `li`).
- Purely additive; omitting `minDecimals` renders exactly as before.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: extends the CurrencyDisplay custom asset amounts requirement with `minDecimals`; adds a TokenBalanceRow trimmed amounts and root attributes requirement.

## Impact

- `packages/ui/core/src/lib/forms/MoneyInput/asset.ts`, `packages/ui/core/src/lib/data/CurrencyDisplay/*`, `packages/ui/core/src/lib/crypto/TokenBalanceRow/*`, README Data and Crypto lists, `documentation/TRD.md`.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
