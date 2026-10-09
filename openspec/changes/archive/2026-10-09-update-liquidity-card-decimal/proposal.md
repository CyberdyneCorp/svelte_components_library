## Why

CyberWealth (calm / calm-dark themes, pt-BR and en) still keeps app-local liquidity widgets (issue #61, parts 1–3):

- `LiquidityPositionCard` takes `value`, `pnl` and `uncollected` as JS numbers, so wei-scale amounts lose precision; `uncollected` is one value although a Uniswap v3 position owes fees in both tokens; `pnl` and `feeApyPct` are required even when the app has no figure; and there is no fee tier, position id, chain or wallet label.
- The price range is only exposed as a `progressbar` with raw numbers. The app wants one sentence for screen readers and a purely visual bar, but the bar keeps `role="progressbar"` and `aria-value*` even inside `aria-hidden` containers.
- `LiquidityRangeBar`, `TokenPairIcon` and the card hard-code `2px solid var(--color-text-primary)` borders and square corners, which look heavy in the calm themes, and the pair icon always shows two-letter initials in white on a saturated fill.

## What Changes

- `LiquidityPositionCard` (all additive, existing props render exactly as before):
  - New decimal-safe props rendered through `CurrencyDisplay` (strings end to end, no float maths): `valueMoney` and `pnlMoney` (`{ amount: string; currency: string; decimals?: number }`), `uncollectedFees` (`{ asset: string; amount: string; decimals?: number }[]`, one entry per token), `uncollectedTotal` (approximate total) and `locale`. They take precedence over `value`, `pnl` and `uncollected`.
  - `value`, `pnl`, `feeApyPct` and `uncollected` become optional; the P&L, fee APY and uncollected rows are hidden when their data is absent.
  - `feeTier` in the title; `tokenId`, `chain` and `walletLabel` as a subtitle.
  - `rangeText`: a screen-reader sentence that describes the card; the range bar is then rendered `decorative` inside an `aria-hidden` wrapper.
  - Exported types `LiquidityMoney` and `LiquidityTokenAmount`.
- `LiquidityRangeBar`: `decorative` prop that drops the `group` / `progressbar` roles and `aria-value*`. The progressbar also gets `ariaLabel` as its accessible name (axe `aria-progressbar-name`), and the bounds text moves to `--color-text-secondary` for AA contrast on card surfaces.
- `TokenPairIcon`: `showInitials` (default `true`) and `maxInitials` (default `2`); ring colours default to tokens instead of inline styles (`tokenAColor` / `tokenBColor` still override).
- Foundation: new Layer 3 tokens `--lpos-border`, `--lpos-radius`, `--lrange-track-bg`, `--lrange-track-border`, `--lrange-radius`, `--lrange-marker-color`, `--tpair-ring-border`, `--tpair-a-bg`, `--tpair-b-bg`, `--tpair-initials-color`. The defaults (`:root`, light and every design-style preset) reproduce today's look; `calm` / `calm-dark` use hairline `--color-border-subtle` borders, a pill track and surface-tinted initials with primary text.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the decimal-safe LiquidityPositionCard, decorative LiquidityRangeBar and TokenPairIcon initials requirements.
- `design-foundation`: adds the liquidity component token requirement.

## Impact

- `packages/ui/core/src/lib/retro/{LiquidityPositionCard,LiquidityRangeBar,TokenPairIcon}/*` (components, helpers, tests, stories with axe `test: "error"`), core `index.ts` type exports.
- `packages/ui/foundation/src/lib/styles/colors.css`, every `themes/*.css` preset, `presets.test.ts`, `style-tokens.test.ts`.
- README component list and token table.
- Minor bumps of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation`. No breaking change: required props only become optional, and default token values equal the previous hard-coded styles.
