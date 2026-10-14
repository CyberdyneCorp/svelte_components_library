<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import QueryFilteringDemo from "../lib/_testdata/QueryFilteringDemo.svelte";

  const { Story } = defineMeta({
    title: "Patterns/Query filtering",
    component: QueryFilteringDemo,
    parameters: { layout: "fullscreen", a11y: { test: "error" } },
  });
</script>

<!-- SavedViews + QueryBuilder + FilterChipRow + DataTable, filtered client-side with evaluateQuery. -->
<Story
  name="Filtered list"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("8 of 8 orders")).toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "View" }), "big-open");
    await expect(canvas.getByText("2 of 8 orders")).toBeInTheDocument();
    await expect(canvas.getByRole("list", { name: "Active filters" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Remove filter: Total is greater than 1000" }));
    await expect(canvas.getByText("4 of 8 orders")).toBeInTheDocument();
    await expect(canvas.getByText("Modified")).toBeInTheDocument();
  }}
/>
