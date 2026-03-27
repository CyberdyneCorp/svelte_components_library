<svelte:options runes={true} />

<script lang="ts">
  type FileTreeItem = {
    name: string;
    type: "file" | "folder";
    children?: FileTreeItem[];
    icon?: string;
    expanded?: boolean;
  };

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
        return "#00d4ff";
      case "svelte":
        return "#ff6e40";
      case "css":
      case "scss":
        return "#b48eff";
      case "md":
        return "#00ff41";
      default:
        return "rgba(255, 255, 255, 0.5)";
    }
  }
</script>

<ul class="cy-file-tree__list" class:cy-file-tree={_depth === 0} role={_depth === 0 ? "tree" : "group"} style:--depth={_depth}>
  {#each items as item}
    {@const path = getPath(item)}
    {@const expanded = isExpanded(item)}
    <li class="cy-file-tree__item" role="treeitem" aria-expanded={item.type === "folder" ? expanded : undefined}>
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
            &#9654;
          </span>
          <span class="cy-file-tree__icon">
            {#if item.icon}
              {item.icon}
            {:else if expanded}
              &#128194;
            {:else}
              &#128193;
            {/if}
          </span>
        {:else}
          <span class="cy-file-tree__chevron cy-file-tree__chevron--spacer"></span>
          <span class="cy-file-tree__icon" style:color={getFileColor(item.name)}>
            {item.icon || "&#128196;"}
          </span>
        {/if}

        <span class="cy-file-tree__name">{item.name}</span>
      </button>

      {#if item.type === "folder" && expanded && item.children}
        <svelte:self
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
    background: var(--color-surface-base, #0a0a0f);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
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
    color: var(--color-text-primary, rgba(255, 255, 255, 0.85));
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
    background: rgba(255, 255, 255, 0.04);
  }

  .cy-file-tree__row--selected {
    background: rgba(0, 255, 65, 0.08);
  }

  .cy-file-tree__row--selected:hover {
    background: rgba(0, 255, 65, 0.12);
  }

  .cy-file-tree__row:focus-visible {
    outline: 1px solid var(--color-border-focus, #00ff41);
    outline-offset: -1px;
  }

  .cy-file-tree__guide {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--color-border-default, rgba(255, 255, 255, 0.06));
  }

  .cy-file-tree__chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    font-size: 0.5rem;
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.4));
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
    font-size: 0.875rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .cy-file-tree__name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
