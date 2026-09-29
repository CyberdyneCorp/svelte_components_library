---
"@cyberdynecorp/svelte-ui-core": minor
---

KpiCard: `value` now accepts a Svelte snippet as well as a string, so rich markup such as a masked `CurrencyDisplay` can be used. Strings render exactly as before; snippet content renders inside the same value element and stays part of the card link's accessible name.
