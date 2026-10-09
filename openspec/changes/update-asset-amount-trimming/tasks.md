## 1. Formatter

- [x] 1.1 `minDecimals` on `AmountFormatOptions`; `amountRounding` uses it for `minimumFractionDigits` with `decimals` as the maximum; validation throws `RangeError` outside 0–`decimals`
- [x] 1.2 Unit tests: trimming, stablecoin lower bound, rounding still at `decimals`, parsing precision unchanged, invalid values, ISO mode ignores it

## 2. Components

- [x] 2.1 `CurrencyDisplay`: `minDecimals` prop passed to `tryFormatAmount`; warning key includes it
- [x] 2.2 `TokenBalanceRow`: `minDecimals` forwarded to the amount; `data-*` rest props spread on the root element
- [x] 2.3 Component tests: trimmed amounts, default unchanged, zero after rounding, symbol placement, masked sizer, invalid `minDecimals`, `data-*` on `div` and `li`

## 3. Docs

- [x] 3.1 Stories: CurrencyDisplay `TrimmedAssets`, TokenBalanceRow `Trimmed amounts`
- [x] 3.2 README Data and Crypto lists, `documentation/TRD.md` row

## 4. Release

- [x] 4.1 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [ ] 4.2 Archive this change once released
