## ADDED Requirements

### Requirement: Decimal-safe LiquidityPositionCard

`LiquidityPositionCard` SHALL accept optional decimal-safe props next to its number props:

- `valueMoney`, `pnlMoney` and `uncollectedTotal` of type `LiquidityMoney` (`{ amount: string; currency: string; decimals?: number }`).

#### Scenario: Complete Decimal-safe LiquidityPositionCard contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`LiquidityPositionCard` SHALL accept optional decimal-safe props next to its number props:

- `valueMoney`, `pnlMoney` and `uncollectedTotal` of type `LiquidityMoney` (`{ amount: string; currency: string; decimals?: number }`). They are rendered through `CurrencyDisplay` with the card's optional `locale`. Their amounts SHALL never be converted to a JS `number`.
- `uncollectedFees` of type `LiquidityTokenAmount[]` (`{ asset: string; amount: string; decimals?: number }`), one entry per token. Each fee SHALL be shown in `CurrencyDisplay` asset mode. When `decimals` is omitted, the number of fraction digits written in `amount` is used, so no fee is rounded. The fees SHALL be shown in order, followed by `≈ uncollectedTotal` when that prop is set.
- When set, `valueMoney` SHALL take precedence over `value`, `pnlMoney` over `pnl`, and `uncollectedFees` / `uncollectedTotal` over `uncollected`.
- `pnlMoney` SHALL show an explicit sign for non-zero displayed values and the success / error tone.
- `value`, `pnl`, `feeApyPct` and `uncollected` SHALL be optional. The value, P&L, fee APY and uncollected rows SHALL be hidden when neither their number nor their money prop is set, and the bottom row SHALL be hidden when it would be empty.
- Optional `feeTier` SHALL be shown after the pair in the title. Optional `tokenId` (as `#id`), `chain` and `walletLabel` SHALL be joined with ` · ` into a subtitle, skipping missing parts.
- Optional `rangeText` SHALL be rendered as visually hidden text that the card's button references with `aria-describedby`. The range bar SHALL then be rendered `decorative` inside an `aria-hidden="true"` wrapper. Without `rangeText`, the range bar keeps its `progressbar` semantics.
- The number props SHALL render exactly as before when no new prop is set.
- The package root SHALL export the `LiquidityMoney` and `LiquidityTokenAmount` types.

(src: packages/ui/core/src/lib/retro/LiquidityPositionCard/LiquidityPositionCard.svelte; packages/ui/core/src/lib/retro/LiquidityPositionCard/liquidityPositionCard.ts; packages/ui/core/src/lib/retro/LiquidityPositionCard/types.ts)

#### Scenario: 18-decimal value without float maths

- **GIVEN** `valueMoney={{ amount: "0.000000000000000001", currency: "ETH", decimals: 18 }}` and `locale="en-US"`
- **WHEN** the card renders
- **THEN** the value SHALL read `0.000000000000000001 ETH`

#### Scenario: Per-token fees and total

- **GIVEN** `uncollectedFees` of `0.001234567890123456` WETH (18 decimals) and `3.21` USDC (no decimals), and `uncollectedTotal={{ amount: "7.91", currency: "USD" }}`
- **WHEN** the card renders with `locale="en-US"`
- **THEN** it SHALL show `0.001234567890123456 WETH`, `3.21 USDC` and `≈ $7.91`
- **AND** a numeric `uncollected` prop SHALL be ignored

#### Scenario: Money props take precedence

- **GIVEN** `value={12600}`, `pnl={-316.96}`, `valueMoney={{ amount: "1.5", currency: "USD" }}` and `pnlMoney={{ amount: "-0.25", currency: "USD" }}`
- **WHEN** the card renders with `locale="en-US"`
- **THEN** the value SHALL read `$1.50` and the P&L `-$0.25`

#### Scenario: Absent rows are hidden

- **GIVEN** only `tokenA`, `tokenB`, `range` and `valueMoney`
- **WHEN** the card renders
- **THEN** no P&L, fee APY or uncollected row SHALL be rendered

#### Scenario: Range sentence for screen readers

- **GIVEN** `rangeText="Out of range: 3,200 to 3,900 USDC per WETH, current 4,500"`
- **WHEN** the card renders
- **THEN** the button's accessible description SHALL be that sentence
- **AND** no element SHALL have `role="progressbar"` or `aria-valuenow`
- **AND** the bar's wrapper SHALL have `aria-hidden="true"`

#### Scenario: Number props unchanged

- **GIVEN** `value={12600}`, `pnl={-316.96}`, `feeApyPct={68.43}` and `uncollected={7.91}`
- **WHEN** the card renders
- **THEN** it SHALL show `$12,600`, `-$316.96`, `68.43%` and `$7.91`, and the range bar SHALL keep `role="progressbar"`

### Requirement: Decorative, themeable LiquidityRangeBar

`LiquidityRangeBar` SHALL accept `decorative?: boolean` (default `false`).

#### Scenario: Complete Decorative, themeable LiquidityRangeBar contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`LiquidityRangeBar` SHALL accept `decorative?: boolean` (default `false`). When `decorative` is true, it SHALL render no `role`, `aria-label` or `aria-value*` attributes and SHALL mark its root `aria-hidden="true"`. The visual output SHALL be the same. When `decorative` is false, the progressbar SHALL carry `ariaLabel` as its accessible name. The track SHALL be styled by the `--lrange-track-bg`, `--lrange-track-border`, `--lrange-radius` and `--lrange-marker-color` tokens. The band SHALL be clipped to the track's rounded corners, and the marker SHALL stay unclipped. The bounds text SHALL use `--color-text-secondary`. (src: packages/ui/core/src/lib/retro/LiquidityRangeBar/LiquidityRangeBar.svelte)

#### Scenario: Decorative mode drops the semantics

- **GIVEN** `decorative`
- **WHEN** the bar renders
- **THEN** it SHALL expose no `group` or `progressbar` role and no `aria-valuenow`, `aria-valuemin` or `aria-valuemax`
- **AND** the in-range label and band geometry SHALL be unchanged

#### Scenario: Named progressbar by default

- **GIVEN** `ariaLabel="WETH/USDC range"`
- **WHEN** the bar renders without `decorative`
- **THEN** a `progressbar` named `WETH/USDC range` SHALL be present

### Requirement: TokenPairIcon initials options

`TokenPairIcon` SHALL accept `showInitials?: boolean` (default `true`) and `maxInitials?: number` (default `2`).

#### Scenario: Complete TokenPairIcon initials options contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`TokenPairIcon` SHALL accept `showInitials?: boolean` (default `true`) and `maxInitials?: number` (default `2`). Rings without an icon SHALL show the first `maxInitials` characters of the symbol, upper-cased, or no text when `showInitials` is false. Icons SHALL still take precedence over initials. The accessible name SHALL be unchanged. The ring border, backgrounds and initials colour SHALL come from `--tpair-ring-border`, `--tpair-a-bg`, `--tpair-b-bg` and `--tpair-initials-color`. `tokenAColor` / `tokenBColor`, when set, SHALL override the background tokens. (src: packages/ui/core/src/lib/retro/TokenPairIcon/TokenPairIcon.svelte)

#### Scenario: Three initials

- **GIVEN** `tokenA="WETH"`, `tokenB="usdc"`, `maxInitials={3}`
- **WHEN** the icon renders
- **THEN** the rings SHALL read `WET` and `USD`

#### Scenario: Plain discs

- **GIVEN** `showInitials={false}`
- **WHEN** the icon renders without icon sources
- **THEN** the rings SHALL contain no text and the `img` role SHALL keep the name `WETH/USDC`
