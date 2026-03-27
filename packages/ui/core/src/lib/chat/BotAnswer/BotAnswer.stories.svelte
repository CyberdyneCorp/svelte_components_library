<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BotAnswer from "./BotAnswer.svelte";

  const { Story } = defineMeta({
    title: "Chat/BotAnswer",
    component: BotAnswer,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ content: "The current gas price on Ethereum mainnet is approximately 25 gwei." }} />

<Story name="WithCode" args={{ content: "You can use `eth_getBalance` to check your wallet balance. Try calling `web3.eth.getBalance(address)` in your console." }} />

<Story name="Typing" args={{ typing: true }} />

<Story name="SurfaceVariant" args={{ variant: "surface", content: "This response uses the surface variant styling." }} />
