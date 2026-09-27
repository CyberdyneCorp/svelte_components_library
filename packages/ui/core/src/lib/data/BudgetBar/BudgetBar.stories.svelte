<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BudgetBar from "./BudgetBar.svelte";

  const { Story } = defineMeta({
    title: "Data Display/BudgetBar",
    component: BudgetBar,
    tags: ["autodocs"],
  });
</script>

<Story name="WithinBudget" args={{ label: "Groceries", spent: "420.00", limit: "1000", currency: "EUR", locale: "en-IE" }} />

<Story name="Approaching" args={{ label: "Groceries", spent: "820.00", limit: "1000", currency: "EUR", locale: "en-IE" }} />

<Story name="Exceeded" args={{ label: "Dining out", spent: "1120.50", limit: "1000", currency: "EUR", locale: "en-IE" }} />

<Story
  name="WithCommitted"
  args={{ label: "Travel", spent: "600.00", committed: "250.00", limit: "1000", currency: "USD", locale: "en-US" }}
/>

<Story
  name="CustomThresholds"
  args={{ label: "Rent", spent: "550", limit: "1000", currency: "USD", locale: "en-US", thresholds: [0.5, 0.9] }}
/>

<Story name="ZeroLimit" args={{ label: "Unplanned", spent: "35.00", limit: "0", currency: "EUR", locale: "en-IE" }} />

<Story
  name="Translated"
  args={{
    label: "Mercado",
    spent: "1234.50",
    limit: "1000",
    currency: "BRL",
    locale: "pt-BR",
    stateLabels: { ok: "dentro do orçamento", approaching: "perto do limite", exceeded: "limite excedido" },
    messages: {
      amount: (spent, limit) => `${spent} de ${limit}`,
      committed: (committed) => `${committed} comprometido`,
      overage: (overage) => `${overage} acima`,
    },
  }}
/>
