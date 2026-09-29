## 1. Helpers

- [x] 1.1 Move `formatAsset`, decimals validation and rounding options to `forms/MoneyInput/asset.ts`; add `resolveMinorUnits`, `amountRounding`, `formatAmount`
- [x] 1.2 Reuse them in `currencyDisplay.ts` (re-export `formatAsset` and option types)
- [x] 1.3 Add `exceedsDecimals` to `money.ts`
- [x] 1.4 Export `formatAmount`, `resolveMinorUnits`, `exceedsDecimals`, `AmountFormatOptions`

## 2. Component

- [x] 2.1 Add `decimals` and `symbol` props to `MoneyInput.svelte`; unfocused text via `formatAmount`
- [x] 2.2 Reject over-precise asset input
- [x] 2.3 Invalid decimals/empty code: read-only, value kept, warn once

## 3. Tests, stories, docs

- [x] 3.1 Unit and component tests: USDC(6), ETH(18), BTC(8) in en-US and pt-BR; typed separators; last-separator rule; 18-decimal paste; excess decimals; negatives; hidden input; symbol; invalid decimals; ISO regression
- [x] 3.2 `CryptoAssets` story
- [x] 3.3 README Forms entry

## 4. Release

- [x] 4.1 Changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [ ] 4.2 Archive this change once released
