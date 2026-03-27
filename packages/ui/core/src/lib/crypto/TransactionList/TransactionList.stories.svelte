<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TransactionList from "./TransactionList.svelte";

  const { Story } = defineMeta({
    title: "Crypto/TransactionList",
    component: TransactionList,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <div style="max-width: 480px;">
    <TransactionList transactions={[
      { hash: "0xabc123def456789012345678", type: "send", amount: "0.5", symbol: "ETH", status: "confirmed", timestamp: "2 min ago", to: "0x1234...abcd" },
      { hash: "0xdef789abc012345678901234", type: "receive", amount: "100", symbol: "USDC", status: "confirmed", timestamp: "1 hour ago", from: "0x5678...efgh" },
      { hash: "0x123456789abcdef012345678", type: "swap", amount: "1.0 ETH → 1800 USDC", symbol: "", status: "confirmed", timestamp: "3 hours ago" },
    ]} />
  </div>
</Story>

<Story name="WithPending">
  <div style="max-width: 480px;">
    <TransactionList transactions={[
      { hash: "0xpending1234567890abcdef", type: "send", amount: "2.0", symbol: "ETH", status: "pending", timestamp: "Just now" },
      { hash: "0xfailed12345678901234abcd", type: "approve", amount: "Unlimited", symbol: "USDC", status: "failed", timestamp: "5 min ago" },
      { hash: "0xconfirm1234567890abcdef1", type: "receive", amount: "500", symbol: "DAI", status: "confirmed", timestamp: "1 hour ago" },
    ]} />
  </div>
</Story>

<Story name="Empty">
  <div style="max-width: 480px;">
    <TransactionList transactions={[]} />
  </div>
</Story>
