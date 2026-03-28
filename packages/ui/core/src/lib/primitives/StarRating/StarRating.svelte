<svelte:options runes={true} />

<script lang="ts">
  let {
    value = $bindable(0),
    max = 5,
    size = "md",
    readonly = false,
    label = "",
    showValue = false,
    allowHalf = false,
    onchange,
  }: {
    value?: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    label?: string;
    showValue?: boolean;
    allowHalf?: boolean;
    onchange?: (value: number) => void;
  } = $props();

  let hoverValue = $state(-1);

  const sizeMap: Record<string, number> = { sm: 16, md: 24, lg: 32 };

  let px = $derived(sizeMap[size] ?? 24);

  function getStarValue(index: number, event?: MouseEvent): number {
    if (allowHalf && event) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      if (x < rect.width / 2) {
        return index + 0.5;
      }
    }
    return index + 1;
  }

  function handleClick(index: number, event: MouseEvent) {
    if (readonly) return;
    const newValue = getStarValue(index, event);
    value = newValue;
    onchange?.(newValue);
  }

  function handleMouseMove(index: number, event: MouseEvent) {
    if (readonly) return;
    hoverValue = getStarValue(index, event);
  }

  function handleMouseLeave() {
    if (readonly) return;
    hoverValue = -1;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (readonly) return;
    const step = allowHalf ? 0.5 : 1;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const newValue = Math.min(max, value + step);
      value = newValue;
      onchange?.(newValue);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const newValue = Math.max(0, value - step);
      value = newValue;
      onchange?.(newValue);
    }
  }

  let displayValue = $derived(hoverValue >= 0 ? hoverValue : value);

  function getFill(index: number): "full" | "half" | "empty" {
    const starNum = index + 1;
    if (displayValue >= starNum) return "full";
    if (displayValue >= starNum - 0.5) return "half";
    return "empty";
  }
</script>

<div
  class="cy-star-rating cy-star-rating--{size}"
  class:cy-star-rating--readonly={readonly}
  role="slider"
  aria-label={label || "Star rating"}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuenow={value}
  tabindex={readonly ? -1 : 0}
  onkeydown={handleKeydown}
  onmouseleave={handleMouseLeave}
>
  {#if label}
    <span class="cy-star-rating__label">{label}</span>
  {/if}

  <div class="cy-star-rating__stars">
    {#each Array(max) as _, i}
      {@const fill = getFill(i)}
      <button
        type="button"
        class="cy-star-rating__star"
        class:cy-star-rating__star--filled={fill === "full"}
        class:cy-star-rating__star--half={fill === "half"}
        disabled={readonly}
        onclick={(e) => handleClick(i, e)}
        onmousemove={(e) => handleMouseMove(i, e)}
        aria-label="Star {i + 1}"
        tabindex={-1}
      >
        <svg
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {#if fill === "half"}
            <defs>
              <clipPath id="half-left-{i}">
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
              <clipPath id="half-right-{i}">
                <rect x="12" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              clip-path="url(#half-left-{i})"
              class="cy-star-rating__path--filled"
            />
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              clip-path="url(#half-right-{i})"
              class="cy-star-rating__path--empty"
            />
          {:else}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              class={fill === "full" ? "cy-star-rating__path--filled" : "cy-star-rating__path--empty"}
            />
          {/if}
        </svg>
      </button>
    {/each}

    {#if showValue}
      <span class="cy-star-rating__value">{value} / {max}</span>
    {/if}
  </div>
</div>

<style>
  .cy-star-rating {
    display: inline-flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cy-star-rating__label {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .cy-star-rating__stars {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .cy-star-rating__star {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: transform var(--transition-default);
    line-height: 0;
  }

  .cy-star-rating__star:hover:not(:disabled) {
    transform: scale(1.15);
  }

  .cy-star-rating__star:disabled {
    cursor: default;
  }

  .cy-star-rating--readonly .cy-star-rating__star {
    cursor: default;
  }

  .cy-star-rating__path--filled {
    fill: var(--color-state-warning);
    transition: fill var(--transition-default);
  }

  .cy-star-rating__path--empty {
    fill: var(--color-surface-hover);
    transition: fill var(--transition-default);
  }

  .cy-star-rating__value {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-left: var(--space-2);
  }

  .cy-star-rating--sm .cy-star-rating__value {
    font-size: 0.75rem;
  }

  .cy-star-rating--lg .cy-star-rating__value {
    font-size: 1rem;
  }
</style>
