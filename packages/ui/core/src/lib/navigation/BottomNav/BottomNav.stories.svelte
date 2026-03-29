<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BottomNav from "./BottomNav.svelte";

  const { Story } = defineMeta({
    title: "Navigation/BottomNav",
    component: BottomNav,
    tags: ["autodocs"],
  });

  const defaultItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "projects", label: "Projects", icon: "◈" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "profile", label: "Profile", icon: "◉" },
  ];

  const threeItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "profile", label: "Profile", icon: "◉" },
  ];
</script>

<Story name="Default" args={{
  items: defaultItems,
  activeId: "home",
}} />

<Story name="ThreeItems" args={{
  items: threeItems,
  activeId: "home",
}} />
