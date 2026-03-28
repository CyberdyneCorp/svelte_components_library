<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    title = "How can I help?",
    subtitle = "",
    children,
  }: {
    title?: string;
    subtitle?: string;
    children?: Snippet;
  } = $props();
</script>

<div class="cy-welcome">
  <h1 class="cy-welcome__title">{title}</h1>
  {#if subtitle}
    <p class="cy-welcome__subtitle">{subtitle}</p>
  {/if}
  {#if children}
    <div class="cy-welcome__prompts">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cy-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    padding: var(--space-8);
    text-align: center;
    animation: cy-fade-in 0.5s ease-out;
  }

  @keyframes cy-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cy-welcome__title {
    margin: 0;
    font-family: var(--font-heading, var(--font-body));
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .cy-welcome__subtitle {
    margin: 0;
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--color-text-tertiary);
    max-width: 40ch;
    line-height: 1.5;
  }

  .cy-welcome__prompts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
    width: 100%;
    max-width: 600px;
    margin-top: var(--space-4);
  }
</style>
