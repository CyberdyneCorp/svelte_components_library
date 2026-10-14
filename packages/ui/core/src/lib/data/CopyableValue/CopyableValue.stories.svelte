<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CopyableValue from "./CopyableValue.svelte";

  const { Story } = defineMeta({
    title: "Data/CopyableValue",
    component: CopyableValue,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
    },
    argTypes: {
      truncate: { control: "inline-radio", options: ["none", "middle", "end"] },
    },
  });
</script>

<Story
  name="Default"
  args={{ value: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", label: "address" }}
/>

<Story name="Short value" args={{ value: "srv-042", label: "server ID" }} />

<!-- End truncation clips to the available width with a CSS ellipsis. -->
<Story name="End truncation in a narrow column" asChild>
  <div style="width: 180px;">
    <CopyableValue value="req_01HZX4Q9T7M3K8V2B6N0P5R1S4" truncate="end" label="request ID" />
  </div>
</Story>

<Story name="Display text" args={{ value: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", display: "alice.eth", mono: false, label: "address" }} />

<Story name="In a table cell" asChild>
  <table style="border-collapse: collapse; font-size: 0.875rem;">
    <thead>
      <tr><th style="text-align: start; padding: 0.5rem;">Run</th><th style="text-align: start; padding: 0.5rem;">Commit</th></tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 0.5rem;">Nightly build</td>
        <td style="padding: 0.5rem;"><CopyableValue value="9f2c1e7a4b8d3f6e0a1c5b9d7e3f2a1b4c6d8e0f" head={7} tail={0} label="commit" /></td>
      </tr>
    </tbody>
  </table>
</Story>
