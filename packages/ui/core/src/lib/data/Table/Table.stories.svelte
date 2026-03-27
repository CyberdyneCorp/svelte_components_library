<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Table from "./Table.svelte";

  const { Story } = defineMeta({
    title: "Data Display/Table",
    component: Table,
    tags: ["autodocs"],
  });
</script>

<script>
  const sampleRows = [
    { token: "ETH", price: "$3,245.12", change: "+2.4%", volume: "$18.2B" },
    { token: "BTC", price: "$67,891.00", change: "-0.8%", volume: "$32.1B" },
    { token: "SOL", price: "$142.50", change: "+5.1%", volume: "$4.8B" },
    { token: "LINK", price: "$18.73", change: "+1.2%", volume: "$890M" },
  ];

  const defaultCols = [
    { key: "token", label: "Token" },
    { key: "price", label: "Price" },
    { key: "change", label: "24h Change" },
    { key: "volume", label: "Volume" },
  ];

  const sortableCols = [
    { key: "token", label: "Token", sortable: true },
    { key: "price", label: "Price", sortable: true },
    { key: "change", label: "24h Change", sortable: true },
    { key: "volume", label: "Volume" },
  ];
</script>

<Story name="Default">
  <Table columns={defaultCols} rows={sampleRows} />
</Story>

<Story name="Striped">
  <Table columns={defaultCols} rows={sampleRows} striped />
</Story>

<Story name="Sortable">
  <Table columns={sortableCols} rows={sampleRows} />
</Story>
