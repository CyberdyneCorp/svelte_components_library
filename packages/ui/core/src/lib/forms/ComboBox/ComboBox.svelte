<svelte:options runes={true} />

<script lang="ts">
  type Option = { value: string; label: string; description?: string };

  let {
    value = $bindable(""),
    options = [],
    label = "",
    placeholder = "",
    allowCustom = true,
    disabled = false,
    error = "",
    loading = false,
  }: {
    value?: string;
    options?: Option[];
    label?: string;
    placeholder?: string;
    allowCustom?: boolean;
    disabled?: boolean;
    error?: string;
    loading?: boolean;
  } = $props();

  let open = $state(false);
  let search = $state("");
  let highlightIndex = $state(-1);
  let containerEl: HTMLDivElement | undefined = $state(undefined);
  let inputEl: HTMLInputElement | undefined = $state(undefined);
  let userTyping = $state(false);

  let inputId = `cy-cb-${Math.random().toString(36).slice(2, 9)}`;

  let displayValue = $derived.by(() => {
    if (userTyping) return search;
    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : value;
  });

  let filtered = $derived.by(() => {
    if (!search.trim()) return options;
    const s = search.toLowerCase();
    return options.filter((o) => {
      const label = o.label.toLowerCase();
      let si = 0;
      for (let ci = 0; ci < label.length && si < s.length; ci++) {
        if (label[ci] === s[si]) si++;
      }
      return si === s.length;
    });
  });

  function highlightMatch(text: string): string {
    if (!search.trim()) return text;
    const s = search.toLowerCase();
    const t = text.toLowerCase();
    let result = "";
    let si = 0;
    for (let i = 0; i < text.length; i++) {
      if (si < s.length && t[i] === s[si]) {
        result += `<mark class="cy-cb__match">${text[i]}</mark>`;
        si++;
      } else {
        result += text[i];
      }
    }
    return result;
  }

  function selectOption(opt: Option) {
    value = opt.value;
    search = opt.label;
    userTyping = false;
    open = false;
    highlightIndex = -1;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    search = target.value;
    userTyping = true;
    open = true;
    highlightIndex = -1;
    if (allowCustom) {
      value = search;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      highlightIndex = Math.min(highlightIndex + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && filtered[highlightIndex]) {
        selectOption(filtered[highlightIndex]);
      } else if (allowCustom) {
        value = search;
        open = false;
        userTyping = false;
      }
    } else if (e.key === "Escape") {
      open = false;
      userTyping = false;
    }
  }

  function handleFocus() {
    search = displayValue;
    open = true;
  }

  function handleBlur() {
    setTimeout(() => {
      if (!containerEl?.contains(document.activeElement)) {
        open = false;
        userTyping = false;
        if (!allowCustom && !options.find((o) => o.value === value)) {
          value = "";
          search = "";
        }
      }
    }, 150);
  }
</script>

<div class="cy-cb" class:cy-cb--error={!!error} class:cy-cb--disabled={disabled} bind:this={containerEl}>
  {#if label}
    <label class="cy-cb__label" for={inputId}>{label}</label>
  {/if}

  <div class="cy-cb__control">
    <input
      class="cy-cb__input"
      id={inputId}
      type="text"
      value={displayValue}
      {placeholder}
      {disabled}
      bind:this={inputEl}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={handleFocus}
      onblur={handleBlur}
      autocomplete="off"
      role="combobox"
      aria-expanded={open}
      aria-invalid={!!error}
    />
    {#if loading}
      <span class="cy-cb__spinner"></span>
    {:else}
      <svg class="cy-cb__chevron" class:cy-cb__chevron--open={open} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    {/if}
  </div>

  {#if open}
    <div class="cy-cb__dropdown" role="listbox">
      {#if loading}
        <div class="cy-cb__loading">Loading...</div>
      {:else if filtered.length === 0}
        <div class="cy-cb__empty">{allowCustom ? 'Press Enter to use custom value' : 'No matches found'}</div>
      {:else}
        {#each filtered as opt, i}
          <button
            class="cy-cb__option"
            class:cy-cb__option--highlighted={i === highlightIndex}
            class:cy-cb__option--selected={opt.value === value}
            type="button"
            role="option"
            aria-selected={opt.value === value}
            onmousedown={(e) => { e.preventDefault(); selectOption(opt); }}
            onmouseenter={() => { highlightIndex = i; }}
          >
            <span class="cy-cb__option-label">{@html highlightMatch(opt.label)}</span>
            {#if opt.description}
              <span class="cy-cb__option-desc">{opt.description}</span>
            {/if}
          </button>
        {/each}
      {/if}
    </div>
  {/if}

  {#if error}
    <p class="cy-cb__error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .cy-cb {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    position: relative;
  }

  .cy-cb__label {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium);
    color: var(--input-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .cy-cb__control {
    position: relative;
    display: flex;
    align-items: center;
  }

  .cy-cb__input {
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--input-text);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    padding-right: 2.5rem;
    height: 40px;
    width: 100%;
    outline: none;
    transition: all var(--transition-default);
  }

  .cy-cb__input::placeholder {
    color: var(--input-placeholder);
  }

  .cy-cb__input:hover:not(:disabled) {
    background: var(--input-bg-hover);
  }

  .cy-cb__input:focus {
    border-color: var(--input-border-focus);
    box-shadow: var(--shadow-glow-cyan);
  }

  .cy-cb--error .cy-cb__input {
    border-color: var(--input-border-error);
  }

  .cy-cb__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-cb__chevron {
    position: absolute;
    right: var(--space-3);
    color: var(--color-text-tertiary);
    pointer-events: none;
    transition: transform var(--transition-default);
  }

  .cy-cb__chevron--open {
    transform: rotate(180deg);
  }

  .cy-cb__spinner {
    position: absolute;
    right: var(--space-3);
    width: 16px;
    height: 16px;
    border: 2px solid var(--input-border);
    border-top-color: var(--color-action-secondary-default);
    border-radius: 50%;
    animation: cy-cb-spin 0.6s linear infinite;
  }

  @keyframes cy-cb-spin {
    to { transform: rotate(360deg); }
  }

  .cy-cb__dropdown {
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

  .cy-cb__option {
    display: flex;
    flex-direction: column;
    gap: 2px;
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

  .cy-cb__option:hover,
  .cy-cb__option--highlighted {
    background: var(--color-state-info-bg);
    color: var(--color-text-primary);
  }

  .cy-cb__option--selected {
    color: var(--color-action-brand-default);
  }

  .cy-cb__option-label {
    line-height: 1.4;
  }

  .cy-cb__option-desc {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    line-height: 1.3;
  }

  :global(.cy-cb__match) {
    background: var(--color-state-info-bg);
    color: var(--color-action-secondary-default);
    border-radius: 1px;
    padding: 0;
  }

  .cy-cb__loading,
  .cy-cb__empty {
    font-family: var(--font-body);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    padding: var(--space-3);
    text-align: center;
  }

  .cy-cb__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
