## Why

There is no neutral way to show a money amount. `crypto/PriceDisplay` is crypto-styled and number-based. Finance consumers (CyberWealth, issue #13) need a display that is exact for any magnitude, locale-aware, accessible for negatives without relying on colour, and able to hide balances without layout shift.

## What Changes

- Add a `CurrencyDisplay` data component (`data/CurrencyDisplay/`) with props `amount`, `currency`, `locale`, `signDisplay`, `currencyDisplay`, `tone`, `masked`, `maskedLabel` and `negativeLabel`.
  - `amount` is a decimal string, formatted through the existing `formatMoney` helper (Intl with string input), never converted to a JS `number`.
  - Tabular numerals in the mono font token.
  - Negatives always carry a visible sign unless `signDisplay="never"`, in which case a visually hidden `negativeLabel` prefix is rendered. `tone="signed"` adds success/error colouring on top of the sign; colour is never the only signal.
  - `masked` keeps the layout width with a hidden sizer in which every digit is replaced by `0` (tabular numerals keep the width identical), overlays mask glyphs, and exposes only `maskedLabel` to assistive technology. The real digits are not rendered to the DOM while masked.
  - Invalid amounts (or an unknown currency) render an em dash and log one `console.warn`; nothing throws.
- Export `CurrencyDisplay` from the package root.
- Purely additive; nothing breaks.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `core-components`: adds the CurrencyDisplay contract.

## Impact

- `packages/ui/core/src/lib/data/CurrencyDisplay/*`, a barrel export in `packages/ui/core/src/lib/index.ts`, README component list.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
- Relies on `Intl.NumberFormat` formatting numeric strings exactly (NumberFormat v3), as `MoneyInput` already does.
