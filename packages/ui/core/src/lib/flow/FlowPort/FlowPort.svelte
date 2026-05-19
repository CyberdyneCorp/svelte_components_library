<svelte:options runes={true} />

<script lang="ts">
  import type { PortSide } from "../types.js";

  let {
    side,
    color,
    label = "",
    type = "",
    compatible = false,
    hover = false,
    onpointerdown,
    onpointerenter,
    onpointerleave,
  }: {
    side: PortSide;
    color: string;
    label?: string;
    type?: string;
    compatible?: boolean;
    hover?: boolean;
    onpointerdown?: (e: PointerEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
  } = $props();

  const title = $derived(label && type ? `${label} · ${type}` : label || type);
</script>

<span
  class="cy-flow-port cy-flow-port--{side}"
  class:cy-flow-port--compatible={compatible}
  class:cy-flow-port--hover={hover}
  style:--port-color={color}
  role="button"
  tabindex="-1"
  aria-label={title}
  title={title}
  {onpointerdown}
  {onpointerenter}
  {onpointerleave}
>
  <span class="cy-flow-port__dot"></span>
</span>

<style>
  .cy-flow-port {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    cursor: crosshair;
    user-select: none;
    color: var(--port-color, var(--color-text-secondary));
  }

  .cy-flow-port__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-bg-primary);
    border: 2px solid var(--port-color, var(--color-border-default));
    box-shadow: 0 0 0 0 var(--port-color);
    transition:
      box-shadow var(--transition-default),
      transform var(--transition-default),
      background var(--transition-default);
  }

  .cy-flow-port:hover .cy-flow-port__dot,
  .cy-flow-port--hover .cy-flow-port__dot {
    background: var(--port-color);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--port-color) 25%, transparent);
    transform: scale(1.1);
  }

  .cy-flow-port--compatible .cy-flow-port__dot {
    background: var(--port-color);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--port-color) 30%, transparent);
    animation: cy-flow-port-pulse 1.4s ease-in-out infinite;
  }

  @keyframes cy-flow-port-pulse {
    0%, 100% {
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--port-color) 25%, transparent);
    }
    50% {
      box-shadow: 0 0 0 8px color-mix(in srgb, var(--port-color) 10%, transparent);
    }
  }

  .cy-flow-port--in {
    margin-left: -10px;
  }

  .cy-flow-port--out {
    margin-right: -10px;
  }
</style>
