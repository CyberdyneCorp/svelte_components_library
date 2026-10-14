<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import DataGrid from "./DataGrid.svelte";
  import type { DataGridColumn, DataGridChange } from "./types.js";

  const { Story } = defineMeta({
    title: "Data/DataGrid",
    component: DataGrid,
    tags: ["autodocs"],
    parameters: {
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Editable ARIA grid. One tab stop; arrows, Home/End (Ctrl for the grid corners) and PageUp/PageDown move between cells. Enter, F2, double-click or typing starts editing; Enter commits and moves down, Tab commits and moves right, Escape cancels. Space toggles boolean cells. `validate` keeps the editor open with a message. Committed edits replace `rows` immutably and call `oncellchange`.",
        },
      },
    },
  });

  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  const priceColumns: DataGridColumn[] = [
    { key: "sku", label: "SKU", editable: false, width: "7rem" },
    { key: "name", label: "Product" },
    {
      key: "price",
      label: "Price",
      type: "number",
      align: "end",
      format: (v) => (v == null ? "" : usd.format(v)),
      validate: (v) => (typeof v === "number" && v > 0 ? undefined : "Enter a price above 0"),
    },
    {
      key: "stock",
      label: "Stock",
      type: "number",
      align: "end",
      validate: (v) => (Number.isInteger(v) && v >= 0 ? undefined : "Use a whole number, 0 or more"),
    },
  ];

  const settingsColumns: DataGridColumn[] = [
    { key: "region", label: "Region", editable: false },
    { key: "backups", label: "Backups", type: "boolean" },
    { key: "monitoring", label: "Monitoring", type: "boolean" },
    {
      key: "plan",
      label: "Plan",
      type: "select",
      options: [
        { value: "starter", label: "Starter" },
        { value: "business", label: "Business" },
        { value: "enterprise", label: "Enterprise" },
      ],
    },
  ];

  const auditColumns: DataGridColumn[] = [
    { key: "id", label: "Request ID", editable: false },
    { key: "actor", label: "Actor", editable: false },
    { key: "note", label: "Reviewer note" },
  ];

  /** Edit a price with the keyboard and check that an invalid value is rejected. */
  async function editPrice({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const cells = canvas.getAllByRole("gridcell");
    cells[0].focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    const editor = await canvas.findByRole("spinbutton", { name: "Price, row 1" });
    await userEvent.clear(editor);
    await userEvent.type(editor, "0{Enter}");
    await expect(editor).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(editor);
    await userEvent.type(editor, "21.5{Enter}");
    await waitFor(() => expect(canvas.queryByRole("spinbutton")).toBeNull());
    await expect(cells[2]).toHaveTextContent("$21.50");
    await expect(canvas.getByText("Last change: price → 21.5")).toBeInTheDocument();
  }
</script>

<script lang="ts">
  let products = $state([
    { id: "p1", sku: "KB-101", name: "Mechanical keyboard", price: 89, stock: 42 },
    { id: "p2", sku: "MS-220", name: "Wireless mouse", price: 34.5, stock: 120 },
    { id: "p3", sku: "MN-270", name: "27-inch monitor", price: 279, stock: 8 },
    { id: "p4", sku: "DK-004", name: "USB-C dock", price: 129, stock: 0 },
  ]);
  let lastChange = $state("");

  let regions = $state([
    { id: "r1", region: "São Paulo", backups: true, monitoring: true, plan: "business" },
    { id: "r2", region: "Frankfurt", backups: true, monitoring: false, plan: "starter" },
    { id: "r3", region: "Singapore", backups: false, monitoring: true, plan: "enterprise" },
  ]);

  function describe(change: DataGridChange): string {
    return `Last change: ${change.key} → ${change.value}`;
  }
</script>

<!-- Price list: number cells with currency formatting and validation. -->
<Story name="Price list" play={editPrice}>
  {#snippet template()}
    <DataGrid
      ariaLabel="Price list"
      columns={priceColumns}
      bind:rows={products}
      oncellchange={(change) => (lastChange = describe(change))}
    />
    <p>{lastChange || "No changes yet"}</p>
  {/snippet}
</Story>

<!-- Settings matrix: boolean cells toggle with Space or click; Plan is a select. -->
<Story name="Settings matrix">
  {#snippet template()}
    <DataGrid ariaLabel="Region settings" columns={settingsColumns} bind:rows={regions} />
  {/snippet}
</Story>

<!-- Read-only columns stay navigable but ignore edit keys. -->
<Story
  name="Read-only columns"
  args={{
    ariaLabel: "Audit review",
    columns: auditColumns,
    rows: [
      { id: "req_8f2a", actor: "ops-bot", note: "" },
      { id: "req_91c4", actor: "dana", note: "Approved after call" },
    ],
  }}
/>

<!-- The whole grid read-only, e.g. while a save is in flight. -->
<Story
  name="Read-only grid"
  args={{
    ariaLabel: "Region settings (read-only)",
    columns: settingsColumns,
    readonly: true,
    rows: [
      { id: "r1", region: "São Paulo", backups: true, monitoring: true, plan: "business" },
      { id: "r2", region: "Frankfurt", backups: true, monitoring: false, plan: "starter" },
    ],
  }}
/>
