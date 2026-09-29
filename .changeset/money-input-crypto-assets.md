---
"@cyberdynecorp/svelte-ui-core": minor
---

MoneyInput: support crypto/custom (non-ISO) assets. New optional `decimals` prop switches to asset mode — `currency` may be any asset code (USDC, ETH, BTC), input is parsed with exactly that many fraction digits using string math (18-decimal values stay exact), extra fraction digits are rejected, and the blurred value is formatted like `CurrencyDisplay` (`1.234,5678 ETH`). Optional `symbol` takes the locale's currency-symbol position. Invalid `decimals` or an empty asset code make the field read-only and warn once. ISO behaviour is unchanged without `decimals`. Also exports `formatAmount`, `resolveMinorUnits`, `exceedsDecimals` and `AmountFormatOptions`.
