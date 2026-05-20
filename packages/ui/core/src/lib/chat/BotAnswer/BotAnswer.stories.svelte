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

<Story name="Streaming" args={{ content: "Streaming response in progress…", streaming: true }} />

<Story name="WithImageArtifact" args={{
  content: "Here is the chart I generated:",
  attachments: [{ kind: "image", url: "https://placehold.co/400x180/00d4ff/000.png", title: "trend.png" }]
}} />

<Story name="WithFileArtifact" args={{
  content: "Export complete.",
  attachments: [{ kind: "file", url: "#", filename: "openfoam-streamlines.json", byteSize: 2200000, producedBy: "openfoam" }]
}} />

<Story name="WithToolCalls" args={{
  content: "I queried the spatial index and pulled the latest tracks.",
  toolCalls: [
    { name: "search_satellite", argumentsPreview: { group: "starlink" }, status: "ok" },
    { name: "fetch_tle", status: "ok" }
  ]
}} />
