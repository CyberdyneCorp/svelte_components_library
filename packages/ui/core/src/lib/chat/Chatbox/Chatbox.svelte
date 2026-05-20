<svelte:options runes={true} />

<script lang="ts">
  import { formatChatBytes } from "../types.js";

  let {
    value = $bindable(""),
    /** Bindable list of files staged for the next send. */
    attachments = $bindable<File[]>([]),
    placeholder = "Type a message...",
    disabled = false,
    loading = false,
    /** When true the paperclip is rendered even without an onattach callback. */
    showAttach = false,
    /** `<input accept>` filter, e.g. `"image/*"` or `".png,.jpg,application/pdf"`. */
    acceptTypes,
    /** Allow selecting multiple files. */
    multiple = true,
    /** Reject files larger than this (bytes). Rejected files surface via onerror. */
    maxSizeBytes,
    onsend,
    /**
     * Fires whenever new files are added via the paperclip. Receives the
     * incoming files (already filtered by `acceptTypes` / `maxSizeBytes`).
     * If omitted, files still accumulate in the bindable `attachments` list.
     */
    onattach,
    /** Fires when files are removed from the staged list. */
    ondetach,
    /** Fires when a file violates `maxSizeBytes` or the picker errors. */
    onerror,
  }: {
    value?: string;
    attachments?: File[];
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    showAttach?: boolean;
    acceptTypes?: string;
    multiple?: boolean;
    maxSizeBytes?: number;
    /** Backwards compatible: existing `(msg) => void` callers still work. */
    onsend?: (msg: string, attachments: File[]) => void;
    onattach?: (files: File[]) => void;
    ondetach?: (file: File, index: number) => void;
    onerror?: (message: string, rejected: File[]) => void;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let fileInputEl: HTMLInputElement | undefined = $state();

  const attachEnabled = $derived(
    showAttach || onattach != null || acceptTypes != null,
  );

  function autoGrow() {
    if (!textareaEl) return;
    textareaEl.style.height = "auto";
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
  }

  function handleSend() {
    const trimmed = value.trim();
    if (disabled || loading) return;
    if (!trimmed && attachments.length === 0) return;
    onsend?.(trimmed, attachments);
    value = "";
    attachments = [];
    if (textareaEl) textareaEl.style.height = "auto";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function openPicker() {
    fileInputEl?.click();
  }

  function onFiles(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const picked = target.files ? Array.from(target.files) : [];
    target.value = ""; // allow re-picking the same file next time
    if (picked.length === 0) return;

    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const f of picked) {
      if (typeof maxSizeBytes === "number" && f.size > maxSizeBytes) {
        rejected.push(f);
      } else {
        accepted.push(f);
      }
    }
    if (rejected.length > 0) {
      onerror?.(
        `${rejected.length} file${rejected.length === 1 ? "" : "s"} exceed${
          rejected.length === 1 ? "s" : ""
        } ${formatChatBytes(maxSizeBytes ?? 0)}`,
        rejected,
      );
    }
    if (accepted.length === 0) return;
    attachments = multiple ? [...attachments, ...accepted] : accepted;
    onattach?.(accepted);
  }

  function removeAt(i: number) {
    const removed = attachments[i];
    attachments = attachments.filter((_, idx) => idx !== i);
    if (removed) ondetach?.(removed, i);
  }

  function isImage(file: File): boolean {
    return file.type.startsWith("image/");
  }
</script>

<div class="cy-chatbox" class:cy-chatbox--disabled={disabled}>
  {#if attachments.length > 0}
    <div class="cy-chatbox__chips">
      {#each attachments as file, i (i)}
        <div class="cy-chatbox__chip" class:cy-chatbox__chip--image={isImage(file)}>
          {#if isImage(file)}
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              class="cy-chatbox__chip-thumb"
            />
          {:else}
            <span class="cy-chatbox__chip-icon" aria-hidden="true">⤒</span>
          {/if}
          <span class="cy-chatbox__chip-name" title={file.name}>{file.name}</span>
          {#if file.size > 0}
            <span class="cy-chatbox__chip-size">{formatChatBytes(file.size)}</span>
          {/if}
          <button
            class="cy-chatbox__chip-remove"
            type="button"
            aria-label="Remove {file.name}"
            onclick={() => removeAt(i)}
          >×</button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="cy-chatbox__row">
    {#if attachEnabled}
      <button
        class="cy-chatbox__attach"
        type="button"
        onclick={openPicker}
        {disabled}
        aria-label="Attach file"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>
      <input
        bind:this={fileInputEl}
        class="cy-chatbox__file-input"
        type="file"
        accept={acceptTypes}
        {multiple}
        onchange={onFiles}
        aria-hidden="true"
        tabindex="-1"
      />
    {/if}

    <textarea
      class="cy-chatbox__input"
      bind:this={textareaEl}
      bind:value
      {placeholder}
      {disabled}
      rows="1"
      oninput={autoGrow}
      onkeydown={handleKeydown}
    ></textarea>

    <button
      class="cy-chatbox__send"
      type="button"
      onclick={handleSend}
      disabled={disabled || loading || (!value.trim() && attachments.length === 0)}
      aria-label={loading ? "Sending..." : "Send message"}
    >
      {#if loading}
        <span class="cy-chatbox__spinner"></span>
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .cy-chatbox {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-default);
  }

  .cy-chatbox:focus-within {
    border-color: var(--color-action-brand-default);
  }

  .cy-chatbox--disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .cy-chatbox__row {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
  }

  .cy-chatbox__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .cy-chatbox__chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 4px 6px 4px 8px;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    max-width: 240px;
    font-size: 0.75rem;
    color: var(--color-text-primary);
  }

  .cy-chatbox__chip--image {
    padding-left: 4px;
  }

  .cy-chatbox__chip-thumb {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: var(--radius-sm, 4px);
  }

  .cy-chatbox__chip-icon {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--color-action-secondary-default);
  }

  .cy-chatbox__chip-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  .cy-chatbox__chip-size {
    color: var(--color-text-tertiary);
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
  }

  .cy-chatbox__chip-remove {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: var(--color-text-tertiary);
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
  }
  .cy-chatbox__chip-remove:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
  }

  .cy-chatbox__attach {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color var(--transition-default), background var(--transition-default);
    flex-shrink: 0;
  }

  .cy-chatbox__attach:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-raised);
  }

  .cy-chatbox__file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .cy-chatbox__input {
    flex: 1;
    min-height: 36px;
    max-height: 200px;
    padding: var(--space-2);
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    resize: none;
  }

  .cy-chatbox__input::placeholder {
    color: var(--color-text-tertiary);
  }

  .cy-chatbox__send {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    cursor: pointer;
    transition: opacity var(--transition-default), transform var(--transition-default);
    flex-shrink: 0;
  }

  .cy-chatbox__send:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }

  .cy-chatbox__send:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cy-chatbox__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top-color: var(--color-bg-primary);
    border-radius: 50%;
    animation: cy-spin 0.6s linear infinite;
  }

  @keyframes cy-spin {
    to { transform: rotate(360deg); }
  }
</style>
