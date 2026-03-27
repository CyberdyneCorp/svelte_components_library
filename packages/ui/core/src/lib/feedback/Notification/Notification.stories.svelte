<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Notification from "./Notification.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Notification",
    component: Notification,
    tags: ["autodocs"],
  });
</script>

<Story name="Success" args={{ variant: "success", message: "Transaction confirmed successfully.", duration: 0 }} />

<Story name="Warning" args={{ variant: "warning", message: "Network congestion detected. Delays expected.", duration: 0 }} />

<Story name="Error" args={{ variant: "error", message: "Connection to node lost. Retrying...", duration: 0 }} />

<Story name="Info" args={{ variant: "info", message: "New block mined: #14,203,892", duration: 0 }} />
