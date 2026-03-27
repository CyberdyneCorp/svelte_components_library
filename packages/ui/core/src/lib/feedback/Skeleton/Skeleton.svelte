<svelte:options runes={true} />

<script lang="ts">
  let {
    variant = "text",
    width,
    height,
    lines = 1,
    animated = true,
  }: {
    variant?: "text" | "circle" | "rect" | "card";
    width?: string;
    height?: string;
    lines?: number;
    animated?: boolean;
  } = $props();

  const lineWidths = ["100%", "92%", "85%", "78%", "95%", "88%", "70%"];
</script>

{#if variant === "text"}
  <div class="cy-skeleton-text" style:width={width}>
    {#each Array(lines) as _, i}
      <div
        class="cy-skeleton cy-skeleton--text"
        class:cy-skeleton--animated={animated}
        style:width={lineWidths[i % lineWidths.length]}
        style:height={height || "14px"}
      ></div>
    {/each}
  </div>
{:else if variant === "circle"}
  <div
    class="cy-skeleton cy-skeleton--circle"
    class:cy-skeleton--animated={animated}
    style:width={width || "48px"}
    style:height={height || width || "48px"}
  ></div>
{:else if variant === "rect"}
  <div
    class="cy-skeleton cy-skeleton--rect"
    class:cy-skeleton--animated={animated}
    style:width={width || "100%"}
    style:height={height || "200px"}
  ></div>
{:else if variant === "card"}
  <div class="cy-skeleton-card" style:width={width || "100%"}>
    <div
      class="cy-skeleton cy-skeleton--rect"
      class:cy-skeleton--animated={animated}
      style:height="140px"
    ></div>
    <div class="cy-skeleton-card__body">
      <div
        class="cy-skeleton cy-skeleton--text"
        class:cy-skeleton--animated={animated}
        style:width="60%"
        style:height="18px"
      ></div>
      <div
        class="cy-skeleton cy-skeleton--text"
        class:cy-skeleton--animated={animated}
        style:width="100%"
        style:height="12px"
      ></div>
      <div
        class="cy-skeleton cy-skeleton--text"
        class:cy-skeleton--animated={animated}
        style:width="85%"
        style:height="12px"
      ></div>
    </div>
  </div>
{/if}

<style>
  .cy-skeleton {
    background: var(--color-surface-raised, #1a1a2e);
    border-radius: var(--radius-sm);
    position: relative;
    overflow: hidden;
  }

  .cy-skeleton--animated::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 65, 0.04) 40%,
      rgba(0, 212, 255, 0.06) 60%,
      transparent 100%
    );
    animation: cy-shimmer 1.8s ease-in-out infinite;
  }

  .cy-skeleton--text {
    border-radius: var(--radius-sm);
  }

  .cy-skeleton-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-skeleton--circle {
    border-radius: 50%;
  }

  .cy-skeleton--rect {
    border-radius: var(--radius-md);
    width: 100%;
  }

  .cy-skeleton-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06));
    overflow: hidden;
    background: var(--color-surface-default, #12121a);
  }

  .cy-skeleton-card__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
  }

  @keyframes cy-shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
</style>
