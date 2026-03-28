<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";

  let {
    children,
  }: {
    children?: Snippet;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();

  async function scrollToBottom() {
    await tick();
    if (containerEl) {
      containerEl.scrollTop = containerEl.scrollHeight;
    }
  }

  $effect(() => {
    if (containerEl) {
      const observer = new MutationObserver(() => scrollToBottom());
      observer.observe(containerEl, { childList: true, subtree: true });
      scrollToBottom();
      return () => observer.disconnect();
    }
  });
</script>

<div class="cy-chat-panel" bind:this={containerEl}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .cy-chat-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    overflow-y: auto;
    flex: 1;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    scroll-behavior: smooth;
  }

  .cy-chat-panel::-webkit-scrollbar {
    width: 6px;
  }

  .cy-chat-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .cy-chat-panel::-webkit-scrollbar-thumb {
    background: var(--color-border-default);
    border-radius: 3px;
  }

  .cy-chat-panel::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-strong);
  }
</style>
