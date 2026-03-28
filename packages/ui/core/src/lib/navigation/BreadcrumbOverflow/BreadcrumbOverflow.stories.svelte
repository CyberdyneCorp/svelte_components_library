<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BreadcrumbOverflow from "./BreadcrumbOverflow.svelte";

  const shortItems = [
    { label: "Home", href: "/" },
    { label: "Documents", href: "/documents" },
    { label: "Settings" },
  ];

  const longItems = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Cyberdyne", href: "/projects/cyberdyne" },
    { label: "Backend", href: "/projects/cyberdyne/backend" },
    { label: "API", href: "/projects/cyberdyne/backend/api" },
    { label: "v2", href: "/projects/cyberdyne/backend/api/v2" },
    { label: "Endpoints" },
  ];

  const customItems = [
    { label: "Home", href: "/" },
    { label: "Workspace", href: "/workspace" },
    { label: "Repos", href: "/workspace/repos" },
    { label: "Neural Net", href: "/workspace/repos/nn" },
    { label: "Config" },
  ];

  const { Story } = defineMeta({
    title: "Navigation/BreadcrumbOverflow",
    component: BreadcrumbOverflow,
    tags: ["autodocs"],
  });
</script>

<Story name="Short" args={{ items: shortItems }} />

<Story name="Long" args={{ items: longItems }} />

<Story name="Custom" args={{ items: customItems, maxVisible: 3 }} />
