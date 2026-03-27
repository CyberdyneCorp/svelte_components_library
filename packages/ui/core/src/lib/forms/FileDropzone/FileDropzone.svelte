<svelte:options runes={true} />

<script lang="ts">
  let {
    accept = "",
    multiple = false,
    disabled = false,
    maxSize = undefined,
    onfiles,
  }: {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    maxSize?: number | undefined;
    onfiles?: (files: FileList) => void;
  } = $props();

  let dragging = $state(false);
  let fileInput: HTMLInputElement;
  let errorMsg = $state("");

  function validateAndEmit(files: FileList | null) {
    if (!files || files.length === 0) return;

    errorMsg = "";

    if (maxSize) {
      const maxBytes = maxSize * 1024 * 1024;
      for (const file of files) {
        if (file.size > maxBytes) {
          errorMsg = `File "${file.name}" exceeds ${maxSize}MB limit`;
          return;
        }
      }
    }

    onfiles?.(files);
  }

  function ondrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    if (disabled) return;
    validateAndEmit(e.dataTransfer?.files ?? null);
  }

  function ondragover(e: DragEvent) {
    e.preventDefault();
    if (!disabled) dragging = true;
  }

  function ondragleave() {
    dragging = false;
  }

  function onchange(e: Event) {
    const target = e.target as HTMLInputElement;
    validateAndEmit(target.files);
    target.value = "";
  }

  function onclick() {
    if (!disabled) {
      fileInput.click();
    }
  }

  function onkeydown(e: KeyboardEvent) {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      fileInput.click();
    }
  }
</script>

<div class="cy-dropzone" class:cy-dropzone--disabled={disabled}>
  <div
    class="cy-dropzone__area"
    class:cy-dropzone__area--dragging={dragging}
    role="button"
    tabindex={disabled ? -1 : 0}
    aria-label="File upload dropzone"
    aria-disabled={disabled}
    {ondrop}
    {ondragover}
    {ondragleave}
    {onclick}
    {onkeydown}
  >
    <input
      bind:this={fileInput}
      type="file"
      class="cy-dropzone__input"
      {accept}
      {multiple}
      {disabled}
      {onchange}
    />

    <svg class="cy-dropzone__icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="12" y2="12" />
      <line x1="15" y1="15" x2="12" y2="12" />
    </svg>

    <p class="cy-dropzone__text">Drop files here or click to browse</p>

    {#if accept}
      <p class="cy-dropzone__meta">Accepted: {accept}</p>
    {/if}

    {#if maxSize}
      <p class="cy-dropzone__meta">Max size: {maxSize}MB</p>
    {/if}
  </div>

  {#if errorMsg}
    <p class="cy-dropzone__error" role="alert">{errorMsg}</p>
  {/if}
</div>

<style>
  .cy-dropzone {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
  }

  .cy-dropzone__area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-8) var(--space-4);
    border: 2px dashed var(--input-border);
    border-radius: var(--radius-lg);
    background: var(--input-bg);
    cursor: pointer;
    transition: all var(--transition-default);
    outline: none;
  }

  .cy-dropzone__area:hover:not([aria-disabled="true"]) {
    border-color: var(--color-border-strong);
    background: var(--input-bg-hover);
  }

  .cy-dropzone__area:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .cy-dropzone__area--dragging {
    border-color: var(--color-action-brand-default);
    background: var(--color-state-success-bg);
    box-shadow: var(--shadow-glow-green);
  }

  .cy-dropzone--disabled .cy-dropzone__area {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cy-dropzone__input {
    display: none;
  }

  .cy-dropzone__icon {
    color: var(--color-text-tertiary);
    transition: color var(--transition-default);
  }

  .cy-dropzone__area--dragging .cy-dropzone__icon {
    color: var(--color-action-brand-default);
  }

  .cy-dropzone__text {
    font-family: var(--font-body);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .cy-dropzone__meta {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
    margin: 0;
  }

  .cy-dropzone__error {
    font-family: var(--font-body);
    font-size: 0.75rem;
    color: var(--color-state-error);
    margin: 0;
  }
</style>
