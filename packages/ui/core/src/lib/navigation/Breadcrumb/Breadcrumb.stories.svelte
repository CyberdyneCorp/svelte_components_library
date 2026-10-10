<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Breadcrumb from "./Breadcrumb.svelte";

  const defaultItems = [
    { label: "Dashboard", href: "/" },
    { label: "Models", href: "/models" },
    { label: "GPT-4 Fine-tune" },
  ];

  const longPathItems = [
    { label: "Home", href: "/" },
    { label: "Research", href: "/research" },
    { label: "ML Pipelines", href: "/research/pipelines" },
    { label: "Experiment #42", href: "/research/pipelines/42" },
    { label: "Epoch Results" },
  ];

  const homeIconItems = [
    { label: "Home", href: "/", icon: "home", iconOnly: true },
    { label: "VPS", href: "/vps" },
    { label: "Docker" },
  ];

  const labelledIconItems = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Servers", href: "/servers", icon: "cpu" },
    { label: "Settings", href: "/servers/web-01/settings", icon: "settings" },
    { label: "Security" },
  ];

  const { Story } = defineMeta({
    title: "Navigation/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
  });
</script>

<Story name="Default" args={{ items: defaultItems }} />

<Story name="LongPath" args={{ items: longPathItems }} />

<Story name="HomeIcon" args={{ items: homeIconItems }} />

<Story name="IconsWithLabels" args={{ items: labelledIconItems }} />
