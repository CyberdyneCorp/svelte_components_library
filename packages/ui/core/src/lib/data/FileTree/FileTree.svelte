<svelte:options runes={true} />

<script module lang="ts">
  export type FileTreeItem = {
    name: string;
    type: "file" | "folder";
    children?: FileTreeItem[];
    icon?: string;
    expanded?: boolean;
  };
</script>

<script lang="ts">
  import FileTree from './FileTree.svelte';

  let {
    items = [],
    selectedPath = $bindable(""),
    onselect,
    _depth = 0,
    _parentPath = "",
  }: {
    items?: FileTreeItem[];
    selectedPath?: string;
    onselect?: (path: string) => void;
    _depth?: number;
    _parentPath?: string;
  } = $props();

  let expandedState = $state<Record<string, boolean>>({});

  function getPath(item: FileTreeItem): string {
    return _parentPath ? `${_parentPath}/${item.name}` : item.name;
  }

  function isExpanded(item: FileTreeItem): boolean {
    const path = getPath(item);
    return expandedState[path] ?? item.expanded ?? false;
  }

  function toggleFolder(item: FileTreeItem) {
    const path = getPath(item);
    expandedState[path] = !isExpanded(item);
  }

  function selectItem(item: FileTreeItem) {
    const path = getPath(item);
    if (item.type === "folder") {
      toggleFolder(item);
    }
    selectedPath = path;
    onselect?.(path);
  }

  function getFileColor(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    switch (ext) {
      case "ts":
      case "js":
        return "var(--color-action-secondary-default)";
      case "svelte":
        return "#ff6e40";
      case "css":
      case "scss":
        return "var(--color-action-tertiary-default)";
      case "md":
        return "var(--color-action-brand-default)";
      default:
        return "var(--color-text-tertiary)";
    }
  }
</script>

<ul class="cy-file-tree__list" class:cy-file-tree={_depth === 0} role={_depth === 0 ? "tree" : "group"} style:--depth={_depth}>
  {#each items as item}
    {@const path = getPath(item)}
    {@const expanded = isExpanded(item)}
    <li class="cy-file-tree__item" role="treeitem" aria-selected={selectedPath === path} aria-expanded={item.type === "folder" ? expanded : undefined}>
      <button
        class="cy-file-tree__row"
        class:cy-file-tree__row--selected={selectedPath === path}
        style:padding-left="{_depth * 16 + 8}px"
        onclick={() => selectItem(item)}
      >
        {#if _depth > 0}
          <span class="cy-file-tree__guide" style:left="{(_depth * 16) - 4}px"></span>
        {/if}

        {#if item.type === "folder"}
          <span class="cy-file-tree__chevron" class:cy-file-tree__chevron--open={expanded}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M2 1l4 3-4 3z"/></svg>
          </span>
          <span class="cy-file-tree__icon cy-file-tree__icon--folder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
              {#if expanded}
                <path d="M2 4a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2H4a2 2 0 0 0-2 2v6c0 .6.4 1 1 1h17a1 1 0 0 0 1-1l1-9H4l-2 1z"/>
              {:else}
                <path d="M2 4a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z"/>
              {/if}
            </svg>
          </span>
        {:else}
          <span class="cy-file-tree__chevron cy-file-tree__chevron--spacer"></span>
          <span class="cy-file-tree__icon" style:color={getFileColor(item.name)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </span>
        {/if}

        <span class="cy-file-tree__name">{item.name}</span>
      </button>

      {#if item.type === "folder" && expanded && item.children}
        <FileTree
          items={item.children}
          bind:selectedPath
          {onselect}
          _depth={_depth + 1}
          _parentPath={path}
        />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cy-file-tree {
    font-family: var(--font-mono, "JetBrains Mono", "Fira Code", monospace);
    font-size: 0.8125rem;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    padding: 0.5rem 0;
    min-width: 240px;
    overflow: auto;
  }

  .cy-file-tree__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .cy-file-tree__item {
    position: relative;
  }

  .cy-file-tree__row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    width: 100%;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    padding-right: 1rem;
    font-family: inherit;
    font-size: inherit;
    text-align: left;
    position: relative;
    transition: background 0.15s ease;
    outline: none;
  }

  .cy-file-tree__row:hover {
    background: var(--color-surface-hover);
  }

  .cy-file-tree__row--selected {
    background: var(--color-state-success-bg);
  }

  .cy-file-tree__row--selected:hover {
    background: var(--color-state-success-bg);
  }

  .cy-file-tree__row:focus-visible {
    outline: 1px solid var(--color-action-brand-default);
    outline-offset: -1px;
  }

  .cy-file-tree__guide {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--color-border-subtle);
  }

  .cy-file-tree__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 0.5rem;
    color: var(--color-text-secondary);
    transition: transform 0.15s ease;
    flex-shrink: 0;
  }

  .cy-file-tree__chevron--open {
    transform: rotate(90deg);
  }

  .cy-file-tree__chevron--spacer {
    visibility: hidden;
  }

  .cy-file-tree__icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .cy-file-tree__icon--folder {
    color: var(--color-state-warning);
  }

  .cy-file-tree__name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
