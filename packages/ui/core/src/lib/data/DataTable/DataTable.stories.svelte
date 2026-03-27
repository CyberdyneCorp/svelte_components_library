<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DataTable from "./DataTable.svelte";

  const txColumns = [
    { key: "id", label: "TX ID", sortable: true, resizable: true },
    { key: "type", label: "Type", sortable: true, resizable: true },
    { key: "from", label: "From", resizable: true },
    { key: "to", label: "To", resizable: true },
    { key: "amount", label: "Amount", sortable: true, resizable: true },
    { key: "token", label: "Token", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "date", label: "Date", sortable: true, resizable: true },
  ];

  const txRows = Array.from({ length: 20 }, (_, i) => ({
    id: `0x${(Math.random() * 0xffffff << 0).toString(16).padStart(6, "0")}...${(Math.random() * 0xffff << 0).toString(16).padStart(4, "0")}`,
    type: ["Transfer", "Swap", "Stake", "Bridge", "Mint"][i % 5],
    from: `0x${(Math.random() * 0xffffff << 0).toString(16).padStart(6, "0")}...`,
    to: `0x${(Math.random() * 0xffffff << 0).toString(16).padStart(6, "0")}...`,
    amount: (Math.random() * 100).toFixed(4),
    token: ["ETH", "USDC", "WBTC", "SOL", "MATIC"][i % 5],
    status: ["Confirmed", "Pending", "Failed", "Confirmed", "Confirmed"][i % 5],
    date: `2026-03-${String(Math.max(1, 27 - i)).padStart(2, "0")}`,
    details: `Gas used: ${(21000 + Math.floor(Math.random() * 80000)).toLocaleString()} | Block: ${19200000 + i * 12} | Nonce: ${i + 42}`,
  }));

  const selectableColumns = [
    { key: "name", label: "Validator", sortable: true },
    { key: "stake", label: "Stake", sortable: true },
    { key: "uptime", label: "Uptime", sortable: true },
    { key: "commission", label: "Commission" },
    { key: "delegators", label: "Delegators", sortable: true },
    { key: "status", label: "Status" },
  ];

  const selectableRows = [
    { id: "v1", name: "CyberNode Alpha", stake: "2,450,000 ETH", uptime: "99.98%", commission: "5%", delegators: 1247, status: "Active" },
    { id: "v2", name: "Quantum Stake", stake: "1,890,000 ETH", uptime: "99.95%", commission: "8%", delegators: 892, status: "Active" },
    { id: "v3", name: "NeonVault", stake: "1,230,000 ETH", uptime: "99.87%", commission: "3%", delegators: 2103, status: "Active" },
    { id: "v4", name: "DarkPool Validators", stake: "980,000 ETH", uptime: "99.91%", commission: "6%", delegators: 654, status: "Active" },
    { id: "v5", name: "GridSync Labs", stake: "756,000 ETH", uptime: "99.72%", commission: "10%", delegators: 431, status: "Warning" },
    { id: "v6", name: "Phantom Stake", stake: "523,000 ETH", uptime: "98.50%", commission: "4%", delegators: 312, status: "Active" },
    { id: "v7", name: "ZeroLatency", stake: "412,000 ETH", uptime: "99.99%", commission: "7%", delegators: 567, status: "Active" },
    { id: "v8", name: "ByteForge", stake: "389,000 ETH", uptime: "97.20%", commission: "12%", delegators: 198, status: "Inactive" },
  ];

  const paginatedColumns = [
    { key: "block", label: "Block", sortable: true },
    { key: "hash", label: "Hash" },
    { key: "txCount", label: "Transactions", sortable: true },
    { key: "gasUsed", label: "Gas Used", sortable: true },
    { key: "reward", label: "Reward", sortable: true },
    { key: "timestamp", label: "Time", sortable: true },
  ];

  const paginatedRows = Array.from({ length: 25 }, (_, i) => ({
    id: `b${i}`,
    block: 19200000 + i,
    hash: `0x${Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}...`,
    txCount: 80 + Math.floor(Math.random() * 200),
    gasUsed: `${(12 + Math.random() * 18).toFixed(2)}M`,
    reward: `${(0.01 + Math.random() * 0.05).toFixed(4)} ETH`,
    timestamp: `${Math.floor(Math.random() * 59 + 1)}s ago`,
  }));

  const { Story } = defineMeta({
    title: "Data Display/DataTable",
    component: DataTable,
    tags: ["autodocs"],
    args: {
      columns: txColumns,
      rows: txRows,
      selectable: false,
      expandable: false,
      pageSize: 0,
      striped: false,
      stickyHeader: true,
      rowKey: "id",
    },
  });
</script>

<Story
  name="FullFeature"
  args={{
    columns: txColumns,
    rows: txRows,
    selectable: true,
    expandable: true,
    pageSize: 10,
    striped: true,
    maxHeight: "500px",
    renderExpanded: (row) => row.details || "No additional information",
  }}
/>

<Story
  name="Selectable"
  args={{
    columns: selectableColumns,
    rows: selectableRows,
    selectable: true,
    rowKey: "id",
  }}
/>

<Story
  name="Paginated"
  args={{
    columns: paginatedColumns,
    rows: paginatedRows,
    pageSize: 5,
    rowKey: "id",
  }}
/>
