<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SavedViews from "./SavedViews.svelte";
  import type { SavedView } from "./types.js";

  type ListState = { search: string };

  const initialViews: SavedView<ListState>[] = [
    { id: "all", name: "All orders", state: { search: "" }, builtin: true },
    { id: "open", name: "Open orders", state: { search: "status:open" } },
    { id: "big", name: "Over $1,000", state: { search: "total>1000" } },
  ];

  const { Story } = defineMeta({
    title: "Data/SavedViews",
    component: SavedViews,
    tags: ["autodocs"],
    parameters: { a11y: { test: "error" } },
  });
</script>

<script lang="ts">
  // The application owns views, the current state and persistence.
  let views = $state(initialViews);
  let activeId = $state("open");
  let search = $state("status:open");
  let active = $derived(views.find((v) => v.id === activeId));
  let dirty = $derived(!!active && active.state.search !== search);
  let nextId = 1;
</script>

<Story name="Managed views" asChild>
  <div style="display: grid; gap: 1rem; max-width: 40rem;">
    <SavedViews
      {views}
      bind:activeId
      {dirty}
      onselect={(view) => (search = view.state.search)}
      onsave={(name) => {
        const view = { id: `v${nextId++}`, name, state: { search } };
        views = [...views, view];
        activeId = view.id;
      }}
      onupdate={(view) => (views = views.map((v) => (v.id === view.id ? { ...v, state: { search } } : v)))}
      onrename={(view, name) => (views = views.map((v) => (v.id === view.id ? { ...v, name } : v)))}
      ondelete={(view) => {
        views = views.filter((v) => v.id !== view.id);
        activeId = "all";
        search = "";
      }}
    />
    <label style="display: grid; gap: 0.25rem; font-family: var(--font-body); color: var(--color-text-secondary);">
      Search (edit to make the view dirty)
      <input bind:value={search} />
    </label>
  </div>
</Story>

<Story
  name="Built-in view, modified"
  args={{
    views: initialViews,
    activeId: "all",
    dirty: true,
    onselect: () => {},
    onsave: () => {},
  }}
/>
