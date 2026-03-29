<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NavBar from "./NavBar.svelte";

  const { Story } = defineMeta({
    title: "Navigation/NavBar",
    component: NavBar,
    tags: ["autodocs"],
  });

  const defaultItems = [
    { label: "Dashboard", href: "/dashboard", active: true },
    {
      label: "Products",
      children: [
        { label: "CyberdyneDAO", href: "/products/dao", description: "Decentralized governance platform", icon: "🏛" },
        { label: "YieldPath", href: "/products/yield", description: "Optimized yield aggregation", icon: "📈" },
        { label: "Vision Factory", href: "/products/vision", description: "AI-powered analytics engine", icon: "🔮" },
      ],
    },
    {
      label: "Docs",
      children: [
        { label: "API Reference", href: "/docs/api", description: "REST and GraphQL endpoints" },
        { label: "Component Library", href: "/docs/components", description: "UI component documentation" },
      ],
    },
    { label: "Community", href: "/community" },
  ];
</script>

<Story name="Default" args={{
  brand: { label: "Cyberdyne", icon: "⬡" },
  items: defaultItems,
}} />

<Story name="WithActions" args={{
  brand: { label: "Cyberdyne", icon: "⬡" },
  items: defaultItems,
}}>
  {#snippet children(args)}
    <NavBar {...args}>
      {#snippet actions()}
        <button style="padding: 6px 16px; background: var(--color-action-brand-default, #00ff88); color: var(--color-surface-base, #000); border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.875rem;">
          Connect Wallet
        </button>
      {/snippet}
    </NavBar>
  {/snippet}
</Story>
