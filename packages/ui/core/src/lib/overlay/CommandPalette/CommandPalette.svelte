<svelte:options runes={true} />

<script lang="ts">
  let {
    open = $bindable(false),
    commands = [],
    placeholder = "Type a command...",
  }: {
    open: boolean;
    commands: Array<{
      id: string;
      label: string;
      group?: string;
      icon?: string;
      shortcut?: string;
      onselect: () => void;
    }>;
    placeholder?: string;
  } = $props();

  let query = $state("");
  let focusedIndex = $state(0);
  let inputEl: HTMLInputElement | undefined = $state();

  let filteredCommands = $derived(
    query.trim()
      ? commands.filter((c) =>
          c.label.toLowerCase().includes(query.toLowerCase())
        )
      : commands
  );

  let groupedCommands = $derived.by(() => {
    const groups: Map<string, typeof filteredCommands> = new Map();
    for (const cmd of filteredCommands) {
      const group = cmd.group || "";
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(cmd);
    }
    return groups;
  });

  let flatList = $derived(filteredCommands);

  function close() {
    open = false;
    query = "";
    focusedIndex = 0;
  }

  function selectCommand(cmd: (typeof commands)[0]) {
    cmd.onselect();
    close();
  }

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % Math.max(flatList.length, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + flatList.length) % Math.max(flatList.length, 1);
        break;
      case "Enter":
        e.preventDefault();
        if (flatList[focusedIndex]) {
          selectCommand(flatList[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  // Reset focus when query changes
  $effect(() => {
    query;
    focusedIndex = 0;
  });

  // Focus input when opened
  $effect(() => {
    if (open && inputEl) {
      inputEl.focus();
    }
  });

  // Global Cmd+K listener
  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      open = !open;
      if (!open) {
        query = "";
        focusedIndex = 0;
      }
    }
  }

  $effect(() => {
    document.addEventListener("keydown", handleGlobalKeydown);
    return () => document.removeEventListener("keydown", handleGlobalKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="cy-cmd-overlay" role="dialog" aria-modal="true" aria-label="Command palette" tabindex="-1" onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="cy-cmd">
      <div class="cy-cmd__header">
        <svg class="cy-cmd__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          class="cy-cmd__input"
          type="text"
          bind:value={query}
          bind:this={inputEl}
          {placeholder}
          aria-label="Search commands"
        />
        <kbd class="cy-cmd__kbd">ESC</kbd>
      </div>

      <div class="cy-cmd__list" role="listbox">
        {#if flatList.length === 0}
          <div class="cy-cmd__empty">No commands found.</div>
        {:else}
          {#each groupedCommands as [group, items]}
            {#if group}
              <div class="cy-cmd__group">{group}</div>
            {/if}
            {#each items as cmd (cmd.id)}
              {@const idx = flatList.indexOf(cmd)}
              <button
                class="cy-cmd__item"
                class:cy-cmd__item--focused={idx === focusedIndex}
                role="option"
                aria-selected={idx === focusedIndex}
                onclick={() => selectCommand(cmd)}
                onmouseenter={() => (focusedIndex = idx)}
              >
                {#if cmd.icon}
                  <span class="cy-cmd__item-icon">{cmd.icon}</span>
                {/if}
                <span class="cy-cmd__item-label">{cmd.label}</span>
                {#if cmd.shortcut}
                  <kbd class="cy-cmd__item-shortcut">{cmd.shortcut}</kbd>
                {/if}
              </button>
            {/each}
          {/each}
        {/if}
      </div>

      <div class="cy-cmd__footer">
        <span class="cy-cmd__hint">
          <kbd>↑↓</kbd> navigate
          <kbd>↵</kbd> select
          <kbd>esc</kbd> close
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .cy-cmd-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 20vh;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(8px);
    z-index: 9999;
    animation: cy-cmd-overlay-in 100ms ease;
  }

  .cy-cmd {
    width: 100%;
    max-width: 560px;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg), var(--shadow-glow-green);
    overflow: hidden;
    animation: cy-cmd-in 150ms ease;
  }

  .cy-cmd__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-cmd__search-icon {
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-cmd__input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-family: var(--font-mono);
    font-size: 0.9375rem;
    color: var(--color-text-primary);
    caret-color: var(--color-action-brand-default);
  }

  .cy-cmd__input::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-cmd__kbd {
    padding: 0.125rem 0.375rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-cmd__list {
    max-height: 320px;
    overflow-y: auto;
    padding: var(--space-2);
  }

  .cy-cmd__empty {
    padding: var(--space-6) var(--space-4);
    text-align: center;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
  }

  .cy-cmd__group {
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cy-cmd__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
  }

  .cy-cmd__item--focused {
    background: var(--color-surface-hover);
    color: var(--color-action-brand-default);
  }

  .cy-cmd__item-icon {
    font-size: 1rem;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .cy-cmd__item-label {
    flex: 1;
  }

  .cy-cmd__item-shortcut {
    padding: 0.125rem 0.375rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-cmd__footer {
    padding: var(--space-2) var(--space-4);
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-cmd__hint {
    display: flex;
    gap: var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
  }

  .cy-cmd__hint kbd {
    padding: 0 0.25rem;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-subtle);
    border-radius: 2px;
    font-family: var(--font-mono);
    font-size: 0.625rem;
  }

  @keyframes cy-cmd-overlay-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes cy-cmd-in {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
