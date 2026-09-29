---
"@cyberdynecorp/svelte-ui-core": minor
---

CurrencyDisplay: new `decimals` and `symbol` props for crypto and other non-ISO assets (USDC, ETH, BTC). With `decimals` set, `currency` may be any asset code and the amount is formatted from its decimal string with exactly that many fraction digits, locale grouping, sign display and masking (e.g. pt-BR `1.234,5678 ETH`). ISO currency behaviour is unchanged when `decimals` is omitted.
