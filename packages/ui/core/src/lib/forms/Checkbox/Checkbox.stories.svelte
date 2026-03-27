<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Checkbox from "./Checkbox.svelte";

  const { Story } = defineMeta({
    title: "Forms/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Accept terms and conditions" }} />

<Story name="Checked" args={{ label: "Enable notifications", checked: true }} />

<Story name="Disabled">
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <Checkbox label="Disabled unchecked" disabled />
    <Checkbox label="Disabled checked" checked={true} disabled />
  </div>
</Story>

<Story name="WithError" args={{ label: "I agree to the terms", error: "You must accept the terms to continue" }} />
