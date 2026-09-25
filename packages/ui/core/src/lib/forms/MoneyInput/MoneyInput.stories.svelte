<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MoneyInput from "./MoneyInput.svelte";

  const { Story } = defineMeta({
    title: "Forms/MoneyInput",
    component: MoneyInput,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Amount", currency: "USD", locale: "en-US", value: "1234.56" }} />

<Story name="EuroGerman" args={{ label: "Betrag", currency: "EUR", locale: "de-DE", value: "1234.56", hint: "Monatliche Miete" }} />

<Story name="YenNoMinorUnits" args={{ label: "Amount", currency: "JPY", locale: "ja-JP", value: "1500" }} />

<Story name="WithError" args={{ label: "Budget", currency: "USD", locale: "en-US", value: "2500.00", max: "2000", error: "Exceeds the monthly limit" }} />

<Story name="Disabled" args={{ label: "Balance", currency: "USD", locale: "en-US", value: "980.10", disabled: true }} />

<Story name="NegativeAllowed" args={{ label: "Adjustment", currency: "USD", locale: "en-US", value: "-45.00", allowNegative: true, hint: "Use a minus sign for refunds" }} />

<Story name="Empty" args={{ label: "Amount", currency: "USD", locale: "en-US", name: "amount", required: true }} />
