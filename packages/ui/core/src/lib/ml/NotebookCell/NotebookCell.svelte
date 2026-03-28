<svelte:options runes={true} />

<script lang="ts">
  let {
    code = $bindable(""),
    language = "python",
    output = "",
    outputType = "text",
    status = "idle",
    cellNumber = 1,
    onrun,
    ondelete,
  }: {
    code?: string;
    language?: string;
    output?: string;
    outputType?: "text" | "error" | "html" | "image";
    status?: "idle" | "running" | "success" | "error";
    cellNumber?: number;
    onrun?: () => void;
    ondelete?: () => void;
  } = $props();

  let outputCollapsed = $state(false);

  let lines = $derived(code.split("\n"));
  let lineCount = $derived(lines.length);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onrun?.();
    }
  }
</script>

<div class="cy-nc" class:cy-nc--running={status === "running"} class:cy-nc--error={status === "error"} class:cy-nc--success={status === "success"}>
  <div class="cy-nc__badge">
    <span class="cy-nc__number">[{cellNumber}]</span>
    <div class="cy-nc__status">
      {#if status === "running"}
        <span class="cy-nc__spinner"></span>
      {:else if status === "success"}
        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 8l3 3 5-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      {:else if status === "error"}
        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      {/if}
    </div>
  </div>

  <div class="cy-nc__content">
    <div class="cy-nc__header">
      <span class="cy-nc__lang">{language}</span>
      <div class="cy-nc__actions">
        <button class="cy-nc__action-btn cy-nc__action-btn--run" type="button" onclick={() => onrun?.()} title="Run cell (Ctrl+Enter)">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 2l10 6-10 6V2z" fill="currentColor"/></svg>
        </button>
        <button class="cy-nc__action-btn cy-nc__action-btn--delete" type="button" onclick={() => ondelete?.()} title="Delete cell">
          <svg viewBox="0 0 16 16" width="14" height="14"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>

    <div class="cy-nc__editor">
      <div class="cy-nc__gutter">
        {#each Array(lineCount) as _, i}
          <span class="cy-nc__line-num">{i + 1}</span>
        {/each}
      </div>
      <textarea
        class="cy-nc__textarea"
        bind:value={code}
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        onkeydown={handleKeydown}
        aria-label="Code cell {cellNumber}"
      ></textarea>
    </div>

    {#if output}
      <div class="cy-nc__output-wrapper">
        <button class="cy-nc__output-toggle" type="button" onclick={() => outputCollapsed = !outputCollapsed}>
          <svg class="cy-nc__chevron" class:cy-nc__chevron--collapsed={outputCollapsed} viewBox="0 0 16 16" width="12" height="12">
            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Output</span>
        </button>

        {#if !outputCollapsed}
          <div class="cy-nc__output" class:cy-nc__output--error={outputType === "error"}>
            {#if outputType === "html"}
              {@html output}
            {:else if outputType === "image"}
              <img class="cy-nc__output-img" src={output} alt="Cell output" />
            {:else}
              <pre class="cy-nc__output-text">{output}</pre>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .cy-nc {
    display: flex;
    gap: var(--space-2);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    background: var(--color-bg-secondary);
    transition: border-color var(--transition-default);
  }

  .cy-nc--running {
    border-color: var(--color-state-warning);
  }

  .cy-nc--success {
    border-color: var(--color-action-brand-default);
  }

  .cy-nc--error {
    border-color: var(--color-state-error);
  }

  .cy-nc__badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2);
    border-right: 1px solid var(--color-border-subtle);
    min-width: 48px;
    background: var(--color-surface-raised);
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  .cy-nc__number {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    white-space: nowrap;
  }

  .cy-nc__status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .cy-nc--success .cy-nc__status {
    color: var(--color-action-brand-default);
  }

  .cy-nc--error .cy-nc__status {
    color: var(--color-state-error);
  }

  .cy-nc__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-border-subtle);
    border-top-color: var(--color-state-warning);
    border-radius: 50%;
    animation: cy-nc-spin 0.8s linear infinite;
  }

  @keyframes cy-nc-spin {
    to { transform: rotate(360deg); }
  }

  .cy-nc__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .cy-nc__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1) var(--space-2);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .cy-nc__lang {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-action-secondary-default);
    background: var(--color-state-info-bg);
    border-radius: var(--radius-sm);
    padding: 1px 6px;
    text-transform: lowercase;
  }

  .cy-nc__actions {
    display: flex;
    gap: var(--space-1);
  }

  .cy-nc__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-default);
  }

  .cy-nc__action-btn--run {
    color: var(--color-action-brand-default);
  }

  .cy-nc__action-btn--run:hover {
    background: var(--color-state-info-bg);
    border-color: var(--color-action-brand-default);
  }

  .cy-nc__action-btn--delete {
    color: var(--color-text-tertiary);
  }

  .cy-nc__action-btn--delete:hover {
    color: var(--color-state-error);
    background: var(--color-state-error-bg);
    border-color: var(--color-state-error);
  }

  .cy-nc__editor {
    display: flex;
    min-height: 60px;
  }

  .cy-nc__gutter {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: var(--space-2) var(--space-2);
    border-right: 1px solid var(--color-border-subtle);
    background: var(--color-bg-primary);
    user-select: none;
    flex-shrink: 0;
  }

  .cy-nc__line-num {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.5rem;
    color: var(--color-text-tertiary);
    min-width: 2ch;
    text-align: right;
  }

  .cy-nc__textarea {
    flex: 1;
    padding: var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5rem;
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    border: none;
    outline: none;
    resize: vertical;
    white-space: pre;
    tab-size: 4;
    min-height: 60px;
    width: 100%;
  }

  .cy-nc__textarea::placeholder {
    color: var(--input-placeholder);
  }

  .cy-nc__output-wrapper {
    border-top: 1px solid var(--color-border-subtle);
  }

  .cy-nc__output-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    background: transparent;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    width: 100%;
    text-align: left;
  }

  .cy-nc__output-toggle:hover {
    color: var(--color-text-secondary);
  }

  .cy-nc__chevron {
    transition: transform var(--transition-default);
  }

  .cy-nc__chevron--collapsed {
    transform: rotate(-90deg);
  }

  .cy-nc__output {
    padding: var(--space-2);
    background: var(--color-bg-primary);
    border-radius: 0 0 var(--radius-md) 0;
  }

  .cy-nc__output--error {
    background: var(--color-state-error-bg);
  }

  .cy-nc__output-text {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .cy-nc__output--error .cy-nc__output-text {
    color: var(--color-state-error);
  }

  .cy-nc__output-img {
    max-width: 100%;
    border-radius: var(--radius-sm);
  }
</style>
