<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import { MARKETS, ORDERS } from "../../_testdata/trading.js";
  import OpenOrdersTable from "./OpenOrdersTable.svelte";

  const { Story } = defineMeta({
    title: "Trading/OpenOrdersTable",
    component: OpenOrdersTable,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for this component.
      a11y: { test: "error" },
    },
  });
</script>

<Story
  name="Default"
  args={{
    orders: ORDERS,
    markets: MARKETS,
    locale: "en-US",
    oncancel: fn(),
    oncancelall: fn(),
  }}
/>

<Story name="ReadOnly" args={{ orders: ORDERS, markets: MARKETS, locale: "en-US" }} />

<Story name="Empty" args={{ orders: [], oncancel: fn(), oncancelall: fn() }} />
