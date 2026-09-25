---
"@cyberdynecorp/svelte-ui-core": minor
---

Add `MoneyInput`, a currency field whose value is an exact decimal string (`"1234.56"`, or `null` when empty). It is locale-aware: currency formatting on blur, `.` or `,` accepted as the decimal separator, fraction digits limited to the currency's minor units, and decimal-string `min`/`max`. Also exports the float-free money helpers (`parseMoneyInput`, `formatMoney`, `currencyMinorUnits`, `toMinorUnits`, `fromMinorUnits`, `compareMoney`, `clampMoney`, `sanitizeMoneyTyping`, `toEditableMoney`).
