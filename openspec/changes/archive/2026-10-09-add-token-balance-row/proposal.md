## Why

CyberWealth shows watch-only wallets as a list of holdings: symbol, name, exact amount, a fiat value or the reason there is none, and the chain. `TokenBalance` is a card with a glow hover and takes a preformatted `balance` string, and `NetworkBadge` requires `chainId` and always shows a connection dot, so the app keeps its own row component (issue #61, part 6).

## What Changes

- New `TokenBalanceRow` crypto component: a dense, hover-free row with `symbol`, optional `name`, `amount` (decimal string) and `decimals`, optional `value: { amount: string; currency: string }`, `unpricedLabel` (default "No price available") shown when `value` is absent, optional `chain` label, `locale`, `icon` snippet and `as` (`"div"` default, `"li"` for lists). Amounts and values are formatted by `CurrencyDisplay` (asset mode for the token amount), never through a JS `number`.
- `NetworkBadge`: `chainId` becomes optional; the `#id` is rendered only when it is set. New `showStatus` prop (default `true`); `false` hides the connection dot and the disconnected dimming.
- Purely additive. `TokenBalance` is untouched, and `NetworkBadge` renders exactly as before when `chainId` is passed and `showStatus` is omitted.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the TokenBalanceRow and NetworkBadge list-display requirements.

## Impact

- `packages/ui/core/src/lib/crypto/TokenBalanceRow/*` (new), `packages/ui/core/src/lib/crypto/NetworkBadge/*`, public export in `src/lib/index.ts`, README Crypto list, `documentation/TRD.md`.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
