<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MegaMenu from "./MegaMenu.svelte";

  const { Story } = defineMeta({
    title: "Navigation/MegaMenu",
    component: MegaMenu,
    tags: ["autodocs"],
  });

  const defaultSections = [
    {
      title: "Platform",
      items: [
        { label: "CyberdyneDAO", href: "/platform/dao", description: "Decentralized governance", icon: "🏛" },
        { label: "YieldPath", href: "/platform/yield", description: "Yield aggregation protocol", icon: "📈" },
        { label: "Vision Factory", href: "/platform/vision", description: "AI analytics engine", icon: "🔮" },
        { label: "Terraform Game", href: "/platform/terraform", description: "On-chain strategy game", icon: "🎮" },
      ],
    },
    {
      title: "Developer",
      items: [
        { label: "API Docs", href: "/dev/api", description: "REST and GraphQL reference", icon: "📡" },
        { label: "SDKs", href: "/dev/sdks", description: "Client libraries", icon: "📦" },
        { label: "CLI Tools", href: "/dev/cli", description: "Command-line utilities", icon: "⌨" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Blog", href: "/resources/blog", description: "Latest news and updates", icon: "📝" },
        { label: "Community", href: "/resources/community", description: "Join the discussion", icon: "💬" },
        { label: "Support", href: "/resources/support", description: "Get help", icon: "🛟" },
      ],
    },
  ];

  const twoColumnSections = [
    defaultSections[0],
    defaultSections[1],
  ];
</script>

<Story name="Default" args={{ sections: defaultSections }}>
  {#snippet children(args)}
    <MegaMenu {...args}>
      {#snippet trigger()}
        <button style="padding: 8px 16px; background: var(--color-surface-hover, #222); color: var(--color-text-primary, #fff); border: 1px solid var(--color-border-subtle, #333); border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
          Explore ▾
        </button>
      {/snippet}
    </MegaMenu>
  {/snippet}
</Story>

<Story name="TwoColumn" args={{ sections: twoColumnSections }}>
  {#snippet children(args)}
    <MegaMenu {...args}>
      {#snippet trigger()}
        <button style="padding: 8px 16px; background: var(--color-surface-hover, #222); color: var(--color-text-primary, #fff); border: 1px solid var(--color-border-subtle, #333); border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
          Products ▾
        </button>
      {/snippet}
    </MegaMenu>
  {/snippet}
</Story>
