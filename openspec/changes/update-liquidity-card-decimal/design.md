## Context

`LiquidityPositionCard` composes `TokenPairIcon` and `LiquidityRangeBar` inside a `<button>` whose accessible name is `Position {pair}`. Its money figures are JS numbers formatted with `toLocaleString` / `toFixed`. `CurrencyDisplay` already formats decimal strings exactly, in ISO mode or in asset mode (`decimals`), so the card can reuse it instead of growing its own formatter.

The three components hard-code `2px solid var(--color-text-primary)` and square corners. Foundation's Layer 3 tokens are declared in `colors.css` (`:root` and `[data-theme="light"]`), and `presets.test.ts` requires every preset to redefine every Layer 3 token of `:root`.

## Goals / Non-Goals

**Goals**

- Decimal-safe money in the card without changing what the number props render.
- Per-token uncollected fees, optional rows, position metadata.
- A screen-reader sentence for the range and a truly decorative bar.
- Calm-friendly styling through tokens, with defaults equal to today.

**Non-Goals**

- Localising the card's fixed labels ("Fee APY", "Uncollected", "In Range"). This is left for a later `labels` prop.
- Decimal-safe range prices. `range` stays numeric; the bar only needs positions, and `rangeText` carries the exact prices as text.
- Computing the uncollected total from the per-token fees (that needs prices; the consumer passes it).

## Decisions

### Separate `*Money` props rather than widening `value: number | Money`

`valueMoney`, `pnlMoney` and `uncollectedTotal` sit next to the number props and win when both are set. Widening `value` to a union would change its type for existing consumers and force runtime type checks in the template. Separate names make the precedence explicit and keep the old branch byte-for-byte identical (a regression test pins the old text).

The shape `{ amount, currency, decimals? }` maps one-to-one onto `CurrencyDisplay` props: without `decimals`, `currency` is an ISO code; with it, any asset code. `pnlMoney` renders with `signDisplay="exceptZero"` and `tone="signed"`, so the sign and colour follow the displayed (rounded) value rather than a float comparison.

### Per-token fees keep their own precision

`uncollectedFees` entries always use asset mode. When `decimals` is omitted, the number of fraction digits written in the `amount` string is used, so `"0.000000000000000001"` shows exactly and nothing is rounded or padded. `uncollectedTotal` is shown after the fees as `≈ total`.

### Optional rows

`value`, `pnl`, `feeApyPct` and `uncollected` become optional (non-breaking for callers). Each row renders only when its number or money prop is set; the bottom row disappears when neither fee APY nor any uncollected data is present.

### `rangeText` and the decorative bar

The card is a `<button>` with an `aria-label`, so its inner text is not part of the accessible name. `rangeText` is rendered as a visually hidden span referenced by the button's `aria-describedby`, and the bar is wrapped in `aria-hidden="true"` with `decorative` set. Without `rangeText`, the bar keeps its current `progressbar` semantics.

`LiquidityRangeBar`'s `decorative` removes `role="group"`, `role="progressbar"`, `aria-label` and `aria-value*`, and marks its root `aria-hidden`, so it is safe inside or outside hidden containers. Turning axe to `error` on the touched stories exposed two existing issues, fixed here: the progressbar had no accessible name (it now reuses `ariaLabel`), and the bounds text used `--color-text-tertiary`, which is 3.5:1 on the dark card surface (now `--color-text-secondary`).

### Tokens

| Token | Default (`:root`, light, design-style presets) | calm / calm-dark |
|-------|------|------|
| `--lpos-border` | `2px solid var(--color-text-primary)` | `1px solid var(--color-border-subtle)` |
| `--lpos-radius` | `0` | `var(--radius-lg)` |
| `--lrange-track-bg` | `var(--color-surface-raised)` | `var(--color-bg-tertiary)` |
| `--lrange-track-border` | `2px solid var(--color-text-primary)` | `1px solid var(--color-border-subtle)` |
| `--lrange-radius` | `0` | `var(--radius-pill)` |
| `--lrange-marker-color` | `var(--color-text-primary)` | same |
| `--tpair-ring-border` | `2px solid var(--color-text-primary)` | `1px solid var(--color-border-subtle)` |
| `--tpair-a-bg` / `--tpair-b-bg` | brand / secondary default | brand / secondary `-bg` tints |
| `--tpair-initials-color` | `var(--color-text-inverse)` | `var(--color-text-primary)` |

The tokens live in `colors.css` because they resolve against Layer 2 colours, and they are redeclared in the light block so a light subtree does not inherit values resolved against the dark root. Because the completeness guard requires every preset to redefine every `:root` Layer 3 token, all presets get the block with today's values, so no preset changes appearance. The block is delimited by comments in every file to ease merges. `presets.test.ts` adds `--tpair-initials-color` on `--tpair-a-bg` / `--tpair-b-bg` as a 4.5:1 text pairing; all presets pass.

A rounded track would let the band paint over the corners, so the band now sits in an inner clip layer (`inset: 0; border-radius: inherit; overflow: hidden`). The marker stays outside the clip layer so it can still overhang the track.

`TokenPairIcon` no longer sets an inline background by default. `tokenAColor` / `tokenBColor` still set one, so custom colours win over the theme.

## Risks / Trade-offs

- Consumers that restyled `.cy-lrange__band` through its parent selector now see an extra wrapper. The class names and test ids are unchanged.
- The bounds text colour changes from tertiary to secondary. This is a deliberate AA fix.
