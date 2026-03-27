<svelte:options runes={true} />

<script lang="ts">
  type Step = {
    label: string;
    description?: string;
  };

  let {
    steps = [],
    currentStep = 0,
    variant = "horizontal",
  }: {
    steps?: Step[];
    currentStep?: number;
    variant?: "horizontal" | "vertical";
  } = $props();
</script>

<div class="cy-steps cy-steps--{variant}">
  {#each steps as step, i}
    <div
      class="cy-steps__item"
      class:cy-steps__item--completed={i < currentStep}
      class:cy-steps__item--current={i === currentStep}
      class:cy-steps__item--future={i > currentStep}
    >
      <div class="cy-steps__indicator">
        <div class="cy-steps__circle">
          {#if i < currentStep}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <span class="cy-steps__num">{i + 1}</span>
          {/if}
        </div>
        {#if i < steps.length - 1}
          <div class="cy-steps__line" class:cy-steps__line--filled={i < currentStep}></div>
        {/if}
      </div>
      <div class="cy-steps__content">
        <span class="cy-steps__label">{step.label}</span>
        {#if step.description}
          <span class="cy-steps__desc">{step.description}</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .cy-steps {
    display: flex;
    width: 100%;
  }

  .cy-steps--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }

  .cy-steps--vertical {
    flex-direction: column;
  }

  .cy-steps__item {
    display: flex;
    flex: 1;
  }

  .cy-steps--horizontal .cy-steps__item {
    flex-direction: column;
    align-items: center;
  }

  .cy-steps--vertical .cy-steps__item {
    flex-direction: row;
    align-items: flex-start;
  }

  .cy-steps__indicator {
    display: flex;
    align-items: center;
    position: relative;
  }

  .cy-steps--horizontal .cy-steps__indicator {
    width: 100%;
    justify-content: center;
  }

  .cy-steps--vertical .cy-steps__indicator {
    flex-direction: column;
    align-items: center;
    margin-right: var(--space-3, 12px);
  }

  .cy-steps__circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono, "JetBrains Mono", monospace);
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: all var(--transition-default, 150ms ease);
  }

  .cy-steps__item--completed .cy-steps__circle {
    background: var(--color-brand, #00ff41);
    color: #0a0a0f;
    border: 2px solid var(--color-brand, #00ff41);
  }

  .cy-steps__item--current .cy-steps__circle {
    background: transparent;
    color: var(--color-brand, #00ff41);
    border: 2px solid var(--color-brand, #00ff41);
    box-shadow: 0 0 12px rgba(0, 255, 65, 0.4);
    animation: cy-pulse 2s ease-in-out infinite;
  }

  .cy-steps__item--future .cy-steps__circle {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.35);
    border: 2px solid rgba(255, 255, 255, 0.12);
  }

  .cy-steps__num {
    line-height: 1;
  }

  .cy-steps__line {
    transition: background var(--transition-default, 150ms ease);
  }

  .cy-steps--horizontal .cy-steps__line {
    position: absolute;
    top: 50%;
    left: calc(50% + 20px);
    right: calc(-50% + 20px);
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%);
  }

  .cy-steps--horizontal .cy-steps__line--filled {
    background: var(--color-brand, #00ff41);
  }

  .cy-steps--vertical .cy-steps__line {
    width: 2px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    margin: var(--space-1, 4px) 0;
  }

  .cy-steps--vertical .cy-steps__line--filled {
    background: var(--color-brand, #00ff41);
  }

  .cy-steps__content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cy-steps--horizontal .cy-steps__content {
    align-items: center;
    text-align: center;
    margin-top: var(--space-2, 8px);
  }

  .cy-steps--vertical .cy-steps__content {
    padding-top: var(--space-1, 4px);
  }

  .cy-steps__label {
    font-family: var(--font-body, inherit);
    font-size: 0.8125rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-default, rgba(255, 255, 255, 0.87));
  }

  .cy-steps__item--future .cy-steps__label {
    color: var(--color-text-muted, rgba(255, 255, 255, 0.4));
  }

  .cy-steps__desc {
    font-size: 0.75rem;
    color: var(--color-text-muted, rgba(255, 255, 255, 0.4));
  }

  @keyframes cy-pulse {
    0%, 100% {
      box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
    }
    50% {
      box-shadow: 0 0 18px rgba(0, 255, 65, 0.6);
    }
  }
</style>
