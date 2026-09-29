---
"@cyberdynecorp/svelte-ui-core": minor
---

New `TokenBalanceRow`: a compact, hover-free token row for wallet lists. It shows the symbol, an optional name, the amount formatted exactly from a decimal string with the token's `decimals` (via `CurrencyDisplay` asset mode, no float), the fiat `value` (`{ amount, currency }`) or an `unpricedLabel` when there is no price, and an optional `chain` label. `as="li"` renders it as a list item inside a `<ul>`/`<ol>`; the default `div` fits table cells and other containers.

`NetworkBadge`: `chainId` is now optional (the badge shows the name only when it is omitted), and `showStatus={false}` hides the connection dot and the disconnected dimming. Defaults are unchanged.
