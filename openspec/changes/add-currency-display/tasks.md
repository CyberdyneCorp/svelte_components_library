## 1. Component

- [x] 1.1 Add pure helpers (`isValidAmount`, `isNegativeAmount`, `tryFormatAmount`, `maskSizer`, `maskGlyphs`) reusing `formatMoney`
- [x] 1.2 Build `CurrencyDisplay.svelte` with `amount`, `currency`, `locale`, `signDisplay`, `currencyDisplay`, `tone`, `masked`, `maskedLabel`, `negativeLabel`
- [x] 1.3 Tabular numerals; negative label for `signDisplay="never"`; `tone="signed"` colouring via state tokens
- [x] 1.4 Width-preserving mask that exposes only `maskedLabel` to assistive technology
- [x] 1.5 Em dash plus a single `console.warn` for invalid input

## 2. Tests, stories, docs

- [x] 2.1 Unit tests: en-US USD, de-DE EUR, JPY, every `signDisplay` for negatives, masked accessibility, invalid input
- [x] 2.2 Stories: default, locales, negative/signed tone, masked, invalid, plus a browser play test that masking keeps the width
- [x] 2.3 Barrel export and README component list

## 3. Release

- [x] 3.1 Add a changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [ ] 3.2 Archive this change once released
