<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Radio from "./Radio.svelte";

  const { Story } = defineMeta({
    title: "Forms/Radio",
    component: Radio,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Radio group in a `<fieldset>` with a `<legend>`; `value` is bindable. The native input is visually hidden (1×1 px, clipped) behind the custom circle, so Playwright's visibility check never passes on it: `getByLabel(...)` and `getByRole(...)` resolve to that input and `.check()` times out. Call `.check()` on the visible label instead, e.g. `page.getByText(\"Ethereum\").check()`, which Playwright forwards to the input; keep `getByLabel` / `getByRole` for assertions such as `toBeChecked()`.",
        },
      },
    },
  });

  const networkOptions = [
    { value: "eth", label: "Ethereum" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum" },
  ];

  const simpleOptions = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  const planOptions = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
  ];
</script>

<Story name="Default" args={{ label: "Select network", options: networkOptions, value: "eth" }} />

<Story name="Disabled" args={{ label: "Disabled group", disabled: true, options: simpleOptions, value: "a" }} />

<Story name="WithError" args={{ label: "Choose a plan", error: "Please select a plan", options: planOptions }} />
