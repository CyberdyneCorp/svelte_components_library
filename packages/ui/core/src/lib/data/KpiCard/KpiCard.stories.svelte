<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import KpiCard from "./KpiCard.svelte";
  import CurrencyDisplay from "../CurrencyDisplay/CurrencyDisplay.svelte";
  import ProgressRing from "../../feedback/ProgressRing/ProgressRing.svelte";

  const { Story } = defineMeta({
    title: "Data Display/KpiCard",
    component: KpiCard,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });
</script>

<Story name="Default" args={{ label: "Net worth", value: "€48,210.00" }} />

<Story
  name="PositiveIncrease"
  args={{
    label: "Savings",
    value: "€12,400.00",
    delta: "+4.2%",
    deltaLabel: "vs last month",
    trend: "up",
    sentiment: "positive",
  }}
/>

<Story
  name="RisingExpensesNegative"
  args={{
    label: "Monthly spend",
    value: "€2,310.00",
    delta: "+12%",
    deltaLabel: "vs last month",
    trend: "up",
    sentiment: "negative",
  }}
/>

<Story
  name="Unchanged"
  args={{
    label: "Subscriptions",
    value: "€84.00",
    delta: "0%",
    deltaLabel: "vs last month",
    trend: "flat",
  }}
/>

<Story
  name="AsLink"
  args={{
    label: "Income",
    value: "€5,120.00",
    delta: "-3.1%",
    deltaLabel: "vs last month",
    trend: "down",
    sentiment: "negative",
    href: "#income",
  }}
/>

<Story
  name="Translated"
  args={{
    label: "Gastos",
    value: "R$ 3.200,00",
    delta: "-8%",
    deltaLabel: "vs mês passado",
    trend: "down",
    sentiment: "positive",
    trendLabels: { up: "aumentou", down: "diminuiu", flat: "sem alteração" },
  }}
/>

<Story name="WithSparkline">
  <div style="max-width: 260px;">
    <KpiCard
      label="Cash flow"
      value="€1,860.00"
      delta="+6%"
      deltaLabel="vs last month"
      trend="up"
      sentiment="positive"
    >
      {#snippet sparkline()}
        <svg viewBox="0 0 100 24" width="100%" height="24" aria-hidden="true">
          <polyline
            points="0,18 14,16 28,19 42,12 56,14 70,8 84,10 100,4"
            fill="none"
            stroke="var(--color-state-success)"
            stroke-width="2"
          />
        </svg>
      {/snippet}
    </KpiCard>
  </div>
</Story>

<Story name="SnippetValue">
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <KpiCard
      label="Net worth"
      delta="+2.4%"
      deltaLabel="vs last month"
      trend="up"
      sentiment="positive"
    >
      {#snippet value()}
        <CurrencyDisplay amount="48210.00" currency="EUR" locale="en-IE" />
      {/snippet}
    </KpiCard>
    <KpiCard label="Net worth (hidden)" href="#net-worth">
      {#snippet value()}
        <CurrencyDisplay amount="48210.00" currency="EUR" locale="en-IE" masked />
      {/snippet}
    </KpiCard>
  </div>
</Story>

<Story
  name="FeaturedWealth"
  args={{
    label: "Patrimônio líquido",
    value: "R$ 240.000,00",
    emphasis: "featured",
    deltaLabel: "Ativos menos dívidas",
  }}
/>
<Story
  name="DebtValue"
  args={{
    label: "Dívidas",
    value: "R$ 60.000,00",
    valueTone: "negative",
    deltaLabel: "Compromissos a descontar",
  }}
/>

<Story name="WithVisualRing">
  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <div style="width: 300px;">
      <KpiCard label="Uso do disco" value="152 GB / 400 GB" deltaLabel="38% em uso">
        {#snippet visual()}
          <ProgressRing value={38} size={56} strokeWidth={5} />
        {/snippet}
      </KpiCard>
    </div>
    <div style="width: 300px;">
      <KpiCard
        label="Memória"
        value="6,2 GB / 8 GB"
        delta="+12%"
        deltaLabel="vs ontem"
        trend="up"
        sentiment="negative"
      >
        {#snippet visual()}
          <ProgressRing value={78} size={56} strokeWidth={5} variant="warning" />
        {/snippet}
        {#snippet sparkline()}
          <svg viewBox="0 0 100 24" width="100%" height="24" aria-hidden="true">
            <polyline
              points="0,18 14,16 28,19 42,12 56,14 70,8 84,10 100,4"
              fill="none"
              stroke="var(--color-state-warning)"
              stroke-width="2"
            />
          </svg>
        {/snippet}
      </KpiCard>
    </div>
  </div>
</Story>
