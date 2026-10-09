<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import TokenBalanceRow from "./TokenBalanceRow.svelte";

  const { Story } = defineMeta({
    title: "Crypto/TokenBalanceRow",
    component: TokenBalanceRow,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      as: { control: "inline-radio", options: ["div", "li"] },
      minDecimals: { control: { type: "number", min: 0 } },
    },
  });

  const holdings = [
    {
      symbol: "ETH",
      name: "Ether",
      amount: "2.345678901234567891",
      decimals: 18,
      chain: "Ethereum",
      value: { amount: "7412.18", currency: "USD" },
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      amount: "1250.5",
      decimals: 6,
      chain: "Base",
      value: { amount: "1250.50", currency: "USD" },
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      amount: "0.0412",
      decimals: 8,
      chain: "Arbitrum One",
      value: { amount: "2701.94", currency: "USD" },
    },
    {
      symbol: "FOO",
      name: "Foo Governance Token",
      amount: "15000",
      decimals: 18,
      chain: "Optimism",
      value: undefined,
    },
  ];
</script>

<Story
  name="Default"
  args={{
    symbol: "ETH",
    name: "Ether",
    amount: "1.5",
    decimals: 18,
    chain: "Ethereum",
    value: { amount: "4512.30", currency: "USD" },
    locale: "en-US",
  }}
/>

<Story
  name="Unpriced"
  args={{
    symbol: "FOO",
    name: "Foo Token",
    amount: "15000",
    decimals: 18,
    chain: "Base",
    unpricedLabel: "No market price",
  }}
/>

<!-- `minDecimals` trims trailing zeros ("2 ETH" rather than "2.000000 ETH");
     stablecoins keep two digits. `data-*` attributes land on the root element. -->
<Story name="Trimmed amounts" asChild>
  <ul style="max-width: 32rem; margin: 0; padding: 0;">
    <TokenBalanceRow
      as="li"
      locale="en-US"
      symbol="ETH"
      name="Ether"
      amount="2"
      decimals={6}
      minDecimals={0}
      chain="Ethereum"
      value={{ amount: "6318.40", currency: "USD" }}
      data-holding="eth-mainnet"
    />
    <TokenBalanceRow
      as="li"
      locale="en-US"
      symbol="ETH"
      name="Ether"
      amount="0.00067"
      decimals={6}
      minDecimals={0}
      chain="Base"
      value={{ amount: "2.12", currency: "USD" }}
      data-holding="eth-base"
    />
    <TokenBalanceRow
      as="li"
      locale="en-US"
      symbol="USDC"
      name="USD Coin"
      amount="1250.5"
      decimals={6}
      minDecimals={2}
      chain="Base"
      value={{ amount: "1250.50", currency: "USD" }}
      data-holding="usdc-base"
    />
  </ul>
</Story>

{#snippet walletList()}
  <section
    aria-labelledby="watch-only-heading"
    style="max-width: 32rem; border: 1px solid var(--color-border-default); border-radius: var(--radius-lg, 12px); background: var(--color-surface-default);"
  >
    <h3 id="watch-only-heading" style="margin: 0; padding: var(--space-3) var(--space-3) 0;">
      Watch-only wallet
    </h3>
    <ul style="margin: 0; padding: var(--space-1) 0;">
      {#each holdings as token (token.symbol)}
        <TokenBalanceRow
          as="li"
          locale="en-US"
          symbol={token.symbol}
          name={token.name}
          amount={token.amount}
          decimals={token.decimals}
          chain={token.chain}
          value={token.value}
          unpricedLabel="No market price"
        />
      {/each}
    </ul>
  </section>
{/snippet}

<Story name="Watch-only wallet list" asChild>
  {@render walletList()}
</Story>

<Story
  name="Watch-only wallet list (calm)"
  asChild
  globals={{ theme: "calm" }}
  play={async ({ canvasElement }) => {
    // Axe must run against the calm palette, not the default theme.
    await expect(document.documentElement.dataset.theme).toBe("calm");
    await expect(canvasElement.querySelectorAll("li.cy-token-row")).toHaveLength(holdings.length);
  }}
>
  {@render walletList()}
</Story>
