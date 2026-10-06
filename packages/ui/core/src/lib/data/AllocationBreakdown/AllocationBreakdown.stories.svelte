<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AllocationBreakdown from "./AllocationBreakdown.svelte";
  const { Story } = defineMeta({
    title: "Data Display/AllocationBreakdown",
    component: AllocationBreakdown,
    tags: ["autodocs"],
    parameters: { a11y: { test: "error" } },
  });
</script>

<Story
  name="AssetsAndLiabilities"
  args={{
    ariaLabel: "Distribuição",
    locale: "pt-BR",
    description:
      "Percentuais sobre patrimônio líquido. Barras mostram magnitudes relativas, com eixo zero central.",
    items: [
      { id: "funds", label: "Fundos", percentage: 105, value: "R$ 105.000,00" },
      { id: "stocks", label: "Ações", percentage: 20, value: "R$ 20.000,00", tone: "info" },
      { id: "debt", label: "Dívidas", percentage: -25, value: "−R$ 25.000,00", tone: "negative" },
    ],
  }}
/>
<Story
  name="ZeroAndUnavailable"
  args={{
    ariaLabel: "Distribuição",
    unavailableLabel: "Indisponível",
    items: [
      { id: "zero", label: "Zero", percentage: 0, value: "R$ 0,00" },
      { id: "missing", label: "Sem cotação", percentage: NaN, value: "—" },
    ],
  }}
/>
<Story name="Empty" args={{ ariaLabel: "Distribuição", emptyLabel: "Nenhuma posição" }} />
