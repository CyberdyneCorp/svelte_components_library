## Context

`TokenBalance` is a card: 1.75rem balance, glow `box-shadow` on hover, and a `balance: string` that the caller formats. `NetworkBadge` renders a status dot and `#{chainId}` unconditionally (`chainId` defaults to `0`). `CurrencyDisplay` already formats decimal strings exactly, both for ISO currencies and, with `decimals`, for crypto assets ("1,234.567800000000000000 ETH").

## Goals / Non-Goals

**Goals**

- A list row with symbol, name, exact amount, fiat value or unpriced text, and chain label.
- No float anywhere between the caller's decimal string and the rendered text.
- Usable inside `<ul>`/`<ol>` and inside table cells.
- `NetworkBadge` usable as a plain chain label.

**Non-Goals**

- No change to the `TokenBalance` card.
- No price lookup, sorting or list container component; the caller owns the list.
- No masked mode; callers that need it can wrap the amount themselves later.

## Decisions

### A new `TokenBalanceRow` instead of a `variant` on `TokenBalance`

The row and the card share almost no props. The card takes a preformatted `balance`, a `usdValue` string and a numeric `change`. The row needs `amount` + `decimals` (exact formatting), a `{ amount, currency }` value, an unpriced label, a chain label and a choice of root element. A `variant="row"` would leave most props meaningful in only one variant and make the card's types looser (`balance` optional, `amount` optional). A separate component keeps each prop list small and typed, needs no branching in the card, and leaves the card's behaviour untouched. It is also easier to find in the Crypto list.

### Formatting through `CurrencyDisplay`

The amount renders as `<CurrencyDisplay amount currency={symbol} decimals locale>`, the value as `<CurrencyDisplay amount={value.amount} currency={value.currency} locale>`. This reuses the tested asset and ISO formatting, the invalid-input em dash and the one-time warning, so the row adds no formatting code.

### Unpriced state

When `value` is absent, `unpricedLabel` is rendered as text in the value slot. It is plain text, so it can carry the reason ("No market price", "Price feed unavailable") and be translated. It is not a status or live region: the list is static content.

### Root element: `as`

`as` is `"div"` (default) or `"li"`. `li` makes the row a list item for `<ul>`/`<ol>`. The `div` default fits any other container, including a `<td>`. A table-row element is not offered: a `<tr>` needs `<td>` children, which would force one column layout on every caller, and CyberWealth's list is a `<ul>`. The row sets `list-style: none`; the caller styles the list container.

### Chain label

The chain is rendered with `NetworkBadge` (`showStatus={false}`, no `chainId`), so it looks like the chain pill used elsewhere. The connection dot means "wallet connected to this chain", which is meaningless for a watch-only holding.

### `NetworkBadge` changes

`chainId?: number` defaults to `undefined`, and `#id` is rendered only when it is defined; `chainId={0}` still renders `#0`. `showStatus` (default `true`) gates the dot. With `showStatus={false}` the disconnected opacity is also dropped, since dimming without a visible status would be unexplained. Existing usage (always passing `chainId`, never `showStatus`) renders the same DOM.

## Risks / Trade-offs

- 18-decimal amounts are long. The amount column does not shrink or truncate (rounding or ellipsis would hide part of the value); the name column ellipsises instead. Callers that want fewer digits pass a smaller `decimals`, as they would to `CurrencyDisplay`.
- Omitting `chainId` used to render `#0`; it now renders nothing. `chainId` was required in the type, so typed callers are unaffected.
