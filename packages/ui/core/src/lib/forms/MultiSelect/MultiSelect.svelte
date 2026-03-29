<svelte:options runes={true} />

<script lang="ts">
  type Option = { value: string; label: string; group?: string };

  let {
    options = [],
    selected = $bindable([]),
    label = "",
    placeholder = "Select items...",
    searchable = true,
    disabled = false,
    error = "",
    maxItems = 0,
  }: {
    options?: Option[];
    selected?: string[];
    label?: string;
    placeholder?: string;
    searchable?: boolean;
    disabled?: boolean;
    error?: string;
    maxItems?: number;
  } = $props();

  let open = $state(false);
  let search = $state("");
  let highlightIndex = $state(-1);
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let searchInputEl: HTMLInputElement | undefined = $state(undefined);

  let inputId = `cy-ms-${Math.random().toString(36).slice(2, 9)}`;

  let filteredOptions = $derived.by(() => {
    const s = search.toLowerCase();
    return options.filter((o) => !s || o.label.toLowerCase().includes(s));
  });

  let groups = $derived.by(() => {
    const map = new Map<string, Option[]>();
    for (const opt of filteredOptions) {
      const g = opt.group || "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    }
    return map;
  });

  let flatFiltered = $derived(filteredOptions);

  let atLimit = $derived(maxItems > 0 && selected.length >= maxItems);

  function toggle(value: string) {
    if (selected.includes(value)) {
      selected = selected.filter((v) => v !== value);
    } else {
      if (atLimit) return;
      selected = [...selected, value];
    }
  }

  function removeTag(value: string) {
    selected = selected.filter((v) => v !== value);
  }

  function getLabel(value: string): string {
    return options.find((o) => o.value === value)?.label ?? value;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        open = true;
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, flatFiltered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      toggle(flatFiltered[highlightIndex].value);
    } else if (e.key === "Backspace" && search === "" && selected.length > 0) {
      selected = selected.slice(0, -1);
    } else if (e.key === "Escape") {
      open = false;
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      open = false;
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputEl?.focus(), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  });

  $effect(() => {
    search;
    highlightIndex = -1;
  });
</script>

<div class="cy-ms" class:cy-ms--error={!!error} class:cy-ms--disabled={disabled} bind:this={containerEl}>
  {#if label}
    <label class="cy-ms__label" for={inputId}>
      {label}
      {#if selected.length > 0}
        <span class="cy-ms__count">{selected.length}</span>
      {/if}
    </label>
  {/if}

  <div
    class="cy-ms__control"
    class:cy-ms__control--open={open}
    role="combobox"
    aria-controls="listbox-id"
    aria-expanded={open}
    aria-haspopup="listbox"
    tabindex="0"
    onclick={() => { if (!disabled) { open = true; } }}
    onkeydown={handleKeydown}
  >
    <div class="cy-ms__tags">
      {#each selected as val}
        <span class="cy-ms__tag">
          {getLabel(val)}
          <button class="cy-ms__tag-remove" type="button" onclick={(e) => { e.stopPropagation(); removeTag(val); }} aria-label="Remove {getLabel(val)}">&times;</button>
        </span>
      {/each}
      {#if searchable}
        <input
          class="cy-ms__search"
          id={inputId}
          type="text"
          bind:value={search}
          bind:this={searchInputEl}
          {placeholder}
          {disabled}
          autocomplete="off"
        />
      {:else if selected.length === 0}
        <span class="cy-ms__placeholder">{placeholder}</span>
      {/if}
    </div>
  </div>

  {#if open}
    <div class="cy-ms__dropdown" role="listbox">
      {#if atLimit}
        <div class="cy-ms__limit-warn">Maximum {maxItems} items selected</div>
      {/if}
      {#each [...groups.entries()] as [groupName, groupOpts]}
        {#if groupName}
          <div class="cy-ms__group-header">{groupName}</div>
        {/if}
        {#each groupOpts as opt}
          {@const isSelected = selected.includes(opt.value)}
          {@const idx = flatFiltered.indexOf(opt)}
          <button
            class="cy-ms__option"
            class:cy-ms__option--selected={isSelected}
            class:cy-ms__option--highlighted={idx === highlightIndex}
            class:cy-ms__option--disabled={atLimit && !isSelected}
            type="button"
            role="option"
            aria-selected={isSelected}
            onclick={() => toggle(opt.value)}
            onmouseenter={() => { highlightIndex = idx; }}
          >
            <span class="cy-ms__checkbox" class:cy-ms__checkbox--checked={isSelected}>
              {#if isSelected}&#10003;{/if}
            </span>
            {opt.label}
          </button>
        {/each}
      {/each}
      {#if filteredOptions.length === 0}
        <div class="cy-ms__empty">No options found</div>
      {/if}
    </div>
  {/if}

  {#if error}
    <p class="cy-ms__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-ms {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-ms__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .cy-ms__count {
    font-size: 0.6875rem;
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    border-radius: 9999px;
    padding: 0 6px;
    font-weight: var(--font-weight-bold);
    line-height: 1.6;
  }

  .cy-ms__control {
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-2);
    min-height: 40px;
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-ms__control:hover:not(.cy-ms--disabled .cy-ms__control) {
    background: var(--input-bg-hover);
  }

  .cy-ms__control--open {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-ms--error .cy-ms__control {
    border-color: var(--input-border-error);
  }

  .cy-ms--disabled .cy-ms__control {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-ms__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    align-items: center;
  }

  .cy-ms__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    border: 1px solid var(--color-action-brand-border);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    line-height: 1.6;
  }

  .cy-ms__tag-remove {
    background: transparent;
    border: none;
    color: var(--color-action-brand-default);
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1;
    padding: 0;
    opacity: 0.7;
  }

  .cy-ms__tag-remove:hover {
    opacity: 1;
  }

  .cy-ms__search {
    border: none;
    background: transparent;
    color: var(--input-text);
    font-family: var(--font-body);
    font-size: 0.875rem;
    outline: none;
    min-width: 80px;
    flex: 1;
    padding: 2px 0;
  }

  .cy-ms__search::placeholder {
    color: var(--input-placeholder);
  }

  .cy-ms__placeholder {
    color: var(--input-placeholder);
    font-family: var(--font-body);
    font-size: 0.875rem;
  }

  .cy-ms__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: var(--space-1);
    background: var(--color-bg-elevated);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    max-height: 240px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .cy-ms__group-header {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: var(--space-2) var(--space-3) var(--space-1);
  }

  .cy-ms__option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-default);
  }

  .cy-ms__option:hover,
  .cy-ms__option--highlighted {
    background: var(--color-action-secondary-bg);
    color: var(--color-text-primary);
  }

  .cy-ms__option--selected {
    color: var(--color-action-brand-default);
  }

  .cy-ms__option--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .cy-ms__checkbox {
    width: 16px;
    height: 16px;
    border: 1px solid var(--input-border);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    color: var(--color-bg-primary);
    flex-shrink: 0;
    transition: all var(--transition-default);
  }

  .cy-ms__checkbox--checked {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
  }

  .cy-ms__empty {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    padding: var(--space-3);
    text-align: center;
  }

  .cy-ms__limit-warn {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-state-warning);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--input-border);
  }

  .cy-ms__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
