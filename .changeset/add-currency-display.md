---
"@cyberdynecorp/svelte-ui-core": minor
---

Add `CurrencyDisplay` (`data/CurrencyDisplay`): a neutral, locale-aware money amount display. It formats decimal-string amounts through `formatMoney` without float conversion, uses tabular numerals, marks negatives with a sign or a screen-reader label (never colour alone, optional `tone="signed"`), supports a width-preserving `masked` mode that exposes only `maskedLabel` to assistive technology, and renders an em dash with a single console warning for invalid input.
