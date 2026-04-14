<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelNotification from "./PixelNotification.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelNotification", component: PixelNotification, tags: ["autodocs"] });
</script>

<Story name="Info" args={{ title: "Update Installed", message: "CyberdyneOS 2.1 is ready.", variant: "info" }} />
<Story name="Success" args={{ title: "Swap Complete", message: "You received 1.25 ETH.", variant: "success" }} />
<Story name="Warning" args={{ message: "Gas fees are high right now.", variant: "warning" }} />
<Story name="Error" args={{ title: "Disconnected", message: "Wallet connection lost.", variant: "error" }} />
