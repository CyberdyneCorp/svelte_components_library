<svelte:options runes={true} />

<script lang="ts">
  let {
    tags = $bindable([]),
    label = "",
    placeholder = "Add tag...",
    maxTags = 0,
    suggestions = [],
    disabled = false,
    error = "",
    allowCustom = true,
  }: {
    tags?: string[];
    label?: string;
    placeholder?: string;
    maxTags?: number;
    suggestions?: string[];
    disabled?: boolean;
    error?: string;
    allowCustom?: boolean;
  } = $props();

  let input = $state("");
  let showSuggestions = $state(false);
  let highlightIndex = $state(-1);
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let inputEl: HTMLInputElement | undefined = $state(undefined);

  let inputId = `cy-ti-${Math.random().toString(36).slice(2, 9)}`;

  let atLimit = $derived(maxTags > 0 && tags.length >= maxTags);

  let filteredSuggestions = $derived.by(() => {
    if (!input.trim()) return [];
    const s = input.toLowerCase().trim();
    return suggestions.filter(
      (sug) => sug.toLowerCase().includes(s) && !tags.includes(sug)
    );
  });

  function addTag(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    if (atLimit) return;
    if (!allowCustom && !suggestions.includes(trimmed)) return;
    tags = [...tags, trimmed];
    input = "";
    showSuggestions = false;
    highlightIndex = -1;
  }

  function removeTag(idx: number) {
    tags = tags.filter((_, i) => i !== idx);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (highlightIndex >= 0 && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[highlightIndex]);
      } else {
        addTag(input);
      }
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      tags = tags.slice(0, -1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        showSuggestions = true;
        highlightIndex = Math.min(highlightIndex + 1, filteredSuggestions.length - 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, -1);
    } else if (e.key === "Escape") {
      showSuggestions = false;
      highlightIndex = -1;
    }
  }

  function handleInput() {
    showSuggestions = filteredSuggestions.length > 0;
    highlightIndex = -1;
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) {
      showSuggestions = false;
    }
  }

  $effect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });
</script>

<div class="cy-ti" class:cy-ti--error={!!error} class:cy-ti--disabled={disabled} bind:this={containerEl}>
  {#if label}
    <label class="cy-ti__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-ti__control" onclick={() => inputEl?.focus()}>
    <div class="cy-ti__tags">
      {#each tags as tag, i}
        <span class="cy-ti__tag">
          {tag}
          <button class="cy-ti__tag-remove" type="button" onclick={() => removeTag(i)} aria-label="Remove {tag}" {disabled}>&times;</button>
        </span>
      {/each}
      <input
        class="cy-ti__input"
        id={inputId}
        type="text"
        bind:value={input}
        bind:this={inputEl}
        placeholder={tags.length === 0 ? placeholder : ""}
        {disabled}
        onkeydown={handleKeydown}
        oninput={handleInput}
        onfocus={() => { if (filteredSuggestions.length > 0) showSuggestions = true; }}
        autocomplete="off"
      />
    </div>
    {#if maxTags > 0}
      <span class="cy-ti__counter">{tags.length}/{maxTags}</span>
    {/if}
  </div>

  {#if showSuggestions && filteredSuggestions.length > 0}
    <div class="cy-ti__suggestions">
      {#each filteredSuggestions as sug, i}
        <button
          class="cy-ti__suggestion"
          class:cy-ti__suggestion--highlighted={i === highlightIndex}
          type="button"
          onclick={() => addTag(sug)}
          onmouseenter={() => { highlightIndex = i; }}
        >
          {sug}
        </button>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="cy-ti__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-ti {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-ti__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-ti__control {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-1) var(--space-2);
    min-height: 40px;
    cursor: text;
    transition: all var(--transition-default);
  }

  .cy-ti__control:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-ti--error .cy-ti__control {
    border-color: var(--input-border-error);
  }

  .cy-ti--disabled .cy-ti__control {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-ti__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    align-items: center;
  }

  .cy-ti__tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    border: 1px solid var(--color-action-brand-border);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    line-height: 1.5;
  }

  .cy-ti__tag-remove {
    background: transparent;
    border: none;
    color: var(--color-action-brand-default);
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1;
    padding: 0;
    opacity: 0.7;
  }

  .cy-ti__tag-remove:hover {
    opacity: 1;
  }

  .cy-ti__input {
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

  .cy-ti__input::placeholder {
    color: var(--input-placeholder);
  }

  .cy-ti__counter {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    flex-shrink: 0;
  }

  .cy-ti__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: var(--space-1);
    background: var(--color-bg-elevated);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    max-height: 180px;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .cy-ti__suggestion {
    display: block;
    width: 100%;
    text-align: left;
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-ti__suggestion:hover,
  .cy-ti__suggestion--highlighted {
    background: var(--color-action-secondary-bg);
    color: var(--color-text-primary);
  }

  .cy-ti__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
