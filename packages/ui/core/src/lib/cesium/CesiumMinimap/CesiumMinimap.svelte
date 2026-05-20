<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ViewBBox } from "../types.js";

  type Props = {
    /** Width of the minimap in pixels. Height auto-derives from aspect ratio. */
    width?: number;
    /** Height of the minimap in pixels. */
    height?: number;
    /** Visual position inside the parent CesiumGlobe. */
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    /** Click on the minimap to fly the camera to that lng/lat. */
    clickToFly?: boolean;
    /** Hex colour for the viewport rectangle. */
    viewportColor?: string;
    /** Hex colour for the country outline. */
    outlineColor?: string;
    /** Background hex colour. */
    backgroundColor?: string;
  };

  let {
    width = 192,
    height = 96,
    position = "bottom-right",
    clickToFly = true,
    viewportColor = "#00ff41",
    outlineColor = "rgba(255,255,255,0.25)",
    backgroundColor = "rgba(10,10,15,0.8)",
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let bbox = $state<ViewBBox | null>(null);
  let cameraLng = $state<number | null>(null);
  let cameraLat = $state<number | null>(null);

  let CesiumMod: typeof import("cesium") | null = null;
  let listener: (() => void) | null = null;

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer) return;
    CesiumMod = await import("cesium");

    listener = () => {
      const pos = viewer.camera.positionCartographic;
      cameraLng = CesiumMod!.Math.toDegrees(pos.longitude);
      cameraLat = CesiumMod!.Math.toDegrees(pos.latitude);
      const rect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid);
      if (!rect) {
        bbox = null;
        return;
      }
      bbox = {
        minLng: CesiumMod!.Math.toDegrees(rect.west),
        minLat: CesiumMod!.Math.toDegrees(rect.south),
        maxLng: CesiumMod!.Math.toDegrees(rect.east),
        maxLat: CesiumMod!.Math.toDegrees(rect.north),
      };
    };
    viewer.camera.moveEnd.addEventListener(listener);
    listener();
  });

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && listener) viewer.camera.moveEnd.removeEventListener(listener);
    listener = null;
  });

  // Equirectangular projection: lng/lat → minimap x/y.
  function project(lng: number, lat: number): { x: number; y: number } {
    return {
      x: ((lng + 180) / 360) * width,
      y: ((90 - lat) / 180) * height,
    };
  }

  const viewportRect = $derived.by(() => {
    if (!bbox) return null;
    const { minLng, minLat, maxLng, maxLat } = bbox;
    const a = project(minLng, maxLat);
    const b = project(maxLng, minLat);
    return {
      x: a.x,
      y: a.y,
      w: Math.max(2, Math.min(width, b.x - a.x)),
      h: Math.max(2, Math.min(height, b.y - a.y)),
    };
  });

  const cameraPoint = $derived(
    cameraLng !== null && cameraLat !== null ? project(cameraLng, cameraLat) : null,
  );

  // Bundled, simplified continent paths to draw a recognisable world without
  // shipping a heavy GeoJSON. These are minimal silhouettes derived from
  // public-domain Natural Earth low-res outlines; they're indicative, not
  // cartographically accurate.
  const CONTINENT_PATHS = [
    // North America
    "M30,28 Q24,32 28,42 L34,48 L42,46 L46,40 L52,42 L56,38 L52,30 L48,24 Q40,22 30,28 Z",
    // South America
    "M52,58 L58,56 L62,62 L60,72 L56,80 L52,76 L50,68 Z",
    // Europe
    "M92,30 L100,28 L106,32 L102,38 L96,38 Z",
    // Africa
    "M96,44 L106,42 L110,52 L108,62 L102,68 L96,62 L94,52 Z",
    // Asia
    "M108,28 Q116,26 124,30 L138,32 L148,36 L154,42 L148,46 L138,46 L128,42 L118,40 L110,38 Z",
    // Australia
    "M148,62 L160,62 L162,68 L156,72 L148,70 Z",
  ];

  async function onClick(e: MouseEvent): Promise<void> {
    if (!clickToFly) return;
    const viewer = getViewer();
    if (!viewer || !CesiumMod) return;
    const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const lng = (x / width) * 360 - 180;
    const lat = 90 - (y / height) * 180;
    const heightM = viewer.camera.positionCartographic.height;
    viewer.camera.flyTo({
      destination: CesiumMod.Cartesian3.fromDegrees(lng, lat, heightM),
      duration: 1.2,
    });
  }
</script>

<div
  class="cy-cesium-minimap"
  data-position={position}
  style="--bg: {backgroundColor};"
>
  <svg
    width={width}
    height={height}
    viewBox="0 0 {width} {height}"
    role={clickToFly ? "button" : "img"}
    aria-label="Globe minimap"
    onclick={onClick}
  >
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
    {#each CONTINENT_PATHS as path, i (i)}
      <path d={path} fill="none" stroke={outlineColor} stroke-width="0.6" />
    {/each}
    {#if viewportRect}
      <rect
        x={viewportRect.x}
        y={viewportRect.y}
        width={viewportRect.w}
        height={viewportRect.h}
        fill={viewportColor}
        fill-opacity="0.18"
        stroke={viewportColor}
        stroke-width="1.2"
      />
    {/if}
    {#if cameraPoint}
      <circle cx={cameraPoint.x} cy={cameraPoint.y} r="2.5" fill={viewportColor} />
    {/if}
  </svg>
</div>

<style>
  .cy-cesium-minimap {
    position: absolute;
    z-index: 1000;
    padding: 4px;
    border-radius: 6px;
    background: var(--bg);
    border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(6px);
    line-height: 0;
  }
  .cy-cesium-minimap[data-position="bottom-right"] {
    bottom: 12px;
    right: 12px;
  }
  .cy-cesium-minimap[data-position="bottom-left"] {
    bottom: 12px;
    left: 12px;
  }
  .cy-cesium-minimap[data-position="top-right"] {
    top: 12px;
    right: 12px;
  }
  .cy-cesium-minimap[data-position="top-left"] {
    top: 12px;
    left: 12px;
  }
  .cy-cesium-minimap svg {
    display: block;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
