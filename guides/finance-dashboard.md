# Finance dashboard presentation

`@cyberdynecorp/svelte-ui-core` provides reusable presentation for wealth and transaction screens. See **Finance / Dashboard** in Storybook for runnable examples with synthetic data. The example uses PageShell, Sidebar, PageHeader, KpiCard, Card, FilterBar, AllocationBreakdown, DataTable and EmptyState.

## Adoption in CyberWealth

1. Keep the calm/calm-dark theme and load foundation styles. Remove application-owned wave decorations from page headings and empty-state wrappers where flat surfaces are desired. Installing a new library version does not replace application markup or custom decoration.
2. Use PageHeader with actions as its children. Heading and action groups now wrap at narrow widths. Avoid application CSS imposing fixed widths or nowrap on those groups.
3. Mark only the primary KpiCard with `emphasis="featured"`. Set `valueTone="negative"` explicitly for a liability or other negative context. `valueTone` colors the value; `sentiment` continues to color the delta independently. Neither prop calculates financial meaning. Existing defaults remain unchanged. Optional CSS tokens `--kpi-featured-bg` and `--kpi-featured-border` fall back to theme brand tokens.
4. Use the existing FilterBar’s opt-in `children`/`actions` composition mode inside an application-owned form. Pass labelled native/shared controls as children and submit/reset actions in its `actions` snippet. The component supplies layout and a labelled region, not filter state or network requests.
5. Replace custom allocation rows with AllocationBreakdown. Pass preformatted values, finite signed percentages and translated labels. Explain the denominator in `description`. Percentages against net wealth may exceed 100% for assets when debts are negative. Do not substitute a donut that silently drops liabilities.
6. Use a labelled, focusable overflow region around a wide DataTable. Keep scrolling within the table at small widths, instead of overflowing the whole page. Use EmptyState for absent data. Supply application navigation, mobile BottomNav and business actions separately.

```svelte
<script lang="ts">
  import {
    AllocationBreakdown,
    FilterBar,
    KpiCard,
    Button,
    TextInput,
  } from "@cyberdynecorp/svelte-ui-core";
  let search = $state("");
  // Synthetic examples. Financial calculations belong to the application.
  const items = [
    {
      id: "assets",
      label: "Ativos",
      percentage: 120,
      value: "R$ 120.000,00",
      tone: "info" as const,
    },
    {
      id: "debts",
      label: "Dívidas",
      percentage: -20,
      value: "−R$ 20.000,00",
      tone: "negative" as const,
    },
  ];
</script>

<KpiCard label="Patrimônio líquido" value="R$ 100.000,00" emphasis="featured" />
<AllocationBreakdown
  ariaLabel="Distribuição"
  locale="pt-BR"
  {items}
  description="Percentuais sobre patrimônio líquido. Barras mostram magnitudes relativas em torno do eixo zero."
  emptyLabel="Nenhuma posição"
  unavailableLabel="Indisponível"
/>
<form
  onsubmit={(event) => {
    event.preventDefault(); /* apply application filters */
  }}
>
  <FilterBar ariaLabel="Filtros">
    <TextInput label="Buscar" type="search" bind:value={search} />
    {#snippet actions()}<Button type="submit">Filtrar</Button>{/snippet}
  </FilterBar>
</form>
```

## Allocation interpretation

The central baseline is zero. Positive bars extend right and negative bars left. Length is relative to the largest absolute finite percentage in the supplied set; each half-track represents that magnitude. It is **not** a 0–100 progress meter. Displayed signed percentages remain unchanged except locale formatting with at most one decimal place (`20` renders as `20%`, `51.6` as `51.6%` or `51,6%` by locale). Labels, signs and values communicate meaning without relying on color. Tiny percentages may round to zero in displayed text while their finite bar geometry remains proportional.

`NaN` and infinite percentages display `unavailableLabel` and a zero-length bar. A real zero displays `0%`. An empty collection displays `emptyLabel`. The application must supply unique stable IDs, a valid Intl locale and financial precision/formatted monetary strings. Missing amounts should be represented by the application's chosen placeholder, not invented by the component.

## Verification

Run focused unit tests and `pnpm exec playwright test tests/finance-dashboard.spec.ts` for viewport, heading/action overlap, keyboard filter submit/clear and calm light coverage. Storybook exposes individual new patterns and complete wealth, transaction and empty-state examples. These tests validate synthetic presentation, not the deployed application's backend or financial calculations.

## Cash flow and negative balance

The transaction example uses blue (`--color-state-info`) for income and red (`--color-state-error`) for outflows. Labels and signed amounts remain visible. KpiCard accepts value snippets for these colors without changing the shared positive sentiment color. The demo's “Simular saída” button advances preformatted synthetic balances through positive, zero and negative states. Each simulated outflow also appears in the filterable table, matching the summary totals. A labelled Select configures the local warning threshold (R$ 1,000, R$ 3,000 or R$ 6,000; default R$ 3,000). A positive balance strictly below that threshold shows an early warning. This preview setting is not persisted. Zero shows a warning; negative shows the existing Alert with `role="alert"`. Reset restores the initial balance and removes simulated rows, retaining the selected warning threshold. These fixtures do not calculate or persist money.

For adoption, the application must supply accurate decimal-based balances and their sign, and update the presentation when transactions change. An on-screen alert is not an email, push notification or background monitor; those require application services.
