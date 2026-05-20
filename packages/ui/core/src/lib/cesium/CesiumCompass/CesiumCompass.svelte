<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";

  type Props = {
    /** Diameter in pixels. */
    size?: number;
    /** Click the needle to fly back to heading 0. */
    clickToReset?: boolean;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    /** Flight duration in seconds for the click-to-reset animation. */
    flightDurationS?: number;
  };

  let {
    size = 56,
    clickToReset = true,
    position = "top-left",
    flightDurationS = 0.8,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let headingDeg = $state(0);
  let unsubscribe: (() => void) | null = null;

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = await import("cesium");
    const update = (): void => {
      headingDeg = Cesium.Math.toDegrees(viewer.camera.heading);
    };
    viewer.camera.percentageChanged = Math.min(
      viewer.camera.percentageChanged,
      0.05,
    );
    viewer.camera.changed.addEventListener(update);
    update();
    unsubscribe = () => viewer.camera.changed.removeEventListener(update);
  });

  onDestroy(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  async function resetHeading(): Promise<void> {
    if (!clickToReset) return;
    const viewer = getViewer();
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch,
        roll: 0,
      },
      duration: flightDurationS,
    });
  }
</script>

<button
  type="button"
  class="cy-cesium-compass"
  data-position={position}
  style="--size: {size}px;"
  onclick={resetHeading}
  aria-label="Reset camera heading to north"
  disabled={!clickToReset}
>
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="var(--color-surface-default, rgba(18, 18, 26, 0.85))" stroke="var(--color-border-subtle, rgba(255, 255, 255, 0.18))" stroke-width="1.5" />
    <g transform="rotate({-headingDeg} 32 32)">
      <path d="M32 8 L37 32 L32 28 L27 32 Z" fill="var(--color-state-error, #ff4444)" stroke="rgba(0,0,0,0.4)" stroke-width="0.5" />
      <path d="M32 56 L27 32 L32 36 L37 32 Z" fill="var(--color-text-tertiary, #94a3b8)" stroke="rgba(0,0,0,0.4)" stroke-width="0.5" />
    </g>
    <text x="32" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="9" font-weight="700" fill="var(--color-text-primary, #f0f0ff)" pointer-events="none">N</text>
  </svg>
</button>

<style>
  .cy-cesium-compass {
    position: absolute;
    z-index: 1000;
    width: var(--size, 56px);
    height: var(--size, 56px);
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 50%;
  }
  .cy-cesium-compass:disabled {
    cursor: default;
  }
  .cy-cesium-compass[data-position="top-left"] {
    top: 12px;
    left: 12px;
  }
  .cy-cesium-compass[data-position="top-right"] {
    top: 12px;
    right: 12px;
  }
  .cy-cesium-compass[data-position="bottom-left"] {
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-compass[data-position="bottom-right"] {
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-compass:focus-visible {
    outline: 2px solid var(--color-action-secondary-default, #00d4ff);
    outline-offset: 2px;
  }
</style>
