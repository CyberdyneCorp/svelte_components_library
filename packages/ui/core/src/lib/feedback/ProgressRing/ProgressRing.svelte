<svelte:options runes={true} />

<script lang="ts">
  let {
    value = 0,
    size = 80,
    strokeWidth = 6,
    variant = "brand",
    showValue = true,
    label = "",
  }: {
    value?: number;
    size?: number;
    strokeWidth?: number;
    variant?: "brand" | "info" | "warning" | "error";
    showValue?: boolean;
    label?: string;
  } = $props();

  let clampedValue = $derived(Math.min(100, Math.max(0, value)));
  let radius = $derived((size - strokeWidth) / 2);
  let circumference = $derived(2 * Math.PI * radius);
  let dashOffset = $derived(circumference - (clampedValue / 100) * circumference);

  const variantColors: Record<string, string> = {
    brand: "#00ff41",
    info: "#00d4ff",
    warning: "#ffb800",
    error: "#ff4444",
  };

  let strokeColor = $derived(variantColors[variant] ?? variantColors.brand);
</script>

<div class="cy-progress-ring" style="--ring-size: {size}px">
  <svg
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    class="cy-progress-ring__svg"
  >
    <circle
      class="cy-progress-ring__track"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke-width={strokeWidth}
    />
    <circle
      class="cy-progress-ring__arc cy-progress-ring__arc--{variant}"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={strokeColor}
      stroke-width={strokeWidth}
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      stroke-linecap="round"
      transform="rotate(-90 {size / 2} {size / 2})"
    />
  </svg>

  {#if showValue}
    <span
      class="cy-progress-ring__value"
      style="font-size: {size * 0.22}px"
    >
      {Math.round(clampedValue)}%
    </span>
  {/if}

  {#if label}
    <span class="cy-progress-ring__label">{label}</span>
  {/if}
</div>

<style>
  .cy-progress-ring {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2, 8px);
    position: relative;
  }

  .cy-progress-ring__svg {
    display: block;
  }

  .cy-progress-ring__track {
    stroke: var(--color-bg-tertiary, #1a1a2e);
  }

  .cy-progress-ring__arc {
    transition: stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cy-progress-ring__arc--brand {
    filter: drop-shadow(0 0 6px rgba(0, 255, 65, 0.5));
  }

  .cy-progress-ring__value {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ring-size);
    height: var(--ring-size);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono, monospace);
    font-weight: 700;
    color: var(--color-text-primary, #e0e0e0);
    pointer-events: none;
  }

  .cy-progress-ring__label {
    font-family: var(--font-body, sans-serif);
    font-size: 0.75rem;
    color: var(--color-text-secondary, #888);
    text-align: center;
  }
</style>
