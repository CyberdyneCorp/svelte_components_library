<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    value = $bindable(""),
    placeholder = "Type a message...",
    disabled = false,
    loading = false,
    onsend,
    onattach,
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    onsend?: (msg: string) => void;
    onattach?: () => void;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state();

  function autoGrow() {
    if (!textareaEl) return;
    textareaEl.style.height = "auto";
    textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
  }

  function handleSend() {
    if (!value.trim() || disabled || loading) return;
    onsend?.(value.trim());
    value = "";
    if (textareaEl) textareaEl.style.height = "auto";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
</script>

<div class="cy-chatbox" class:cy-chatbox--disabled={disabled}>
  {#if onattach}
    <button
      class="cy-chatbox__attach"
      type="button"
      onclick={onattach}
      {disabled}
      aria-label="Attach file"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
      </svg>
    </button>
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
    disabled={disabled || loading || !value.trim()}
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

<style>
  .cy-chatbox {
    display: flex;
    align-items: flex-end;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--color-surface-2, #12121a);
    border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-default);
  }

  .cy-chatbox:focus-within {
    border-color: var(--color-action-brand-default, #00ff41);
  }

  .cy-chatbox--disabled {
    opacity: 0.5;
    pointer-events: none;
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
    color: var(--color-text-secondary, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: color var(--transition-default), background var(--transition-default);
    flex-shrink: 0;
  }

  .cy-chatbox__attach:hover {
    color: var(--color-text-primary, #fff);
    background: var(--color-surface-3, rgba(255, 255, 255, 0.05));
  }

  .cy-chatbox__input {
    flex: 1;
    min-height: 36px;
    max-height: 200px;
    padding: var(--space-2);
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary, #fff);
    font-family: var(--font-body);
    font-size: 0.875rem;
    line-height: 1.5;
    resize: none;
  }

  .cy-chatbox__input::placeholder {
    color: var(--color-text-muted, rgba(255, 255, 255, 0.3));
  }

  .cy-chatbox__send {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--radius-md);
    background: var(--color-action-brand-default, #00ff41);
    color: var(--color-surface-1, #0a0a0f);
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
    border-top-color: var(--color-surface-1, #0a0a0f);
    border-radius: 50%;
    animation: cy-spin 0.6s linear infinite;
  }

  @keyframes cy-spin {
    to { transform: rotate(360deg); }
  }
</style>
