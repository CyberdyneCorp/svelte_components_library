---
"@cyberdynecorp/svelte-ui-core": minor
"@cyberdynecorp/svelte-ui-foundation": minor
---

Decimal-safe `LiquidityPositionCard` and themeable liquidity widgets.

- `LiquidityPositionCard`: new optional `valueMoney`, `pnlMoney`, `uncollectedFees` (per token), `uncollectedTotal` and `locale` props rendered through `CurrencyDisplay` (no float maths); they take precedence over the number props. `value`, `pnl`, `feeApyPct` and `uncollected` are now optional and their rows are hidden when absent. New `feeTier`, `tokenId`, `chain`, `walletLabel` and `rangeText` (screen-reader sentence; the range bar becomes decorative and `aria-hidden`). Exports the `LiquidityMoney` and `LiquidityTokenAmount` types.
- `LiquidityRangeBar`: new `decorative` prop that drops the `group`/`progressbar` roles and `aria-value*`. The progressbar now carries `ariaLabel` as its accessible name, and the bounds text uses `--color-text-secondary` for AA contrast on card surfaces.
- `TokenPairIcon`: new `showInitials` and `maxInitials` (default 2) props; ring colours default to the `--tpair-a-bg` / `--tpair-b-bg` tokens.
- Foundation: new Layer 3 tokens `--lpos-border`, `--lpos-radius`, `--lrange-track-bg`, `--lrange-track-border`, `--lrange-radius`, `--lrange-marker-color`, `--tpair-ring-border`, `--tpair-a-bg`, `--tpair-b-bg`, `--tpair-initials-color`. Defaults match the previous look in every theme; `calm` / `calm-dark` use hairline subtle borders, a pill track and tinted initials.
