<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import SplitButton from "./SplitButton.svelte";

  const { Story } = defineMeta({
    title: "Primitives/SplitButton",
    component: SplitButton,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    args: {
      onclick: fn(),
      onselect: fn(),
    },
    argTypes: {
      variant: { control: "select", options: ["brand", "secondary", "outline", "ghost", "danger"] },
      size: { control: "inline-radio", options: ["sm", "md", "lg"] },
      align: { control: "inline-radio", options: ["left", "right"] },
    },
  });

  const powerItems = [
    { label: "Shut down", value: "shutdown" },
    { label: "Start", value: "start" },
    { label: "Reinstall", value: "reinstall", variant: "danger" as const },
  ];
</script>

<Story name="Default" args={{ label: "Restart", items: powerItems }} />

<!-- Every text is a prop: the caret's accessible name and the menu's name come from `menuLabel`. -->
<Story
  name="Translated"
  args={{
    label: "Reiniciar",
    menuLabel: "Mais ações",
    items: [
      { label: "Desligar", value: "shutdown" },
      { label: "Iniciar", value: "start" },
    ],
  }}
/>

<Story name="Variants" asChild>
  <div style="display: flex; flex-wrap: wrap; gap: var(--space-3); padding: var(--space-2);">
    <SplitButton label="Restart" items={powerItems} variant="brand" />
    <SplitButton label="Restart" items={powerItems} variant="secondary" />
    <SplitButton label="Restart" items={powerItems} variant="outline" />
    <SplitButton label="Restart" items={powerItems} variant="ghost" />
  </div>
</Story>

<!--
  Kept apart from "Variants": Button's danger surface (`--color-state-error` under `--color-text-primary`)
  measures 3.02:1 in the default theme, a foundation-token contrast issue that is not SplitButton's to fix.
-->
<Story
  name="Danger"
  args={{ label: "Delete", items: powerItems, variant: "danger" }}
  parameters={{ a11y: { test: "todo" } }}
/>

<Story name="Sizes" asChild>
  <div
    style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding: var(--space-2);"
  >
    <SplitButton label="Restart" items={powerItems} size="sm" />
    <SplitButton label="Restart" items={powerItems} size="md" />
    <SplitButton label="Restart" items={powerItems} size="lg" />
  </div>
</Story>

<Story name="Disabled" args={{ label: "Restart", items: powerItems, disabled: true }} />

<!-- While loading the primary action keeps its accessible name even though Button shows only the spinner. -->
<Story name="Loading" args={{ label: "Restarting", items: powerItems, loading: true }} />

<!-- `align="right"` keeps the menu inside the viewport when the button sits at the end of a toolbar. -->
<Story name="Right aligned" asChild>
  <div style="display: flex; justify-content: flex-end; padding: var(--space-2);">
    <SplitButton label="Restart" items={powerItems} align="right" />
  </div>
</Story>
