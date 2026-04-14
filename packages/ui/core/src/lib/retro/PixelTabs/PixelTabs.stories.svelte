<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PixelTabs from "./PixelTabs.svelte";
  const { Story } = defineMeta({ title: "Retro/PixelTabs", component: PixelTabs, tags: ["autodocs"] });

  const items = [
    { id: "summary", label: "Summary", icon: "📋" },
    { id: "treasury", label: "Treasury", icon: "💰" },
    { id: "proposals", label: "Proposals", icon: "📜" },
  ];
</script>

<Story name="Default" args={{ items, value: "summary" }} />
<Story name="WithDisabled" args={{ items: [...items, { id: "admin", label: "Admin", disabled: true }], value: "treasury" }} />
