<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Checkbox from "./Checkbox.svelte";

  const { Story } = defineMeta({
    title: "Forms/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Checkbox with a visible `label` (or `ariaLabel` when there is none). `checked` is bindable. The native input is visually hidden (1×1 px, clipped) behind the custom box, so Playwright's visibility check never passes on it: `getByLabel(...)` and `getByRole(...)` resolve to that input and `.check()` times out. Call `.check()` on the visible label instead, e.g. `page.getByText(\"Accept terms\").check()`, which Playwright forwards to the input; keep `getByLabel` / `getByRole` for assertions such as `toBeChecked()`.",
        },
      },
    },
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
