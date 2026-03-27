<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BotAnswer from "./BotAnswer.svelte";

  const { Story } = defineMeta({
    title: "Chat/BotAnswer",
    component: BotAnswer,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <BotAnswer content="The current gas price on Ethereum mainnet is approximately 25 gwei." />
</Story>

<Story name="WithCode">
  <BotAnswer content="You can use `eth_getBalance` to check your wallet balance. Try calling `web3.eth.getBalance(address)` in your console." />
</Story>

<Story name="Typing">
  <BotAnswer typing />
</Story>

<Story name="SurfaceVariant">
  <BotAnswer variant="surface" content="This response uses the surface variant styling." />
</Story>
