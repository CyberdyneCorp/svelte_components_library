<svelte:options runes={true} />

<script lang="ts">
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ViewBBox } from "../types.js";

  type Props = {
    /** Rectangle the "fit" button flies to. Skipped when omitted. */
    fitExtent?: ViewBBox | null;
    /** Camera the "home" button restores to. Skipped when omitted. */
    home?: { lng: number; lat: number; heightM: number } | null;
    /** Show the 2D/3D scene mode toggle. */
    showSceneModeToggle?: boolean;
    /** Show the north-up reset (snaps heading to 0). */
    showNorthUp?: boolean;
    /**
     * Flight duration in seconds for camera transitions. Pass 0 for an
     * instant snap.
     */
    flightDurationS?: number;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  };

  let {
    fitExtent = null,
    home = null,
    showSceneModeToggle = false,
    showNorthUp = true,
    flightDurationS = 1.2,
    position = "top-right",
  }: Props = $props();

  const getViewer = useCesiumViewer();

  async function zoomBy(factor: number): Promise<void> {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = await import("cesium");
    const camera = viewer.camera;
    const distance = Cesium.Cartesian3.magnitude(camera.position) * (factor - 1);
    camera.zoomIn(-distance);
  }

  async function fit(): Promise<void> {
    const viewer = getViewer();
    if (!viewer || !fitExtent) return;
    const Cesium = await import("cesium");
    const rect = Cesium.Rectangle.fromDegrees(
      fitExtent.minLng,
      fitExtent.minLat,
      fitExtent.maxLng,
      fitExtent.maxLat,
    );
    viewer.camera.flyTo({ destination: rect, duration: flightDurationS });
  }

  async function flyHome(): Promise<void> {
    const viewer = getViewer();
    if (!viewer || !home) return;
    const Cesium = await import("cesium");
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(home.lng, home.lat, home.heightM),
      duration: flightDurationS,
    });
  }

  async function snapNorth(): Promise<void> {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = await import("cesium");
    viewer.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: 0,
        pitch: viewer.camera.pitch,
        roll: 0,
      },
      duration: flightDurationS,
    });
    void Cesium;
  }

  async function toggleSceneMode(): Promise<void> {
    const viewer = getViewer();
    if (!viewer) return;
    const Cesium = await import("cesium");
    const current = viewer.scene.mode;
    if (current === Cesium.SceneMode.SCENE3D) {
      viewer.scene.morphTo2D(0.8);
    } else {
      viewer.scene.morphTo3D(0.8);
    }
  }
</script>

<div class="cy-cesium-ctrls" data-position={position}>
  <button class="cy-cesium-ctrls__btn" onclick={() => zoomBy(0.5)} aria-label="Zoom in">
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </button>
  <button class="cy-cesium-ctrls__btn" onclick={() => zoomBy(2)} aria-label="Zoom out">
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </button>
  {#if fitExtent}
    <div class="cy-cesium-ctrls__sep"></div>
    <button class="cy-cesium-ctrls__btn" onclick={fit} aria-label="Fit to extent">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  {/if}
  {#if home}
    <button class="cy-cesium-ctrls__btn" onclick={flyHome} aria-label="Home view">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <path d="M2 8 L8 2 L14 8 M4 8 v6 h8 v-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  {/if}
  {#if showNorthUp}
    <button class="cy-cesium-ctrls__btn" onclick={snapNorth} aria-label="Snap heading to north">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <path d="M8 2 L11 14 L8 11 L5 14 Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="currentColor" fill-opacity="0.55" />
      </svg>
    </button>
  {/if}
  {#if showSceneModeToggle}
    <div class="cy-cesium-ctrls__sep"></div>
    <button class="cy-cesium-ctrls__btn" onclick={toggleSceneMode} aria-label="Toggle 2D / 3D">
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4" />
        <path d="M2 8h12 M8 2c2.5 3 2.5 9 0 12 M8 2c-2.5 3-2.5 9 0 12" stroke="currentColor" stroke-width="1" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .cy-cesium-ctrls {
    position: absolute;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    border-radius: 8px;
    background: var(--color-surface-default, rgba(18, 18, 26, 0.85));
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(8px);
  }
  .cy-cesium-ctrls[data-position="top-right"] {
    top: 12px;
    right: 12px;
  }
  .cy-cesium-ctrls[data-position="top-left"] {
    top: 12px;
    left: 12px;
  }
  .cy-cesium-ctrls[data-position="bottom-right"] {
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-ctrls[data-position="bottom-left"] {
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-ctrls__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text-secondary, #cbd5f5);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .cy-cesium-ctrls__btn:hover {
    background: var(--color-action-secondary-bg, rgba(0, 212, 255, 0.12));
    color: var(--color-action-secondary-default, #00d4ff);
  }
  .cy-cesium-ctrls__btn:active {
    background: var(--color-action-secondary-active, rgba(0, 212, 255, 0.22));
  }
  .cy-cesium-ctrls__sep {
    height: 1px;
    margin: 2px 4px;
    background: var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  }
</style>
