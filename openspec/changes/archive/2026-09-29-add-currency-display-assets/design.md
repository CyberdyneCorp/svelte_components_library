## Context

`CurrencyDisplay` delegates to `formatMoney` (in `forms/MoneyInput/money.ts`), which calls `Intl.NumberFormat` with `style: "currency"` and a decimal-string input (NumberFormat v3, exact for any magnitude). Its displayed sign and mask sizer come from a second "probe" formatter with the same rounding. Intl currency style requires a well-formed ISO 4217 code: four-letter codes (`USDC`) throw, and unknown three-letter codes (`ETH`, `BTC`) fall back to two fraction digits and a code prefix.

## Goals / Non-Goals

**Goals**

- Display crypto and other custom assets with their own precision (USDC 6, BTC 8, ETH 18), exactly, in any locale.
- Keep signs, `tone`, `negativeLabel` and masking identical in behaviour to ISO amounts.
- Zero change for existing ISO usage.

**Non-Goals**

- No asset registry (names, icons, default decimals per ticker). The consumer knows its assets' decimals.
- No change to `MoneyInput` (see below).
- No compact notation or significant-digit trimming.

## Decisions

### API: `decimals` (+ optional `symbol`) instead of an `asset` object

`decimals` alone is the switch into asset mode. `currency` keeps its name and holds the asset code, so a consumer switches between fiat and crypto by adding one prop:

```svelte
<CurrencyDisplay amount="1234.5678" currency="ETH" decimals={18} locale="pt-BR" />
<!-- 1.234,567800000000000000 ETH -->
```

Alternative considered: `asset={{ code, decimals, symbol }}`. It duplicates `currency`, so the component would need precedence rules when both are set, and it would be the only object prop in the component. Two optional scalars are simpler to document, type and control from Storybook.

`decimals` must be an integer in 0–100, the range `Intl.NumberFormat` accepts for fraction digits. Anything else is treated as invalid input: em dash plus one `console.warn`, never a throw. An ISO code combined with `decimals` also takes asset mode (for example `currency="USD" decimals={4}` shows `1.2345 USD`). That rule is simple and predictable. Intl cannot tell "ETH" from a real ISO code anyway, since both are well-formed.

### Formatting stays string-based through Intl

Asset mode calls `Intl.NumberFormat` in decimal style with `minimumFractionDigits = maximumFractionDigits = decimals`. The value goes in as the decimal string, so ICU rounds the decimal representation (half-expand, the same default as currency formatting) and never goes through a double. `123456789012345678.123456789012345678` with 18 decimals round-trips exactly. The sign probe uses the same fraction digits with `signDisplay: "exceptZero"`, so "displays as zero" means zero at the asset's precision. For example, `-0.0000004` USDC shows `0.000000 USDC` with no minus sign or tone.

### Placement of the code and symbol

- **Code (default):** always a suffix after a no-break space, in every locale: `1,234.5 USDC` (en-US), `1.234,5 USDC` (pt-BR). Wallets and exchanges almost always write a ticker as a unit after the number, and consumers asked for exactly this form (pt-BR `1.234,5678 ETH`). Intl's own code placement varies by locale and puts the code first in en-US and pt-BR (`ETH 1.23`), which reads like fiat.
- **Symbol (`symbol` set, `currencyDisplay` `symbol`/`narrowSymbol`):** the symbol goes where the locale places currency symbols. It is formatted as the ISO "no currency" code `XXX`, and the `currency` part is swapped for the symbol: `₿1.50000000` (en-US), `₿ 1,50000000` (pt-BR), `-1,50000000 ₿` (de-DE). A symbol behaves like `$`, so fiat placement conventions fit.
- `currencyDisplay="code"` or `"name"` always uses the code suffix, even when a `symbol` is given. Crypto has no localized names, so `name` falls back to the code.

### Masking

No change was needed. The sizer replaces every digit with the locale's zero digit, and the probe is the same asset formatter, so native digits still work. The code or symbol stays in the hidden sizer, so the masked width equals the unmasked width. The overlay shows one glyph per digit. Long 18-decimal amounts therefore show long masks, which matches the real width.

### MoneyInput

`MoneyInput` shares `formatMoney` and derives its precision from `currencyMinorUnits(currency)`, which throws for `USDC`. Supporting assets there would need a `decimals` override for `minorUnits` plus the same display path. Each change is small, but together they change an input component's contract (parsing, clamping, editing text), and the consumer did not ask for it. It is left out of scope. The helpers (`parseMoneyInput`, `clampMoney`, `fromMinorUnits`) already take `minorUnits` as a parameter, so a later change can add `decimals` to `MoneyInput` and reuse `formatAsset` for its blurred text.

## Risks / Trade-offs

- **Intl NumberFormat v3 requirement.** String input is already required by `formatMoney`. Runtimes without it would lose precision in both modes equally.
- **Asset codes containing digits** (e.g. `1INCH`) would have those digits zeroed in the mask sizer and counted as mask glyphs. The width stays correct. This is acceptable.
