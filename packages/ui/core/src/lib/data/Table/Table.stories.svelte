<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Table from "./Table.svelte";

  const cryptoRows = [
    { rank: 1, token: "BTC", name: "Bitcoin", price: "$67,891.00", marketCap: "$1.33T", change: "+1.8%", volume: "$32.1B" },
    { rank: 2, token: "ETH", name: "Ethereum", price: "$3,245.12", marketCap: "$390.1B", change: "+2.4%", volume: "$18.2B" },
    { rank: 3, token: "SOL", name: "Solana", price: "$142.50", marketCap: "$62.3B", change: "+5.1%", volume: "$4.8B" },
    { rank: 4, token: "BNB", name: "BNB Chain", price: "$612.30", marketCap: "$91.2B", change: "-0.3%", volume: "$2.1B" },
    { rank: 5, token: "XRP", name: "Ripple", price: "$0.5412", marketCap: "$29.6B", change: "+0.9%", volume: "$1.4B" },
    { rank: 6, token: "ADA", name: "Cardano", price: "$0.4523", marketCap: "$16.0B", change: "-1.2%", volume: "$620M" },
    { rank: 7, token: "AVAX", name: "Avalanche", price: "$35.67", marketCap: "$13.1B", change: "+3.7%", volume: "$890M" },
    { rank: 8, token: "DOT", name: "Polkadot", price: "$7.12", marketCap: "$9.8B", change: "-0.5%", volume: "$410M" },
    { rank: 9, token: "LINK", name: "Chainlink", price: "$18.73", marketCap: "$10.9B", change: "+1.2%", volume: "$890M" },
    { rank: 10, token: "MATIC", name: "Polygon", price: "$0.7234", marketCap: "$6.7B", change: "+4.2%", volume: "$520M" },
  ];

  const defaultCols = [
    { key: "rank", label: "#", sortable: true },
    { key: "token", label: "Token", sortable: true },
    { key: "name", label: "Name" },
    { key: "price", label: "Price", sortable: true },
    { key: "marketCap", label: "Market Cap", sortable: true },
    { key: "change", label: "24h", sortable: true },
    { key: "volume", label: "Volume", sortable: true },
  ];

  const modelRows = [
    { model: "GPT-4o", params: "1.8T", accuracy: "94.2%", latency: "320ms", cost: "$0.005/1K", status: "Production" },
    { model: "Claude Opus 4", params: "—", accuracy: "95.1%", latency: "280ms", cost: "$0.015/1K", status: "Production" },
    { model: "Gemini 2.5", params: "1.5T", accuracy: "93.8%", latency: "350ms", cost: "$0.004/1K", status: "Production" },
    { model: "Llama 4", params: "405B", accuracy: "91.5%", latency: "180ms", cost: "$0.001/1K", status: "Production" },
    { model: "Mistral Large", params: "123B", accuracy: "90.2%", latency: "150ms", cost: "$0.002/1K", status: "Beta" },
    { model: "CyberNet v3", params: "70B", accuracy: "89.7%", latency: "95ms", cost: "Self-hosted", status: "Internal" },
  ];

  const modelCols = [
    { key: "model", label: "Model", sortable: true },
    { key: "params", label: "Parameters" },
    { key: "accuracy", label: "Accuracy", sortable: true },
    { key: "latency", label: "Latency", sortable: true },
    { key: "cost", label: "Cost / 1K tokens" },
    { key: "status", label: "Status" },
  ];

  const { Story } = defineMeta({
    title: "Data Display/Table",
    component: Table,
    tags: ["autodocs"],
    args: {
      columns: defaultCols,
      rows: cryptoRows,
    },
  });
</script>

<Story name="Crypto Market" args={{ columns: defaultCols, rows: cryptoRows }} />

<Story name="Crypto Market (Striped)" args={{ columns: defaultCols, rows: cryptoRows, striped: true }} />

<Story name="ML Model Comparison" args={{ columns: modelCols, rows: modelRows, striped: true }} />
