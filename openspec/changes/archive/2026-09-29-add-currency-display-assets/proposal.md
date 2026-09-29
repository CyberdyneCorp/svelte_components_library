## Why

`CurrencyDisplay` formats through `Intl.NumberFormat` currency style, which only knows ISO 4217. CyberWealth (pt-BR by default) also holds crypto assets: `USDC` is rejected outright (renders "—"), and three-letter codes such as `ETH` or `BTC` are accepted as unknown currencies but rounded to two fraction digits, which is wrong for 8- and 18-decimal tokens. The consumer needs the same exact, locale-aware, maskable display for those assets.

## What Changes

- Add two optional props to `CurrencyDisplay`:
  - `decimals?: number` — switches to asset mode. `currency` becomes any asset code, and the amount is shown with exactly `decimals` fraction digits (integer 0–100).
  - `symbol?: string` — asset mode only. It is placed where the locale puts currency symbols, instead of appending the code.
- Asset amounts keep the existing guarantees: they are formatted from the decimal string (no float conversion, so 18-decimal values are exact), with locale grouping and decimal marks, `signDisplay`, the displayed-sign rules (a value that rounds to zero shows no minus sign), `tone`, `negativeLabel` and width-preserving `masked` mode.
- Invalid `decimals` (negative, non-integer, above 100) or an empty asset code render the em dash and warn once, like any other invalid input.
- New helper `formatAsset` next to the existing CurrencyDisplay helpers. `formatMoney`/`MoneyInput` are unchanged.
- Purely additive. Omitting `decimals` keeps today's ISO behaviour byte for byte.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the CurrencyDisplay asset-mode requirement.

## Impact

- `packages/ui/core/src/lib/data/CurrencyDisplay/*` (component, helpers, tests, stories), README component list.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
- Consumers: CyberWealth can render wallet balances with `<CurrencyDisplay amount={balance} currency="ETH" decimals={18} />`.
