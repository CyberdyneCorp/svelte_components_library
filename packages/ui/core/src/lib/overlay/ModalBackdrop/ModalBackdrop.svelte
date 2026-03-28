<svelte:options runes={true} />

<script lang="ts">
  import { fade } from "svelte/transition";

  let {
    open = false,
    onclick,
    blur = true,
  }: {
    open?: boolean;
    onclick?: () => void;
    blur?: boolean;
  } = $props();
</script>

{#if open}
  <div
    class="cy-modal-backdrop"
    class:cy-modal-backdrop--blur={blur}
    role="presentation"
    onclick={onclick}
    onkeydown={(e) => { if (e.key === "Escape") onclick?.(); }}
    transition:fade={{ duration: 200 }}
  ></div>
{/if}

<style>
  .cy-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: var(--color-bg-overlay);
  }

  .cy-modal-backdrop--blur {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
</style>
