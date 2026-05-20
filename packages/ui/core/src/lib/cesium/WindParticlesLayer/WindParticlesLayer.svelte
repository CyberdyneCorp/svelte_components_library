<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ViewBBox, WindGridPoint } from "../types.js";

  type Props = {
    /** Sample points covering the area you want particles to advect over. */
    grid: WindGridPoint[];
    /**
     * Optional bounding box. Particles spawn (and respawn) inside this rect.
     * Falls back to the AABB of `grid` when omitted.
     */
    bbox?: ViewBBox | null;
    visible?: boolean;
    /** How many particles to advect each frame. 60 fps target ≈ 180. */
    particleCount?: number;
    /** Base step in degrees per tick. Scaled by wind speed. */
    stepDegPerTick?: number;
    /** Per-frame alpha removed from existing trails (destination-out). */
    trailFadeAlpha?: number;
    /** Line width of each particle segment. */
    lineWidth?: number;
    /** Override base stroke colour. The wind-speed colour ramp uses this as the low-speed tint. */
    coolColor?: string;
    /** Override the high-speed stroke colour. */
    warmColor?: string;
  };

  let {
    grid,
    bbox = null,
    visible = true,
    particleCount = 180,
    stepDegPerTick = 0.0006,
    trailFadeAlpha = 0.1,
    lineWidth = 1,
    coolColor = "#aad2ff",
    warmColor = "#ffe0c8",
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let resizeObserver: ResizeObserver | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  const coolRgb = $derived(parseHex(coolColor));
  const warmRgb = $derived(parseHex(warmColor));

  // Active bbox used to spawn / despawn particles. Derived from `bbox`
  // when set; otherwise computed from the grid AABB.
  let activeBBox: ViewBBox | null = $derived.by(() => {
    if (bbox) return bbox;
    if (grid.length === 0) return null;
    let minLng = grid[0].lng;
    let maxLng = grid[0].lng;
    let minLat = grid[0].lat;
    let maxLat = grid[0].lat;
    for (let i = 1; i < grid.length; i++) {
      const p = grid[i];
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
    }
    return { minLng, minLat, maxLng, maxLat };
  });

  interface Particle {
    lng: number;
    lat: number;
    age: number;
    maxAge: number;
  }
  let particles: Particle[] = [];

  function parseHex(hex: string): [number, number, number] {
    const s = hex.replace("#", "");
    const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
    return [
      parseInt(f.slice(0, 2), 16),
      parseInt(f.slice(2, 4), 16),
      parseInt(f.slice(4, 6), 16),
    ];
  }

  function rand(a: number, b: number): number {
    return a + Math.random() * (b - a);
  }

  function resetParticle(p: Particle): void {
    const box = activeBBox;
    if (!box || grid.length === 0) {
      p.lng = 0;
      p.lat = 0;
      p.age = 0;
      p.maxAge = 1;
      return;
    }
    p.lng = rand(box.minLng, box.maxLng);
    p.lat = rand(box.minLat, box.maxLat);
    p.age = 0;
    p.maxAge = Math.floor(rand(40, 120));
  }

  function seedParticles(): void {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      const p: Particle = { lng: 0, lat: 0, age: 0, maxAge: 1 };
      resetParticle(p);
      p.age = Math.floor(Math.random() * p.maxAge);
      particles.push(p);
    }
  }

  function sampleField(lng: number, lat: number): { u: number; v: number } | null {
    if (grid.length === 0) return null;
    const k = 4;
    const heap: { d2: number; p: WindGridPoint }[] = [];
    for (const p of grid) {
      const dx = p.lng - lng;
      const dy = p.lat - lat;
      const d2 = dx * dx + dy * dy;
      if (heap.length < k) {
        heap.push({ d2, p });
      } else {
        let worstIdx = 0;
        for (let i = 1; i < k; i++) if (heap[i].d2 > heap[worstIdx].d2) worstIdx = i;
        if (d2 < heap[worstIdx].d2) heap[worstIdx] = { d2, p };
      }
    }
    let total = 0;
    let uSum = 0;
    let vSum = 0;
    for (const h of heap) {
      const w = 1 / Math.max(h.d2, 1e-6);
      uSum += h.p.u * w;
      vSum += h.p.v * w;
      total += w;
    }
    if (total === 0) return null;
    return { u: uSum / total, v: vSum / total };
  }

  function fitCanvas(viewer: import("cesium").Viewer): void {
    if (!canvas) return;
    const rect = viewer.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  }

  function lerpChannel(c: [number, number, number], d: [number, number, number], t: number): [number, number, number] {
    return [
      Math.round(c[0] + (d[0] - c[0]) * t),
      Math.round(c[1] + (d[1] - c[1]) * t),
      Math.round(c[2] + (d[2] - c[2]) * t),
    ];
  }

  function tick(): void {
    const viewer = getViewer();
    if (!viewer || !ctx || !canvas || !CesiumMod) {
      raf = requestAnimationFrame(tick);
      return;
    }

    if (!visible || grid.length === 0 || !activeBBox) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(tick);
      return;
    }

    // Fade existing trails by erasing alpha — keeps the underlying globe
    // imagery unaffected.
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0, 0, 0, ${trailFadeAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    for (const p of particles) {
      const sample = sampleField(p.lng, p.lat);
      if (!sample) {
        resetParticle(p);
        continue;
      }
      const speed = Math.sqrt(sample.u * sample.u + sample.v * sample.v);
      const scale = stepDegPerTick * (1 + speed * 0.4);
      const newLng = p.lng + sample.u * scale;
      const newLat = p.lat + sample.v * scale * 0.6;

      const startCart = CesiumMod.Cartesian3.fromDegrees(p.lng, p.lat);
      const endCart = CesiumMod.Cartesian3.fromDegrees(newLng, newLat);
      const start = CesiumMod.SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        startCart,
      );
      const end = CesiumMod.SceneTransforms.worldToWindowCoordinates(
        viewer.scene,
        endCart,
      );
      if (start && end) {
        const t = Math.min(1, speed / 25);
        const [r, g, b] = lerpChannel(coolRgb, warmRgb, t);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.35 + t * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      p.lng = newLng;
      p.lat = newLat;
      p.age++;
      if (
        p.age >= p.maxAge ||
        p.lng < activeBBox.minLng ||
        p.lng > activeBBox.maxLng ||
        p.lat < activeBBox.minLat ||
        p.lat > activeBBox.maxLat
      ) {
        resetParticle(p);
      }
    }

    raf = requestAnimationFrame(tick);
  }

  onMount(async () => {
    const viewer = getViewer();
    if (!viewer || !canvas) return;
    CesiumMod ??= await import("cesium");
    fitCanvas(viewer);
    seedParticles();
    resizeObserver = new ResizeObserver(() => fitCanvas(viewer));
    resizeObserver.observe(viewer.canvas);
    raf = requestAnimationFrame(tick);
  });

  // Re-seed particles when the bbox/grid changes so they live in the new area.
  $effect(() => {
    void activeBBox;
    if (particles.length > 0) seedParticles();
  });

  // Clear when toggled off so stale trails don't persist.
  $effect(() => {
    if (!visible && ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });

  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
    resizeObserver?.disconnect();
    resizeObserver = null;
  });
</script>

<canvas bind:this={canvas} class="cy-cesium-wind" aria-hidden="true"></canvas>

<style>
  .cy-cesium-wind {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
  }
</style>
