<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Breadcrumb from "./Breadcrumb.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Breadcrumb
    items={[
      { label: "Dashboard", href: "/" },
      { label: "Models", href: "/models" },
      { label: "GPT-4 Fine-tune" },
    ]}
  />
</Story>

<Story name="LongPath">
  <Breadcrumb
    items={[
      { label: "Home", href: "/" },
      { label: "Research", href: "/research" },
      { label: "ML Pipelines", href: "/research/pipelines" },
      { label: "Experiment #42", href: "/research/pipelines/42" },
      { label: "Epoch Results" },
    ]}
  />
</Story>
