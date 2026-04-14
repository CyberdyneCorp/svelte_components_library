<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DesktopIcon from "./DesktopIcon.svelte";

  const { Story } = defineMeta({
    title: "Retro/DesktopIcon",
    component: DesktopIcon,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Terminal", icon: "💻" }} />
<Story name="Selected" args={{ label: "DAO", icon: "📦", selected: true }} />
<Story name="WithBadge" args={{ label: "Your Bag", icon: "🛍️", badge: 3 }} />
<Story name="Disabled" args={{ label: "Shop", icon: "🏪", disabled: true }} />
