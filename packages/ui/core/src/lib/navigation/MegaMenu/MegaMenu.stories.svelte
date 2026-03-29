<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MegaMenuDemo from "./MegaMenuDemo.svelte";

  const { Story } = defineMeta({
    title: "Navigation/MegaMenu",
    component: MegaMenuDemo,
    tags: ["autodocs"],
  });

  const defaultSections = [
    {
      title: "Platform",
      items: [
        { label: "CyberdyneDAO", href: "/dao", description: "Decentralized governance", icon: "🏛" },
        { label: "YieldPath", href: "/yield", description: "Yield aggregation protocol", icon: "📈" },
        { label: "Vision Factory", href: "/vision", description: "AI analytics engine", icon: "🔮" },
        { label: "Terraform Game", href: "/terraform", description: "On-chain strategy game", icon: "🎮" },
      ],
    },
    {
      title: "Developer",
      items: [
        { label: "API Docs", href: "/api", description: "REST and GraphQL reference", icon: "📡" },
        { label: "SDKs", href: "/sdks", description: "Client libraries", icon: "📦" },
        { label: "CLI Tools", href: "/cli", description: "Command-line utilities", icon: "⌨" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Blog", href: "/blog", description: "Latest news and updates", icon: "📝" },
        { label: "Community", href: "/community", description: "Join the discussion", icon: "💬" },
        { label: "Support", href: "/support", description: "Get help", icon: "🛟" },
      ],
    },
  ];
</script>

<Story name="Default" args={{ sections: defaultSections }} />

<Story name="Open" args={{ sections: defaultSections, startOpen: true }} />

<Story name="TwoColumn" args={{ sections: defaultSections.slice(0, 2), startOpen: true }} />
