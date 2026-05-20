<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ViewBBox, WaveGridPoint } from "../types.js";

  type Props = {
    /** Sample points covering the area you want wave particles over. */
    grid: WaveGridPoint[];
    /** Optional spawning bbox; defaults to the grid AABB. */
    bbox?: ViewBBox | null;
    visible?: boolean;
    /** How many wave particles to advect each frame. */
    particleCount?: number;
    /** Base step in degrees per tick, scaled by significant wave height. */
    stepDegPerTick?: number;
    /** Per-frame alpha removed from existing trails (destination-out). */
    trailFadeAlpha?: number;
    /** Line width of each particle segment. */
    lineWidth?: number;
    /** Low-Hs hex tint. */
    calmColor?: string;
    /** High-Hs hex tint. */
    stormColor?: string;
  };

  let {
    grid,
    bbox = null,
    visible = true,
    particleCount = 160,
    stepDegPerTick = 0.0005,
    trailFadeAlpha = 0.09,
    lineWidth = 1.2,
    calmColor = "#7dd3fc",
    stormColor = "#a78bfa",
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let canvas: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let resizeObserver: ResizeObserver | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  const calmRgb = $derived(parseHex(calmColor));
  const stormRgb = $derived(parseHex(stormColor));
  let elapsedS = 0;
  let lastTimestamp = 0;

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
    /** Random phase offset so the swell pulses are not all in sync. */
    phaseOffset: number;
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
      p.phaseOffset = 0;
      return;
    }
    p.lng = rand(box.minLng, box.maxLng);
    p.lat = rand(box.minLat, box.maxLat);
    p.age = 0;
    p.maxAge = Math.floor(rand(60, 160));
    p.phaseOffset = Math.random() * Math.PI * 2;
  }

  function seedParticles(): void {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      const p: Particle = {
        lng: 0,
        lat: 0,
        age: 0,
        maxAge: 1,
        phaseOffset: 0,
      };
      resetParticle(p);
      p.age = Math.floor(Math.random() * p.maxAge);
      particles.push(p);
    }
  }

  /** Inverse-distance-weighted sample of (dirDeg, heightM, periodS). */
  function sampleField(
    lng: number,
    lat: number,
  ): { dx: number; dy: number; heightM: number; periodS: number } | null {
    if (grid.length === 0) return null;
    const k = 4;
    const heap: { d2: number; p: WaveGridPoint }[] = [];
    for (const p of grid) {
      const dxn = p.lng - lng;
      const dyn = p.lat - lat;
      const d2 = dxn * dxn + dyn * dyn;
      if (heap.length < k) {
        heap.push({ d2, p });
      } else {
        let worstIdx = 0;
        for (let i = 1; i < k; i++) if (heap[i].d2 > heap[worstIdx].d2) worstIdx = i;
        if (d2 < heap[worstIdx].d2) heap[worstIdx] = { d2, p };
      }
    }
    let total = 0;
    let dxSum = 0;
    let dySum = 0;
    let heightSum = 0;
    let periodSum = 0;
    for (const h of heap) {
      const w = 1 / Math.max(h.d2, 1e-6);
      const rad = (h.p.dirDeg * Math.PI) / 180;
      // Direction wave travels TOWARDS in geographic frame:
      //   north (lat+) corresponds to dirDeg = 0 → dy = +1
      //   east  (lng+) corresponds to dirDeg = 90 → dx = +1
      dxSum += Math.sin(rad) * w;
      dySum += Math.cos(rad) * w;
      heightSum += h.p.heightM * w;
      periodSum += h.p.periodS * w;
      total += w;
    }
    if (total === 0) return null;
    return {
      dx: dxSum / total,
      dy: dySum / total,
      heightM: heightSum / total,
      periodS: Math.max(0.5, periodSum / total),
    };
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

  function tick(timestamp: number): void {
    const viewer = getViewer();
    if (!viewer || !ctx || !canvas || !CesiumMod) {
      raf = requestAnimationFrame(tick);
      return;
    }

    if (lastTimestamp > 0) {
      elapsedS += (timestamp - lastTimestamp) / 1000;
    }
    lastTimestamp = timestamp;

    if (!visible || grid.length === 0 || !activeBBox) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      raf = requestAnimationFrame(tick);
      return;
    }

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
      const speedNorm = Math.min(1, sample.heightM / 4);
      const scale = stepDegPerTick * (1 + speedNorm * 0.8);
      const newLng = p.lng + sample.dx * scale;
      const newLat = p.lat + sample.dy * scale * 0.6;

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
        // Wave-phase pulse: alpha oscillates with the period of the wave.
        const phase = ((elapsedS * 2 * Math.PI) / sample.periodS) + p.phaseOffset;
        const pulse = 0.5 + 0.5 * Math.sin(phase);
        const alpha = (0.2 + pulse * 0.55) * (0.6 + speedNorm * 0.4);
        const [r, g, b] = lerpChannel(calmRgb, stormRgb, speedNorm);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  $effect(() => {
    void activeBBox;
    if (particles.length > 0) seedParticles();
  });

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

<canvas bind:this={canvas} class="cy-cesium-wave" aria-hidden="true"></canvas>

<style>
  .cy-cesium-wave {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
  }
</style>
