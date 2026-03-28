<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SortableList from "./SortableList.svelte";

  const { Story } = defineMeta({
    title: "Data/SortableList",
    component: SortableList,
    tags: ["autodocs"],
  });

  const defaultItems = [
    { id: "1", title: "Set up CI/CD pipeline", priority: "High" },
    { id: "2", title: "Implement user authentication", priority: "Critical" },
    { id: "3", title: "Design landing page", priority: "Medium" },
    { id: "4", title: "Write API documentation", priority: "Low" },
    { id: "5", title: "Optimize database queries", priority: "High" },
    { id: "6", title: "Add unit tests for checkout flow", priority: "Medium" },
  ];

  const customItems = [
    { id: "t1", ticketId: "CYB-101", title: "Refactor auth module", priority: "Critical", assignee: "AC" },
    { id: "t2", ticketId: "CYB-102", title: "Fix pagination bug", priority: "High", assignee: "BR" },
    { id: "t3", ticketId: "CYB-103", title: "Add dark mode support", priority: "Medium", assignee: "CD" },
    { id: "t4", ticketId: "CYB-104", title: "Improve search performance", priority: "High", assignee: "DK" },
    { id: "t5", ticketId: "CYB-105", title: "Update onboarding flow", priority: "Low", assignee: "EP" },
  ];

  const priorityColor = (p) =>
    p === "Critical" ? "var(--color-state-error)" :
    p === "High" ? "var(--color-state-warning)" :
    p === "Medium" ? "var(--color-state-info)" :
    "var(--color-text-muted)";
</script>

<Story name="Default">
  <SortableList items={defaultItems} onreorder={(items) => console.log("Reordered:", items)}>
    {#snippet renderItem({ item, index, dragHandle })}
      {@render dragHandle()}
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <span style="color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: 0.75rem; min-width: 20px;">
          {index + 1}
        </span>
        <span style="color: var(--color-text-primary); flex: 1;">{item.title}</span>
        <span style="
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: {priorityColor(item.priority)};
          border: 1px solid currentColor;
        ">{item.priority}</span>
      </div>
    {/snippet}
  </SortableList>
</Story>

<Story name="WithCustomRender">
  <SortableList items={customItems} onreorder={(items) => console.log("Reordered:", items)}>
    {#snippet renderItem({ item, index, dragHandle })}
      {@render dragHandle()}
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <span style="
          color: var(--color-action-secondary-default);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 64px;
        ">{item.ticketId}</span>
        <span style="color: var(--color-text-primary); flex: 1;">{item.title}</span>
        <span style="
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          background: {priorityColor(item.priority)};
          color: var(--color-surface-default);
        ">{item.priority}</span>
        <span style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-surface-hover);
          color: var(--color-text-secondary);
          font-size: 0.6875rem;
          font-weight: 600;
        ">{item.assignee}</span>
      </div>
    {/snippet}
  </SortableList>
</Story>

<Story name="Disabled">
  <SortableList items={defaultItems} disabled={true} onreorder={(items) => console.log("Reordered:", items)}>
    {#snippet renderItem({ item, index, dragHandle })}
      {@render dragHandle()}
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
        <span style="color: var(--color-text-tertiary); font-family: var(--font-mono); font-size: 0.75rem; min-width: 20px;">
          {index + 1}
        </span>
        <span style="color: var(--color-text-primary); flex: 1;">{item.title}</span>
        <span style="
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: {priorityColor(item.priority)};
          border: 1px solid currentColor;
        ">{item.priority}</span>
      </div>
    {/snippet}
  </SortableList>
</Story>
