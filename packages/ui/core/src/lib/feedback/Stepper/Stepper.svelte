<svelte:options runes={true} />

<script lang="ts">
  let {
    steps = [],
    currentStep = $bindable(0),
    completedSteps = $bindable([]),
    orientation = "horizontal",
    onstepcick,
  }: {
    steps?: Array<{ title: string; description?: string }>;
    currentStep?: number;
    completedSteps?: number[];
    orientation?: "horizontal" | "vertical";
    onstepcick?: (step: number) => void;
  } = $props();

  function isCompleted(index: number): boolean {
    return completedSteps.includes(index);
  }

  function isCurrent(index: number): boolean {
    return currentStep === index;
  }

  function isClickable(index: number): boolean {
    return isCompleted(index) || isCurrent(index);
  }

  function handleClick(index: number) {
    if (isClickable(index) && onstepcick) {
      onstepcick(index);
    }
  }
</script>

<div class="cy-stepper cy-stepper--{orientation}" role="list">
  {#each steps as step, index}
    {#if index > 0}
      <div
        class="cy-stepper__connector"
        class:cy-stepper__connector--completed={isCompleted(index - 1)}
      ></div>
    {/if}

    <div class="cy-stepper__step" role="listitem">
      <button
        class="cy-stepper__circle"
        class:cy-stepper__circle--completed={isCompleted(index)}
        class:cy-stepper__circle--current={isCurrent(index)}
        class:cy-stepper__circle--upcoming={!isCompleted(index) && !isCurrent(index)}
        class:cy-stepper__circle--clickable={isClickable(index)}
        disabled={!isClickable(index)}
        onclick={() => handleClick(index)}
        aria-label="Step {index + 1}: {step.title}"
      >
        {#if isCompleted(index)}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          {index + 1}
        {/if}
      </button>

      <div class="cy-stepper__info">
        <span class="cy-stepper__title" class:cy-stepper__title--active={isCurrent(index) || isCompleted(index)}>
          {step.title}
        </span>
        {#if step.description}
          <span class="cy-stepper__description">{step.description}</span>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .cy-stepper {
    display: flex;
    align-items: flex-start;
  }

  .cy-stepper--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }

  .cy-stepper--vertical {
    flex-direction: column;
  }

  .cy-stepper__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 8px);
    position: relative;
    z-index: 1;
  }

  .cy-stepper--vertical .cy-stepper__step {
    flex-direction: row;
    align-items: flex-start;
  }

  .cy-stepper__circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
    font-weight: 600;
    border: 2px solid;
    cursor: default;
    flex-shrink: 0;
    transition: all 300ms ease;
    background: none;
    padding: 0;
  }

  .cy-stepper__circle--completed {
    background: var(--color-action-brand-default);
    border-color: var(--color-action-brand-default);
    color: var(--color-bg-primary);
    box-shadow: 0 0 12px var(--color-state-success-bg);
  }

  .cy-stepper__circle--current {
    background: transparent;
    border-color: var(--color-action-brand-default);
    color: var(--color-action-brand-default);
    box-shadow: 0 0 12px var(--color-state-success-bg);
    animation: cy-stepper-pulse 2s ease-in-out infinite;
  }

  .cy-stepper__circle--upcoming {
    background: transparent;
    border-color: var(--color-border-subtle);
    color: var(--color-text-tertiary);
  }

  .cy-stepper__circle--clickable {
    cursor: pointer;
  }

  .cy-stepper__circle--clickable:hover {
    box-shadow: 0 0 16px var(--color-state-success-bg);
  }

  @keyframes cy-stepper-pulse {
    0%, 100% { box-shadow: 0 0 8px var(--color-state-success-bg); }
    50% { box-shadow: 0 0 20px var(--color-state-success-bg); }
  }

  .cy-stepper__connector {
    flex: 1;
    min-width: 40px;
    min-height: 2px;
    background: var(--color-border-subtle);
    align-self: center;
    margin-top: 18px;
    transition: background 300ms ease;
  }

  .cy-stepper__connector--completed {
    background: var(--color-action-brand-default);
    box-shadow: 0 0 4px var(--color-state-success-bg);
  }

  .cy-stepper--vertical .cy-stepper__connector {
    min-width: 2px;
    min-height: 32px;
    flex: none;
    margin-top: 0;
    margin-left: 17px;
    align-self: flex-start;
  }

  .cy-stepper__info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .cy-stepper--vertical .cy-stepper__info {
    align-items: flex-start;
    padding-top: 6px;
  }

  .cy-stepper__title {
    font-family: var(--font-display, sans-serif);
    font-size: 0.8125rem;
    color: var(--color-text-tertiary);
    transition: color 300ms ease;
    white-space: nowrap;
  }

  .cy-stepper__title--active {
    color: var(--color-text-primary);
  }

  .cy-stepper__description {
    font-family: var(--font-body, sans-serif);
    font-size: 0.6875rem;
    color: var(--color-text-tertiary);
    max-width: 120px;
    text-align: center;
  }

  .cy-stepper--vertical .cy-stepper__description {
    text-align: left;
    max-width: none;
  }
</style>
