<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FinanceDashboardDemo from "../lib/_testdata/FinanceDashboardDemo.svelte";
  const { Story } = defineMeta({
    title: "Finance/Dashboard",
    component: FinanceDashboardDemo,
    parameters: { layout: "fullscreen", a11y: { test: "error" } },
    globals: { theme: "calm-dark" },
  });
</script>

<Story name="Wealth" />
<Story name="Transactions" args={{ transactions: true }} />
<Story name="EmptyPositions" args={{ empty: true }} />
