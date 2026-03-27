<svelte:options runes={true} />

<script lang="ts">
  type KanbanItem = {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    assignee?: string;
    priority?: "low" | "medium" | "high" | "critical";
  };

  type KanbanColumn = {
    id: string;
    title: string;
    color?: string;
    items: KanbanItem[];
  };

  let {
    columns = [],
    onmove,
    onitemclick,
  }: {
    columns?: KanbanColumn[];
    onmove?: (itemId: string, fromColumn: string, toColumn: string) => void;
    onitemclick?: (item: KanbanItem) => void;
  } = $props();

  let dragItemId = $state<string | null>(null);
  let dragFromColumn = $state<string | null>(null);
  let dragOverColumn = $state<string | null>(null);

  const priorityColors: Record<string, string> = {
    low: "#555570",
    medium: "#00d4ff",
    high: "#ffaa00",
    critical: "#ff3355",
  };

  function handleDragStart(e: DragEvent, itemId: string, columnId: string) {
    dragItemId = itemId;
    dragFromColumn = columnId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", itemId);
    }
  }

  function handleDragOver(e: DragEvent, columnId: string) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
    dragOverColumn = columnId;
  }

  function handleDragLeave() {
    dragOverColumn = null;
  }

  function handleDrop(e: DragEvent, toColumnId: string) {
    e.preventDefault();
    dragOverColumn = null;
    if (dragItemId && dragFromColumn && dragFromColumn !== toColumnId) {
      onmove?.(dragItemId, dragFromColumn, toColumnId);
    }
    dragItemId = null;
    dragFromColumn = null;
  }

  function handleDragEnd() {
    dragItemId = null;
    dragFromColumn = null;
    dragOverColumn = null;
  }
</script>

<div class="cy-kanban">
  {#each columns as col}
    <div
      class="cy-kanban__column"
      class:cy-kanban__column--dragover={dragOverColumn === col.id}
      role="region"
      aria-label={col.title}
      ondragover={(e) => handleDragOver(e, col.id)}
      ondragleave={handleDragLeave}
      ondrop={(e) => handleDrop(e, col.id)}
    >
      <div class="cy-kanban__column-header" style:--col-accent={col.color || "var(--cy-neon-green)"}>
        <span class="cy-kanban__column-title">{col.title}</span>
        <span class="cy-kanban__column-count">{col.items.length}</span>
      </div>

      <div class="cy-kanban__column-body">
        {#each col.items as item (item.id)}
          <div
            class="cy-kanban__card"
            class:cy-kanban__card--dragging={dragItemId === item.id}
            style:--priority-color={priorityColors[item.priority || "low"]}
            draggable="true"
            role="button"
            tabindex="0"
            ondragstart={(e) => handleDragStart(e, item.id, col.id)}
            ondragend={handleDragEnd}
            onclick={() => onitemclick?.(item)}
            onkeydown={(e) => { if (e.key === "Enter") onitemclick?.(item); }}
          >
            <div class="cy-kanban__card-title">{item.title}</div>
            {#if item.description}
              <div class="cy-kanban__card-desc">{item.description}</div>
            {/if}
            {#if item.tags && item.tags.length > 0}
              <div class="cy-kanban__card-tags">
                {#each item.tags as tag}
                  <span class="cy-kanban__tag">{tag}</span>
                {/each}
              </div>
            {/if}
            {#if item.assignee}
              <div class="cy-kanban__card-assignee">{item.assignee}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .cy-kanban {
    --cy-bg: var(--kanban-bg, #0a0a0f);
    --cy-bg-card: var(--kanban-card-bg, #12121a);
    --cy-bg-column: var(--kanban-column-bg, #0e0e16);
    --cy-neon-green: var(--kanban-accent, #00ff41);
    --cy-cyan: var(--kanban-cyan, #00d4ff);
    --cy-border: var(--kanban-border, #1e1e2e);
    --cy-text: var(--kanban-text, #e0e0e0);
    --cy-text-dim: var(--kanban-text-dim, #8888a0);

    display: flex;
    gap: 16px;
    padding: 16px;
    overflow-x: auto;
    background: var(--cy-bg);
    border-radius: 12px;
    font-family: var(--font-body, "Inter", system-ui, sans-serif);
    min-height: 400px;
  }

  .cy-kanban__column {
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;
    background: var(--cy-bg-column);
    border: 1px solid var(--cy-border);
    border-radius: 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    max-height: 600px;
  }

  .cy-kanban__column--dragover {
    border-color: var(--cy-neon-green);
    box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.05), 0 0 12px rgba(0, 255, 65, 0.1);
  }

  .cy-kanban__column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 2px solid var(--col-accent);
  }

  .cy-kanban__column-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--cy-text);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cy-kanban__column-count {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--cy-bg);
    background: var(--col-accent);
    padding: 2px 8px;
    border-radius: 10px;
    min-width: 20px;
    text-align: center;
  }

  .cy-kanban__column-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cy-kanban__card {
    background: var(--cy-bg-card);
    border: 1px solid var(--cy-border);
    border-left: 3px solid var(--priority-color);
    border-radius: 8px;
    padding: 12px;
    cursor: grab;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }

  .cy-kanban__card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .cy-kanban__card--dragging {
    opacity: 0.4;
  }

  .cy-kanban__card:active {
    cursor: grabbing;
  }

  .cy-kanban__card-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--cy-text);
    margin-bottom: 4px;
  }

  .cy-kanban__card-desc {
    font-size: 0.75rem;
    color: var(--cy-text-dim);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .cy-kanban__card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 6px;
  }

  .cy-kanban__tag {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--cy-cyan);
    background: rgba(0, 212, 255, 0.1);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 4px;
    padding: 2px 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .cy-kanban__card-assignee {
    font-size: 0.7rem;
    color: var(--cy-text-dim);
  }
</style>
