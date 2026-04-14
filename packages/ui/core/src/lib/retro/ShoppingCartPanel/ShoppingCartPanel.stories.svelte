<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ShoppingCartPanel from "./ShoppingCartPanel.svelte";
  const { Story } = defineMeta({ title: "Retro/ShoppingCartPanel", component: ShoppingCartPanel, tags: ["autodocs"] });
</script>

<Story name="Empty" args={{
  suggestions: [
    { id: "svc", icon: "🔧", title: "Services", subtitle: "Custom development solutions" },
    { id: "trn", icon: "📚", title: "Training", subtitle: "Learn Web3 development" },
    { id: "lic", icon: "📄", title: "Licenses", subtitle: "Software subscriptions" },
  ],
}} />

<Story name="WithItems" args={{
  items: [
    { id: "a", title: "Smart Contract Audit", price: 2500, icon: "🛡️" },
    { id: "b", title: "Full-Stack Build", price: 12000, icon: "🏗️" },
  ],
}} />
