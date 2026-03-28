<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FilterBar from "./FilterBar.svelte";

  const { Story } = defineMeta({
    title: "Data/FilterBar",
    component: FilterBar,
    tags: ["autodocs"],
  });

  const defaultFilters = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "open", label: "Open" },
        { value: "in_progress", label: "In Progress" },
        { value: "done", label: "Done" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      id: "priority",
      label: "Priority",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical" },
      ],
    },
    {
      id: "assignee",
      label: "Assignee",
      type: "multiselect",
      options: [
        { value: "alice", label: "Alice Chen" },
        { value: "bob", label: "Bob Reese" },
        { value: "carol", label: "Carol Diaz" },
        { value: "dave", label: "Dave Kim" },
        { value: "eve", label: "Eve Park" },
      ],
    },
    {
      id: "sprint",
      label: "Sprint",
      type: "select",
      options: [
        { value: "23", label: "Sprint 23" },
        { value: "24", label: "Sprint 24" },
        { value: "25", label: "Sprint 25" },
      ],
    },
  ];
</script>

<Story name="Default" args={{
  filters: defaultFilters,
  activeFilters: {},
  onchange: (f) => console.log("Filters changed:", f),
  onclear: () => console.log("Filters cleared"),
}} />

<Story name="Active" args={{
  filters: defaultFilters,
  activeFilters: { status: "open", priority: "high" },
  onchange: (f) => console.log("Filters changed:", f),
  onclear: () => console.log("Filters cleared"),
}} />

<Story name="Compact" args={{
  filters: defaultFilters,
  activeFilters: {},
  compact: true,
  onchange: (f) => console.log("Filters changed:", f),
  onclear: () => console.log("Filters cleared"),
}} />
