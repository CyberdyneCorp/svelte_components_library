<svelte:options runes={true} />

<script lang="ts">
  import QueryBuilder from "../forms/QueryBuilder/QueryBuilder.svelte";
  import FilterChipRow from "../data/FilterChipRow/FilterChipRow.svelte";
  import SavedViews from "../data/SavedViews/SavedViews.svelte";
  import DataTable from "../data/DataTable/DataTable.svelte";
  import { evaluateQuery, type Query, type QueryField } from "../forms/QueryBuilder/query.js";
  import type { SavedView } from "../data/SavedViews/types.js";

  /** Synthetic orders; no real customers or prices. */
  const orders = [
    { id: "ord-1001", customer: "Northwind Labs", status: "open", total: 1240, created: "2026-09-02", priority: true },
    { id: "ord-1002", customer: "Blue Harbor", status: "shipped", total: 310, created: "2026-09-05", priority: false },
    { id: "ord-1003", customer: "Acme Robotics", status: "open", total: 89, created: "2026-09-11", priority: false },
    { id: "ord-1004", customer: "Lumen Studio", status: "cancelled", total: 560, created: "2026-09-14", priority: false },
    { id: "ord-1005", customer: "Northwind Labs", status: "shipped", total: 2750, created: "2026-09-20", priority: true },
    { id: "ord-1006", customer: "Quarry & Co", status: "open", total: 430, created: "2026-09-28", priority: false },
    { id: "ord-1007", customer: "Blue Harbor", status: "open", total: 1810, created: "2026-10-03", priority: true },
    { id: "ord-1008", customer: "Acme Robotics", status: "shipped", total: 75, created: "2026-10-07", priority: false },
  ];

  const fields: QueryField[] = [
    { key: "customer", label: "Customer", type: "text" },
    {
      key: "status",
      label: "Status",
      type: "enum",
      options: [
        { value: "open", label: "Open" },
        { value: "shipped", label: "Shipped" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    { key: "total", label: "Total", type: "number" },
    { key: "created", label: "Created", type: "date" },
    { key: "priority", label: "Priority", type: "boolean" },
  ];

  const columns = [
    { key: "id", label: "Order" },
    { key: "customer", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "total", label: "Total" },
    { key: "created", label: "Created" },
  ];

  const empty: Query = { combinator: "and", conditions: [] };

  let views = $state<SavedView<Query>[]>([
    { id: "all", name: "All orders", state: empty, builtin: true },
    {
      id: "big-open",
      name: "Open over $1,000",
      state: {
        combinator: "and",
        conditions: [
          { id: "v1", field: "status", operator: "in", value: ["open"] },
          { id: "v2", field: "total", operator: "gt", value: 1000 },
        ],
      },
    },
  ]);
  let activeId = $state("all");
  let query = $state<Query>(empty);
  let nextId = 1;

  let active = $derived(views.find((v) => v.id === activeId));
  let dirty = $derived(!!active && JSON.stringify(active.state) !== JSON.stringify(query));
  let rows = $derived(orders.filter((row) => evaluateQuery(query, row, fields)));

  function removeCondition(id: string) {
    query = { ...query, conditions: query.conditions.filter((c) => c.id !== id) };
  }
</script>

<section class="demo" aria-labelledby="demo-title">
  <h2 id="demo-title" class="demo__title">Orders</h2>
  <SavedViews
    {views}
    bind:activeId
    {dirty}
    onselect={(view) => (query = view.state)}
    onsave={(name) => {
      const view = { id: `saved-${nextId++}`, name, state: query };
      views = [...views, view];
      activeId = view.id;
    }}
    onupdate={(view) => (views = views.map((v) => (v.id === view.id ? { ...v, state: query } : v)))}
    onrename={(view, name) => (views = views.map((v) => (v.id === view.id ? { ...v, name } : v)))}
    ondelete={(view) => {
      views = views.filter((v) => v.id !== view.id);
      activeId = "all";
      query = empty;
    }}
  />
  <QueryBuilder {fields} bind:query />
  <FilterChipRow {fields} {query} onremove={removeCondition} onclear={() => (query = { ...query, conditions: [] })} />
  <p class="demo__count" aria-live="polite">{rows.length} of {orders.length} orders</p>
  <DataTable {columns} {rows} />
</section>

<style>
  .demo {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
    max-width: 64rem;
    font-family: var(--font-body);
    color: var(--color-text-primary);
  }

  .demo__title {
    margin: 0;
    font-size: 1.25rem;
  }

  .demo__count {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
</style>
