## 1. Foundation tokens

- [x] 1.1 Add the liquidity Layer 3 token block to `colors.css` (`:root` and light) with defaults equal to the hard-coded styles
- [x] 1.2 Add the block to every `themes/*.css` preset: today's values, calm / calm-dark softened
- [x] 1.3 Add the `--tpair-initials-color` contrast pairing to `presets.test.ts` and default / calm value tests to `style-tokens.test.ts`

## 2. Components

- [x] 2.1 `LiquidityRangeBar`: token-driven track, band clip layer, `decorative` prop, progressbar accessible name, AA bounds colour
- [x] 2.2 `TokenPairIcon`: token-driven ring border / fills / initials colour, `showInitials`, `maxInitials`
- [x] 2.3 `LiquidityPositionCard`: `valueMoney`, `pnlMoney`, `uncollectedFees`, `uncollectedTotal`, `locale`, optional rows, `feeTier`, subtitle, `rangeText`; export `LiquidityMoney` / `LiquidityTokenAmount`

## 3. Tests, stories, docs

- [x] 3.1 Unit tests: exact 18-decimal value, per-token fees and total, precedence, hidden rows, subtitle and fee tier, `rangeText` with hidden bar, number-prop regression, decorative mode, `maxInitials` / `showInitials`
- [x] 3.2 Calm / calm-dark decimal stories; axe `test: "error"` on the three touched story files
- [x] 3.3 README entries and token table

## 4. Release

- [x] 4.1 Changeset (minor bumps of `@cyberdynecorp/svelte-ui-core` and `@cyberdynecorp/svelte-ui-foundation`)
- [ ] 4.2 Archive this change once released
