<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelAlert from "./PixelAlert.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelAlert", component: PixelAlert, tags: ["autodocs"] });
</script>

<Story name="Info" args={{ open: true, title: "Update Available", message: "CyberdyneOS 2.1 is ready to install.", confirmLabel: "Install", cancelLabel: "Later" }} />
<Story name="Warning" args={{ open: true, title: "Unsaved Changes", message: "Closing this window will discard your changes.", variant: "warning", confirmLabel: "Discard", cancelLabel: "Cancel" }} />
<Story name="Error" args={{ open: true, title: "Network Error", message: "Unable to reach the RPC node.", variant: "error" }} />
