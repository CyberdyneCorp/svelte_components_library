<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StatusDotList from "./StatusDotList.svelte";
  const { Story } = defineMeta({ title: "Retro/StatusDotList", component: StatusDotList, tags: ["autodocs"] });
</script>

<Story name="PositionStatus" args={{
  title: "Position Status",
  icon: "📊",
  items: [
    { id: "a", label: "WETH/USDC", value: "$12.6k", tone: "success" },
    { id: "b", label: "UNI/WETH", value: "$8.5k", tone: "success" },
    { id: "c", label: "USDC/USDT", value: "$15.6k", tone: "warning" },
    { id: "d", label: "ARB/WETH", value: "-$5.2k", tone: "danger" },
  ],
}} />
