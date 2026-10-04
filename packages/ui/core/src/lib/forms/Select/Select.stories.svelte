<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Select from "./Select.svelte";

  const { Story } = defineMeta({
    title: "Forms/Select",
    component: Select,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Native `<select>`. `placeholder` (default `\"Select an option...\"`) renders a hidden prompt option while `value` is `\"\"`. Pass `placeholder={null}` to render only `options`, and give `value` one of their values. The placeholder is also skipped when `options` has its own `\"\"` option. `id`, `ariaLabel` (accessible name without a visible label) and `data-*` attributes reach the native `<select>`.",
        },
      },
    },
  });

  const filterOptions = [
    { value: "", label: "All networks" },
    { value: "ethereum", label: "Ethereum Mainnet" },
    { value: "polygon", label: "Polygon" },
  ];

  const networkOptions = [
    { value: "ethereum", label: "Ethereum Mainnet" },
    { value: "polygon", label: "Polygon" },
    { value: "arbitrum", label: "Arbitrum One" },
    { value: "optimism", label: "Optimism" },
  ];
</script>

<Story name="Default" args={{ options: networkOptions, placeholder: "Choose network..." }} />

<Story name="WithLabel" args={{ label: "Network", options: networkOptions, placeholder: "Choose network..." }} />

<Story name="WithError" args={{ label: "Network", options: networkOptions, error: "Network selection is required" }} />

<Story name="Disabled" args={{ label: "Network", options: networkOptions, value: "ethereum", disabled: true }} />

<Story name="NoPlaceholder" args={{ label: "Network", options: networkOptions, value: "ethereum", placeholder: null }} />

<Story name="EmptyOption" args={{ label: "Filter by network", options: filterOptions }} />

<Story name="VisuallyHiddenLabel">
  {#snippet template()}
    <ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem;">
      {#each ["Treasury", "Payroll"] as row (row)}
        <li style="display: flex; align-items: center; gap: 1rem;">
          <span style="min-width: 6rem;">{row}</span>
          <Select
            id="network-{row.toLowerCase()}"
            ariaLabel="Network for {row}"
            options={networkOptions}
            value="ethereum"
            placeholder={null}
            data-row={row}
          />
        </li>
      {/each}
    </ul>
  {/snippet}
</Story>
