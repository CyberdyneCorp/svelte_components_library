<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Sidebar from "./Sidebar.svelte";
  import type { SidebarGroup, SidebarItem } from "./Sidebar.svelte";

  const defaultSidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: ">" },
    { id: "models", label: "Models", icon: "M" },
    { id: "datasets", label: "Datasets", icon: "D" },
    { id: "settings", label: "Settings", icon: "S" },
  ];

  const subItemsSidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: ">" },
    {
      id: "models",
      label: "Models",
      icon: "M",
      children: [
        { id: "train", label: "Training" },
        { id: "eval", label: "Evaluation" },
        { id: "deploy", label: "Deployment" },
      ],
    },
    {
      id: "data",
      label: "Data",
      icon: "D",
      children: [
        { id: "upload", label: "Upload" },
        { id: "explore", label: "Explore" },
      ],
    },
    { id: "settings", label: "Settings", icon: "S" },
  ];

  const consoleGroups: SidebarGroup[] = [
    {
      id: "server",
      label: "Servidor",
      items: [
        { id: "overview", label: "Visão geral", icon: "V", href: "/vps" },
        { id: "gpu", label: "GPU", icon: "G", href: "/vps/gpu", badge: "Beta" },
        {
          id: "config",
          label: "Configurações",
          icon: "C",
          children: [
            { id: "main", label: "Principais", href: "/vps/config" },
            { id: "ip", label: "Endereço IP", href: "/vps/config/ip" },
          ],
        },
      ],
    },
    {
      id: "apps",
      label: "Aplicativos",
      collapsible: true,
      defaultOpen: true,
      items: [
        { id: "docker", label: "Docker", icon: "D", href: "/vps/docker" },
        { id: "node", label: "Node.js", icon: "N", href: "/vps/node", badge: "3" },
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      collapsible: true,
      defaultOpen: false,
      items: [
        { id: "seo", label: "SEO", icon: "S", href: "/marketing/seo" },
        {
          id: "legacy",
          label: "Campanhas antigas",
          icon: "L",
          href: "/marketing/legacy",
          disabled: true,
        },
      ],
    },
    {
      id: "help",
      label: "Ajuda",
      items: [
        { id: "docs", label: "API", icon: "?", href: "https://example.test/docs", external: true },
      ],
    },
  ];

  const { Story } = defineMeta({
    title: "Navigation/Sidebar",
    component: Sidebar,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });
</script>

<Story name="Default" args={{ activeId: "dashboard", items: defaultSidebarItems }} />

<Story
  name="Collapsed"
  args={{ collapsed: true, activeId: "dashboard", items: defaultSidebarItems }}
/>

<Story name="WithSubItems" args={{ activeId: "train", items: subItemsSidebarItems }} />

<Story
  name="Labelled"
  args={{ ariaLabel: "Main navigation", activeId: "dashboard", items: defaultSidebarItems }}
/>

<Story
  name="Grouped"
  args={{
    ariaLabel: "Painel",
    activeId: "docker",
    groups: consoleGroups,
    externalLabel: "abre em nova aba",
    onnavigate: (href: string) => console.log("navigate", href),
  }}
/>

<Story
  name="CollapsedWithFlyout"
  args={{
    ariaLabel: "Painel",
    collapsed: true,
    activeId: "main",
    groups: consoleGroups,
  }}
/>
