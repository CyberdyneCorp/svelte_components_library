<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import { MARKETS, POSITIONS } from "../../_testdata/trading.js";
  import PositionsTable from "./PositionsTable.svelte";

  const { Story } = defineMeta({
    title: "Trading/PositionsTable",
    component: PositionsTable,
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
    positions: POSITIONS,
    markets: MARKETS,
    locale: "en-US",
    onclose: fn(),
    onedittpsl: fn(),
  }}
/>

<Story name="ReadOnly" args={{ positions: POSITIONS, markets: MARKETS, locale: "en-US" }} />

<Story name="Empty" args={{ positions: [], onclose: fn() }} />
