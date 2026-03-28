<svelte:options runes={true} />

<script lang="ts">
  import { tick } from "svelte";

  type FilterOption = { value: string; label: string };

  type Filter = {
    id: string;
    label: string;
    type: "select" | "multiselect" | "date" | "text" | "boolean";
    options?: FilterOption[];
    value?: any;
  };

  let {
    filters = [],
    activeFilters = $bindable({}),
    onchange,
    onclear,
    showClearAll = true,
    compact = false,
  }: {
    filters?: Filter[];
    activeFilters?: Record<string, any>;
    onchange?: (filters: Record<string, any>) => void;
    onclear?: () => void;
    showClearAll?: boolean;
    compact?: boolean;
  } = $props();

  let openFilterId = $state<string | null>(null);
  let textInputValues = $state<Record<string, string>>({});
  let dateValues = $state<Record<string, { from: string; to: string }>>({});

  let activeCount = $derived(Object.keys(activeFilters).length);

  function toggleDropdown(filterId: string) {
    openFilterId = openFilterId === filterId ? null : filterId;
  }

  function closeDropdown() {
    openFilterId = null;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".cy-filter-bar__filter")) {
      closeDropdown();
    }
  }

  function selectOption(filterId: string, optionValue: string) {
    activeFilters = { ...activeFilters, [filterId]: optionValue };
    onchange?.(activeFilters);
    closeDropdown();
  }

  function toggleMultiOption(filterId: string, optionValue: string) {
    const current: string[] = activeFilters[filterId] ?? [];
    const updated = current.includes(optionValue)
      ? current.filter((v: string) => v !== optionValue)
      : [...current, optionValue];
    if (updated.length === 0) {
      const { [filterId]: _, ...rest } = activeFilters;
      activeFilters = rest;
    } else {
      activeFilters = { ...activeFilters, [filterId]: updated };
    }
    onchange?.(activeFilters);
  }

  function toggleBoolean(filterId: string) {
    if (activeFilters[filterId]) {
      const { [filterId]: _, ...rest } = activeFilters;
      activeFilters = rest;
    } else {
      activeFilters = { ...activeFilters, [filterId]: true };
    }
    onchange?.(activeFilters);
    closeDropdown();
  }

  function applyText(filterId: string) {
    const val = textInputValues[filterId]?.trim();
    if (val) {
      activeFilters = { ...activeFilters, [filterId]: val };
    } else {
      const { [filterId]: _, ...rest } = activeFilters;
      activeFilters = rest;
    }
    onchange?.(activeFilters);
    closeDropdown();
  }

  function applyDate(filterId: string) {
    const val = dateValues[filterId];
    if (val?.from || val?.to) {
      activeFilters = { ...activeFilters, [filterId]: { from: val.from || "", to: val.to || "" } };
    } else {
      const { [filterId]: _, ...rest } = activeFilters;
      activeFilters = rest;
    }
    onchange?.(activeFilters);
    closeDropdown();
  }

  function removeFilter(filterId: string) {
    const { [filterId]: _, ...rest } = activeFilters;
    activeFilters = rest;
    onchange?.(activeFilters);
  }

  function clearAll() {
    activeFilters = {};
    textInputValues = {};
    dateValues = {};
    onclear?.();
    onchange?.({});
  }

  function getDisplayValue(filter: Filter): string {
    const val = activeFilters[filter.id];
    if (val === undefined || val === null) return "";
    if (filter.type === "select") {
      return filter.options?.find((o) => o.value === val)?.label ?? String(val);
    }
    if (filter.type === "multiselect") {
      const arr = val as string[];
      if (arr.length === 1) {
        return filter.options?.find((o) => o.value === arr[0])?.label ?? arr[0];
      }
      return `${arr.length} selected`;
    }
    if (filter.type === "date") {
      const d = val as { from: string; to: string };
      if (d.from && d.to) return `${d.from} - ${d.to}`;
      if (d.from) return `From ${d.from}`;
      if (d.to) return `To ${d.to}`;
      return "";
    }
    if (filter.type === "boolean") return val ? "Yes" : "";
    return String(val);
  }

  function handleKeydown(event: KeyboardEvent, filterId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown(filterId);
    } else if (event.key === "Escape") {
      closeDropdown();
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div
  class="cy-filter-bar"
  class:cy-filter-bar--compact={compact}
  role="toolbar"
  aria-label="Filters"
>
  {#each filters as filter (filter.id)}
    {@const isActive = activeFilters[filter.id] !== undefined}
    {@const isOpen = openFilterId === filter.id}

    <div class="cy-filter-bar__filter">
      {#if isActive}
        <button
          type="button"
          class="cy-filter-bar__chip cy-filter-bar__chip--active"
          onclick={() => toggleDropdown(filter.id)}
          onkeydown={(e) => handleKeydown(e, filter.id)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span class="cy-filter-bar__chip-label">{filter.label}:</span>
          <span class="cy-filter-bar__chip-value">{getDisplayValue(filter)}</span>
          <span
            role="button"
            tabindex="-1"
            class="cy-filter-bar__chip-remove"
            onclick={(e) => { e.stopPropagation(); removeFilter(filter.id); }}
            onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); removeFilter(filter.id); } }}
            aria-label="Remove {filter.label} filter"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
        </button>
      {:else}
        <button
          type="button"
          class="cy-filter-bar__chip"
          onclick={() => toggleDropdown(filter.id)}
          onkeydown={(e) => handleKeydown(e, filter.id)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span class="cy-filter-bar__chip-label">{filter.label}</span>
          <svg class="cy-filter-bar__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      {/if}

      {#if isOpen}
        <div class="cy-filter-bar__dropdown" role="listbox" aria-label="{filter.label} options">
          {#if filter.type === "select"}
            {#each filter.options ?? [] as option (option.value)}
              <button
                type="button"
                class="cy-filter-bar__option"
                class:cy-filter-bar__option--selected={activeFilters[filter.id] === option.value}
                onclick={() => selectOption(filter.id, option.value)}
                role="option"
                aria-selected={activeFilters[filter.id] === option.value}
              >
                {option.label}
              </button>
            {/each}

          {:else if filter.type === "multiselect"}
            {#each filter.options ?? [] as option (option.value)}
              {@const checked = (activeFilters[filter.id] ?? []).includes(option.value)}
              <label class="cy-filter-bar__option cy-filter-bar__option--checkbox">
                <input
                  type="checkbox"
                  {checked}
                  onchange={() => toggleMultiOption(filter.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            {/each}

          {:else if filter.type === "date"}
            <div class="cy-filter-bar__date-range">
              <label class="cy-filter-bar__date-field">
                <span>From</span>
                <input
                  type="date"
                  value={dateValues[filter.id]?.from ?? ""}
                  oninput={(e) => {
                    dateValues[filter.id] = { ...dateValues[filter.id], from: e.currentTarget.value, to: dateValues[filter.id]?.to ?? "" };
                  }}
                />
              </label>
              <label class="cy-filter-bar__date-field">
                <span>To</span>
                <input
                  type="date"
                  value={dateValues[filter.id]?.to ?? ""}
                  oninput={(e) => {
                    dateValues[filter.id] = { ...dateValues[filter.id], to: e.currentTarget.value, from: dateValues[filter.id]?.from ?? "" };
                  }}
                />
              </label>
              <button
                type="button"
                class="cy-filter-bar__apply-btn"
                onclick={() => applyDate(filter.id)}
              >Apply</button>
            </div>

          {:else if filter.type === "text"}
            <div class="cy-filter-bar__text-input">
              <input
                type="text"
                placeholder="Type to filter..."
                value={textInputValues[filter.id] ?? ""}
                oninput={(e) => { textInputValues[filter.id] = e.currentTarget.value; }}
                onkeydown={(e) => { if (e.key === "Enter") applyText(filter.id); }}
              />
              <button
                type="button"
                class="cy-filter-bar__apply-btn"
                onclick={() => applyText(filter.id)}
              >Apply</button>
            </div>

          {:else if filter.type === "boolean"}
            <button
              type="button"
              class="cy-filter-bar__option"
              class:cy-filter-bar__option--selected={activeFilters[filter.id]}
              onclick={() => toggleBoolean(filter.id)}
            >
              {activeFilters[filter.id] ? "Enabled (click to disable)" : "Enable"}
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/each}

  {#if showClearAll && activeCount > 0}
    <button
      type="button"
      class="cy-filter-bar__clear"
      onclick={clearAll}
    >
      Clear all
      <span class="cy-filter-bar__badge">{activeCount}</span>
    </button>
  {/if}
</div>

<style>
  .cy-filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
  }

  .cy-filter-bar__filter {
    position: relative;
  }

  .cy-filter-bar__chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all var(--transition-default);
    white-space: nowrap;
  }

  .cy-filter-bar__chip:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-border-emphasis);
    color: var(--color-text-primary);
  }

  .cy-filter-bar__chip--active {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
  }

  .cy-filter-bar__chip--active:hover {
    background: var(--color-action-brand-hover);
    border-color: var(--color-action-brand-hover);
    color: var(--color-text-on-brand);
  }

  .cy-filter-bar__chip-label {
    font-weight: var(--font-weight-medium);
  }

  .cy-filter-bar__chip-value {
    font-weight: var(--font-weight-normal);
  }

  .cy-filter-bar__chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    border-radius: var(--radius-full);
    color: currentColor;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity var(--transition-default);
  }

  .cy-filter-bar__chip-remove:hover {
    opacity: 1;
  }

  .cy-filter-bar__chevron {
    opacity: 0.6;
  }

  .cy-filter-bar__dropdown {
    position: absolute;
    top: calc(100% + var(--space-1));
    left: 0;
    z-index: 50;
    min-width: 180px;
    max-height: 280px;
    overflow-y: auto;
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: var(--space-1);
  }

  .cy-filter-bar__option {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-default);
  }

  .cy-filter-bar__option:hover {
    background: var(--color-surface-hover);
  }

  .cy-filter-bar__option--selected {
    background: var(--color-surface-hover);
    color: var(--color-action-brand-default);
    font-weight: var(--font-weight-medium);
  }

  .cy-filter-bar__option--checkbox {
    cursor: pointer;
  }

  .cy-filter-bar__option--checkbox input[type="checkbox"] {
    accent-color: var(--color-action-brand-default);
  }

  .cy-filter-bar__date-range {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .cy-filter-bar__date-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  .cy-filter-bar__date-field input {
    padding: var(--space-2);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
  }

  .cy-filter-bar__text-input {
    display: flex;
    gap: var(--space-2);
    padding: var(--space-2);
  }

  .cy-filter-bar__text-input input {
    flex: 1;
    padding: var(--space-2);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-sm);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
  }

  .cy-filter-bar__text-input input::placeholder {
    color: var(--color-text-muted);
  }

  .cy-filter-bar__apply-btn {
    padding: var(--space-2) var(--space-3);
    background: var(--color-action-brand-default);
    color: var(--color-text-on-brand);
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: background var(--transition-default);
  }

  .cy-filter-bar__apply-btn:hover {
    background: var(--color-action-brand-hover);
  }

  .cy-filter-bar__clear {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-state-error);
    background: none;
    border: 1px solid var(--color-state-error);
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all var(--transition-default);
    white-space: nowrap;
  }

  .cy-filter-bar__clear:hover {
    background: var(--color-state-error-bg);
  }

  .cy-filter-bar__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 var(--space-1);
    font-size: 0.6875rem;
    font-family: var(--font-mono);
    background: var(--color-state-error);
    color: var(--color-text-on-brand);
    border-radius: var(--radius-full);
  }

  /* Compact mode */
  .cy-filter-bar--compact {
    padding: var(--space-2);
    gap: var(--space-1);
  }

  .cy-filter-bar--compact .cy-filter-bar__chip {
    padding: var(--space-1) var(--space-2);
    font-size: 0.75rem;
  }

  .cy-filter-bar--compact .cy-filter-bar__clear {
    padding: var(--space-1) var(--space-2);
    font-size: 0.75rem;
  }
</style>
