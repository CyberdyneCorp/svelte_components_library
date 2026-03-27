<svelte:options runes={true} />

<script lang="ts">
  let {
    src,
    alt = "",
    initials = "",
    size = "md",
    status,
  }: {
    src?: string | undefined;
    alt?: string;
    initials?: string;
    size?: "sm" | "md" | "lg" | "xl";
    status?: "online" | "offline" | "busy" | undefined;
  } = $props();

  let imgError = $state(false);
  let showImage = $derived(src && !imgError);

  function handleError() {
    imgError = true;
  }
</script>

<div class="cy-avatar cy-avatar--{size}">
  {#if showImage}
    <img class="cy-avatar__img" {src} {alt} onerror={handleError} />
  {:else}
    <span class="cy-avatar__initials">{initials}</span>
  {/if}
  {#if status}
    <span class="cy-avatar__status cy-avatar__status--{status}" aria-label={status}></span>
  {/if}
</div>

<style>
  .cy-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--color-surface-raised);
    border: 2px solid var(--color-border-subtle);
    overflow: visible;
    flex-shrink: 0;
  }

  .cy-avatar--sm {
    width: 28px;
    height: 28px;
    font-size: 0.625rem;
  }

  .cy-avatar--md {
    width: 36px;
    height: 36px;
    font-size: 0.75rem;
  }

  .cy-avatar--lg {
    width: 48px;
    height: 48px;
    font-size: 0.9375rem;
  }

  .cy-avatar--xl {
    width: 64px;
    height: 64px;
    font-size: 1.125rem;
  }

  .cy-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .cy-avatar__initials {
    font-family: var(--font-mono);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
  }

  .cy-avatar__status {
    position: absolute;
    bottom: -1px;
    right: -1px;
    border-radius: 50%;
    border: 2px solid var(--color-bg-primary);
  }

  .cy-avatar--sm .cy-avatar__status {
    width: 8px;
    height: 8px;
  }

  .cy-avatar--md .cy-avatar__status {
    width: 10px;
    height: 10px;
  }

  .cy-avatar--lg .cy-avatar__status {
    width: 12px;
    height: 12px;
  }

  .cy-avatar--xl .cy-avatar__status {
    width: 14px;
    height: 14px;
  }

  .cy-avatar__status--online {
    background: var(--color-state-success);
    box-shadow: 0 0 6px rgba(0, 255, 65, 0.4);
  }

  .cy-avatar__status--offline {
    background: var(--color-text-tertiary);
  }

  .cy-avatar__status--busy {
    background: var(--color-state-error);
    box-shadow: 0 0 6px rgba(255, 68, 68, 0.4);
  }
</style>
