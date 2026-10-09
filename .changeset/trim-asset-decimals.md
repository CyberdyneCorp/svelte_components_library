---
"@cyberdynecorp/svelte-ui-core": minor
---

Add an optional `minDecimals` to CurrencyDisplay asset mode (and the shared `formatAmount` options) that drops trailing zeros down to that many fraction digits while `decimals` keeps setting the rounding precision. TokenBalanceRow forwards `minDecimals` to its amount and `data-*` attributes to its root element. Defaults are unchanged.
