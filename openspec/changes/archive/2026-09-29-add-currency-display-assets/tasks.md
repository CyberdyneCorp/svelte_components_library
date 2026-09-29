## 1. Helpers and component

- [x] 1.1 Add `AmountFormatOptions` (`decimals`, `symbol`) and `formatAsset` to `currencyDisplay.ts`; validate `decimals` (integer 0–100) and a non-empty asset code
- [x] 1.2 Make the sign/zero-digit probe use the asset's fraction digits in asset mode
- [x] 1.3 Add `decimals` and `symbol` props to `CurrencyDisplay.svelte`; include `decimals` in the warn-once key

## 2. Tests, stories, docs

- [x] 2.1 Unit tests: USDC(6), ETH(18), BTC(8) in en-US and pt-BR; negatives and `signDisplay`; round-to-zero; masked; long 18-decimal strings exact; symbol placement; invalid decimals; ISO regression (`USDC` without `decimals` still invalid, USD/BRL unchanged)
- [x] 2.2 `CryptoAssets` story
- [x] 2.3 README Data Display entry

## 3. Release

- [x] 3.1 Changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [x] 3.2 Archive this change once released
