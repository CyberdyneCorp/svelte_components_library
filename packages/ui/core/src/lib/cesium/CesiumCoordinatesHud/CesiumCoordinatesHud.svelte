<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";

  type Props = {
    /** Number of decimal places for lng/lat (default 4 ≈ 11 m). */
    coordPrecision?: number;
    /** Show the live camera altitude. */
    showCameraHeight?: boolean;
    /** Show the surface elevation under the cursor (terrain must be loaded). */
    showSurfaceElevation?: boolean;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  };

  let {
    coordPrecision = 4,
    showCameraHeight = true,
    showSurfaceElevation = true,
    position = "bottom-left",
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let cursorLng = $state<number | null>(null);
  let cursorLat = $state<number | null>(null);
  let surfaceElevationM = $state<number | null>(null);
  let cameraHeightM = $state<number | null>(null);

  let CesiumMod: typeof import("cesium") | null = null;
  let screenHandler: import("cesium").ScreenSpaceEventHandler | null = null;
  let cameraListener: (() => void) | null = null;

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer) return;
    CesiumMod = await import("cesium");

    cameraListener = () => {
      cameraHeightM = viewer.camera.positionCartographic.height;
    };
    viewer.camera.changed.addEventListener(cameraListener);
    cameraListener();

    screenHandler = new CesiumMod.ScreenSpaceEventHandler(viewer.scene.canvas);
    screenHandler.setInputAction(
      (ev: { endPosition: import("cesium").Cartesian2 }) => {
        if (!viewer || !CesiumMod) return;
        const cartesian =
          viewer.scene.pickPosition(ev.endPosition) ??
          viewer.camera.pickEllipsoid(ev.endPosition, viewer.scene.globe.ellipsoid);
        if (!cartesian) {
          cursorLng = null;
          cursorLat = null;
          surfaceElevationM = null;
          return;
        }
        const carto = CesiumMod.Cartographic.fromCartesian(cartesian);
        cursorLng = CesiumMod.Math.toDegrees(carto.longitude);
        cursorLat = CesiumMod.Math.toDegrees(carto.latitude);
        const surface = viewer.scene.globe.getHeight(carto);
        surfaceElevationM = typeof surface === "number" ? surface : null;
      },
      CesiumMod.ScreenSpaceEventType.MOUSE_MOVE,
    );
  });

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && cameraListener) {
      viewer.camera.changed.removeEventListener(cameraListener);
    }
    if (screenHandler) screenHandler.destroy();
    screenHandler = null;
    cameraListener = null;
  });

  function fmtCoord(value: number | null): string {
    if (value == null) return "—";
    return value.toFixed(coordPrecision);
  }

  function fmtHeight(value: number | null): string {
    if (value == null) return "—";
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)} km`;
    return `${value.toFixed(0)} m`;
  }
</script>

<div class="cy-cesium-hud" data-position={position}>
  <span class="cy-cesium-hud__pair">
    <span class="cy-cesium-hud__label">LON</span>
    <span class="cy-cesium-hud__value">{fmtCoord(cursorLng)}</span>
  </span>
  <span class="cy-cesium-hud__pair">
    <span class="cy-cesium-hud__label">LAT</span>
    <span class="cy-cesium-hud__value">{fmtCoord(cursorLat)}</span>
  </span>
  {#if showSurfaceElevation}
    <span class="cy-cesium-hud__pair">
      <span class="cy-cesium-hud__label">ELEV</span>
      <span class="cy-cesium-hud__value">{fmtHeight(surfaceElevationM)}</span>
    </span>
  {/if}
  {#if showCameraHeight}
    <span class="cy-cesium-hud__pair">
      <span class="cy-cesium-hud__label">CAM</span>
      <span class="cy-cesium-hud__value">{fmtHeight(cameraHeightM)}</span>
    </span>
  {/if}
</div>

<style>
  .cy-cesium-hud {
    position: absolute;
    z-index: 1000;
    display: flex;
    gap: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    background: var(--color-surface-default, rgba(18, 18, 26, 0.85));
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    color: var(--color-text-primary, #f0f0ff);
    backdrop-filter: blur(8px);
    pointer-events: none;
  }
  .cy-cesium-hud[data-position="bottom-left"] {
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-hud[data-position="bottom-right"] {
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-hud[data-position="top-left"] {
    top: 12px;
    left: 12px;
  }
  .cy-cesium-hud[data-position="top-right"] {
    top: 12px;
    right: 12px;
  }
  .cy-cesium-hud__pair {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .cy-cesium-hud__label {
    color: var(--color-text-tertiary, #94a3b8);
    font-size: 10px;
  }
  .cy-cesium-hud__value {
    color: var(--color-action-secondary-default, #00d4ff);
    font-weight: 600;
  }
</style>
