<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Checkbox from "./Checkbox.svelte";

  const { Story } = defineMeta({
    title: "Forms/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
  });
</script>

<Story name="Default">
  <Checkbox label="Accept terms and conditions" />
</Story>

<Story name="Checked">
  <Checkbox label="Enable notifications" checked={true} />
</Story>

<Story name="Disabled">
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <Checkbox label="Disabled unchecked" disabled />
    <Checkbox label="Disabled checked" checked={true} disabled />
  </div>
</Story>

<Story name="WithError">
  <Checkbox label="I agree to the terms" error="You must accept the terms to continue" />
</Story>
