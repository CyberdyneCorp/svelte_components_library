<svelte:options runes={true} />

<script lang="ts">
  /**
   * Standalone rotating globe + satellites loader. Self-contained: fetches a
   * Natural Earth 1:110m TopoJSON from a CDN on first mount, then draws via 2D
   * canvas. No Cesium / WebGL dependency — keeps cold-boot light. Falls back to
   * a graticule-only globe if the TopoJSON can't be fetched.
   */
  import { onDestroy } from "svelte";

  type Props = {
    /** Pixel size of the square stage. */
    size?: number;
    /** Land + graticule stroke colour (any CSS colour). */
    ink?: string;
    /** Background colour used for satellite glyph cut-outs. */
    background?: string;
    /** TopoJSON URL providing a `land` object. Defaults to world-atlas CDN. */
    topoJsonUrl?: string;
    /** Neon drop-shadow bloom around the globe. */
    glow?: boolean;
    /** Allow drag-to-spin. When false the globe auto-rotates only. */
    interactive?: boolean;
  };

  let {
    size = 360,
    ink = "#1b1a17",
    background = "#f1ede4",
    topoJsonUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json",
    glow = true,
    interactive = true,
  }: Props = $props();

  const browser = typeof document !== "undefined";

  let canvas: HTMLCanvasElement | undefined = $state();
  let cleanup: () => void = () => {};
  let cachedLandRings: number[][][] | null = null;

  $effect(() => {
    if (!browser || !canvas) return;
    cleanup();
    const c = canvas;
    const s = size;
    let active = true;
    void initGlobe(c, s).then((dispose) => {
      if (active) cleanup = dispose;
      else dispose();
    });
    return () => {
      active = false;
    };
  });

  onDestroy(() => cleanup());

  async function initGlobe(
    canvasEl: HTMLCanvasElement,
    sz: number,
  ): Promise<() => void> {
    const maybeCtx = canvasEl.getContext("2d");
    if (!maybeCtx) return () => {};
    const ctx: CanvasRenderingContext2D = maybeCtx;
    const DPR = 2;
    canvasEl.width = sz * DPR;
    canvasEl.height = sz * DPR;
    const CX = sz / 2;
    const CY = sz / 2;
    const R = Math.max(40, Math.floor(sz / 2 - 30));

    const INK = ink;
    const BG = background;
    const inkRgb = parseColorToRgb(INK);
    const INK_FAINT = `rgba(${inkRgb}, 0.18)`;
    const INK_SOFT = `rgba(${inkRgb}, 0.55)`;
    const INK_VEIL = `rgba(${inkRgb}, 0.04)`;

    ctx.scale(DPR, DPR);

    let landRings: number[][][] = cachedLandRings ?? [];
    if (!cachedLandRings) {
      try {
        const res = await fetch(topoJsonUrl);
        if (res.ok) {
          const topo = await res.json();
          landRings = decodeTopology(topo, "land");
          cachedLandRings = landRings;
        }
      } catch {
        // Graticule-only fallback is fine.
      }
    }

    interface Sat {
      a: number;
      inc: number;
      node: number;
      period: number;
      phase: number;
      size: number;
      kind: "cube" | "dish" | "panel" | "probe";
      dir: 1 | -1;
    }
    const SATS: Sat[] = (
      [
        { a: R + 12, inc: 20, node: 10, period: 5200, phase: 0.0, size: 6.5, kind: "panel", dir: 1 },
        { a: R + 20, inc: -55, node: 60, period: 7800, phase: 1.7, size: 5.0, kind: "dish", dir: -1 },
        { a: R + 26, inc: 72, node: 130, period: 9600, phase: 3.2, size: 4.2, kind: "cube", dir: 1 },
        { a: R + 16, inc: 100, node: -40, period: 6300, phase: 4.8, size: 3.6, kind: "probe", dir: 1 },
        { a: R + 28, inc: -25, node: 200, period: 11500, phase: 2.1, size: 5.6, kind: "panel", dir: -1 },
      ] as const
    ).map((s) => ({
      ...s,
      inc: (s.inc * Math.PI) / 180,
      node: (s.node * Math.PI) / 180,
    }));

    const PERIOD_MS = 14000;
    const REST_TILT = (-18 * Math.PI) / 180;
    const TILT_LIMIT = (80 * Math.PI) / 180;
    let yaw = 0;
    let tilt = REST_TILT;
    let isDragging = false;
    let lastT = performance.now();
    let yawVel = (Math.PI * 2) / (PERIOD_MS / 1000);
    let tiltVel = 0;
    const start = lastT;
    let raf = 0;
    let running = true;

    function frame(now: number) {
      if (!running) return;
      const dt = (now - lastT) / 1000;
      lastT = now;
      if (!isDragging) {
        yaw += yawVel * dt;
        const baseline = (Math.PI * 2) / (PERIOD_MS / 1000);
        yawVel += (baseline - yawVel) * Math.min(1, dt * 1.5);
        tilt += tiltVel * dt;
        tilt += (REST_TILT - tilt) * Math.min(1, dt * 1.4);
        tiltVel *= Math.exp(-dt * 4);
      }
      yaw = ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      draw(yaw, now - start, tilt);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    let lastX = 0;
    let lastY = 0;
    let lastMoveT = 0;
    const SENS = 0.0085;

    function onPointerDown(e: PointerEvent) {
      isDragging = true;
      canvasEl.classList.add("cy-globe-loader__canvas--dragging");
      canvasEl.setPointerCapture(e.pointerId);
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveT = performance.now();
      yawVel = 0;
      tiltVel = 0;
      e.preventDefault();
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(1, now - lastMoveT) / 1000;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveT = now;
      yaw += dx * SENS;
      tilt = clamp(tilt - dy * SENS, -TILT_LIMIT, TILT_LIMIT);
      yawVel = (dx * SENS) / dt;
      tiltVel = (-dy * SENS) / dt;
    }
    function onPointerUp(e: PointerEvent) {
      if (!isDragging) return;
      isDragging = false;
      canvasEl.classList.remove("cy-globe-loader__canvas--dragging");
      try {
        canvasEl.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
    }
    if (interactive) {
      canvasEl.addEventListener("pointerdown", onPointerDown);
      canvasEl.addEventListener("pointermove", onPointerMove);
      canvasEl.addEventListener("pointerup", onPointerUp);
      canvasEl.addEventListener("pointercancel", onPointerUp);
      canvasEl.addEventListener("pointerleave", onPointerUp);
    }

    function clamp(v: number, a: number, b: number): number {
      return Math.min(b, Math.max(a, v));
    }

    function draw(yawNow: number, t: number, tiltNow: number) {
      ctx.clearRect(0, 0, sz, sz);
      interface SatRender {
        s: Sat;
        p: ReturnType<typeof satPosition>;
      }
      const back: SatRender[] = [];
      const front: SatRender[] = [];
      for (const s of SATS) {
        const p = satPosition(s, t);
        (p.z >= 0 ? front : back).push({ s, p });
      }
      for (const s of SATS) drawOrbitPath(s);
      for (const { s, p } of back) drawSatellite(s, p, t, true);
      drawGlobe(yawNow, tiltNow);
      drawWhirlRings(t);
      front.sort((a, b) => a.p.z - b.p.z);
      for (const { s, p } of front) drawSatellite(s, p, t, false);
    }

    function drawGlobe(yawNow: number, tiltNow: number) {
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = INK_VEIL;
      ctx.fill();
      ctx.strokeStyle = INK_FAINT;
      ctx.lineWidth = 0.9;
      drawGraticule(yawNow, tiltNow);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const ring of landRings) drawRing(ring, yawNow, tiltNow);
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.0;
      ctx.stroke();
    }

    function drawWhirlRings(t: number) {
      const rings: Array<{
        offset: number;
        width: number;
        dash: [number, number];
        speed: number;
        alpha: number;
      }> = [
        { offset: 6, width: 2.0, dash: [12, 6], speed: 0.4, alpha: 0.95 },
        { offset: 16, width: 1.4, dash: [8, 8], speed: -0.28, alpha: 0.7 },
        { offset: 26, width: 1.0, dash: [4, 8], speed: 0.18, alpha: 0.45 },
      ];
      for (const ring of rings) {
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate((t / 1000) * ring.speed);
        ctx.beginPath();
        ctx.arc(0, 0, R + ring.offset, 0, Math.PI * 2);
        ctx.strokeStyle = INK;
        ctx.globalAlpha = ring.alpha;
        ctx.lineWidth = ring.width;
        ctx.setLineDash(ring.dash);
        ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    function drawOrbitPath(s: Sat) {
      ctx.save();
      ctx.beginPath();
      let moved = false;
      const STEPS = 96;
      for (let i = 0; i <= STEPS; i++) {
        const th = (i / STEPS) * Math.PI * 2;
        const px = Math.cos(th) * s.a;
        const py = Math.sin(th) * s.a;
        const w = rotateXY(rotateX([px, py, 0], s.inc), s.node);
        const x = CX + w[0];
        const y = CY - w[1];
        const z = w[2];
        if (z < 0) {
          moved = false;
          continue;
        }
        if (!moved) {
          ctx.moveTo(x, y);
          moved = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = INK;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function project(
      lon: number,
      lat: number,
      yawNow: number,
      tiltNow: number,
    ): [number, number, number] | null {
      const lr = (lon * Math.PI) / 180 + yawNow;
      const ph = (lat * Math.PI) / 180;
      const cph = Math.cos(ph);
      const sph = Math.sin(ph);
      const x = cph * Math.sin(lr);
      const y = sph;
      const z = cph * Math.cos(lr);
      const ct = Math.cos(tiltNow);
      const st = Math.sin(tiltNow);
      const y2 = y * ct - z * st;
      const z2 = y * st + z * ct;
      if (z2 < 0) return null;
      return [CX + x * R, CY - y2 * R, z2];
    }

    function drawRing(ring: number[][], yawNow: number, tiltNow: number) {
      let started = false;
      let prev: [number, number, number] | null = null;
      ctx.beginPath();
      for (const [lon, lat] of ring) {
        const p = project(lon, lat, yawNow, tiltNow);
        if (!p) {
          prev = null;
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p[0], p[1]);
          started = true;
        } else if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) > R) {
          ctx.moveTo(p[0], p[1]);
        } else {
          ctx.lineTo(p[0], p[1]);
        }
        prev = p;
      }
      ctx.stroke();
    }

    function drawGraticule(yawNow: number, tiltNow: number) {
      for (let lon = -180; lon < 180; lon += 30) {
        const ring: number[][] = [];
        for (let lat = -80; lat <= 80; lat += 4) ring.push([lon, lat]);
        drawRing(ring, yawNow, tiltNow);
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        if (lat === 0) continue;
        const ring: number[][] = [];
        for (let lon = -180; lon <= 180; lon += 4) ring.push([lon, lat]);
        drawRing(ring, yawNow, tiltNow);
      }
      ctx.save();
      ctx.strokeStyle = INK_SOFT;
      ctx.lineWidth = 0.7;
      const eq: number[][] = [];
      for (let lon = -180; lon <= 180; lon += 3) eq.push([lon, 0]);
      drawRing(eq, yawNow, tiltNow);
      ctx.restore();
    }

    interface SatPos {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
    }
    function satPosition(s: Sat, t: number): SatPos {
      const theta = s.dir * (t / s.period) * Math.PI * 2 + s.phase;
      const px = Math.cos(theta) * s.a;
      const py = Math.sin(theta) * s.a;
      const tx = -Math.sin(theta) * s.dir;
      const ty = Math.cos(theta) * s.dir;
      const w1 = rotateXY(rotateX([px, py, 0], s.inc), s.node);
      const w2 = rotateXY(rotateX([tx, ty, 0], s.inc), s.node);
      return { x: CX + w1[0], y: CY - w1[1], z: w1[2], vx: w2[0], vy: -w2[1] };
    }

    function rotateX([x, y, z]: number[], a: number): number[] {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return [x, y * c - z * s, y * s + z * c];
    }
    function rotateXY([x, y, z]: number[], a: number): number[] {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return [x * c - y * s, x * s + y * c, z];
    }

    function drawSatellite(s: Sat, p: SatPos, t: number, behind: boolean) {
      const heading = Math.atan2(p.vy, p.vx);
      if (!behind) drawTail(s, t);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(heading);
      if (behind) ctx.globalAlpha = 0.18;
      drawGlyph(s.kind, s.size, BG);
      ctx.restore();
    }

    function drawTail(s: Sat, t: number) {
      const STEPS = 26;
      const STEP_MS = s.period / 80;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < STEPS; i++) {
        const a = satPosition(s, t - i * STEP_MS);
        const b = satPosition(s, t - (i + 1) * STEP_MS);
        if (a.z < 0 || b.z < 0) continue;
        const f = 1 - i / STEPS;
        ctx.strokeStyle = INK;
        ctx.globalAlpha = 0.85 * f * f;
        ctx.lineWidth = Math.max(0.5, 1.8 * f);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function drawGlyph(kind: Sat["kind"], glyphSize: number, bg: string) {
      ctx.fillStyle = INK;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      if (kind === "cube") {
        ctx.beginPath();
        ctx.rect(-glyphSize / 2, -glyphSize / 2, glyphSize, glyphSize);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(glyphSize / 2, 0);
        ctx.lineTo(glyphSize / 2 + glyphSize * 0.6, 0);
        ctx.stroke();
        return;
      }
      if (kind === "panel") {
        const bw = glyphSize * 0.9;
        const bh = glyphSize * 0.7;
        ctx.beginPath();
        ctx.rect(-bw / 2, -bh / 2, bw, bh);
        ctx.fill();
        const pw = glyphSize * 1.6;
        const ph = glyphSize * 0.45;
        ctx.beginPath();
        ctx.rect(-bw / 2 - pw - 1, -ph / 2, pw, ph);
        ctx.rect(bw / 2 + 1, -ph / 2, pw, ph);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return;
      }
      if (kind === "dish") {
        ctx.beginPath();
        ctx.arc(0, 0, glyphSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(glyphSize * 0.55, 0, glyphSize * 0.7, -Math.PI * 0.55, Math.PI * 0.55);
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(glyphSize * 0.55, 0);
        ctx.stroke();
        return;
      }
      const h = glyphSize * 0.7;
      ctx.beginPath();
      ctx.moveTo(h, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(-h, 0);
      ctx.lineTo(0, -h);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-h, 0);
      ctx.lineTo(-h - glyphSize * 0.9, 0);
      ctx.stroke();
    }

    interface Topology {
      objects: Record<string, Geometry>;
      arcs: number[][][];
      transform: { scale: [number, number]; translate: [number, number] };
    }
    interface Geometry {
      type: string;
      geometries?: Geometry[];
      arcs?: number[][][] | number[][];
    }
    function decodeTopology(topo: Topology, objectName: string): number[][][] {
      const obj = topo.objects[objectName];
      const tr = topo.transform;
      const sx = tr.scale[0];
      const sy = tr.scale[1];
      const tx = tr.translate[0];
      const ty = tr.translate[1];
      const decoded: number[][][] = topo.arcs.map((arc: number[][]) => {
        let x = 0;
        let y = 0;
        const out: number[][] = [];
        for (const [dx, dy] of arc) {
          x += dx;
          y += dy;
          out.push([x * sx + tx, y * sy + ty]);
        }
        return out;
      });
      function arcToCoords(idx: number): number[][] {
        if (idx >= 0) return decoded[idx];
        const a = decoded[~idx];
        return [...a].reverse();
      }
      function ringToCoords(arcIdxs: number[]): number[][] {
        const coords: number[][] = [];
        for (let i = 0; i < arcIdxs.length; i++) {
          const seg = arcToCoords(arcIdxs[i]);
          const startAt = i === 0 ? 0 : 1;
          for (let j = startAt; j < seg.length; j++) coords.push(seg[j]);
        }
        return coords;
      }
      const rings: number[][][] = [];
      const collect = (g: Geometry | undefined) => {
        if (!g) return;
        if (g.type === "GeometryCollection") g.geometries?.forEach(collect);
        else if (g.type === "Polygon")
          for (const r of g.arcs as number[][])
            rings.push(ringToCoords(r as unknown as number[]));
        else if (g.type === "MultiPolygon")
          for (const poly of g.arcs as number[][][])
            for (const r of poly) rings.push(ringToCoords(r as unknown as number[]));
      };
      collect(obj);
      return rings;
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointercancel", onPointerUp);
      canvasEl.removeEventListener("pointerleave", onPointerUp);
    };
  }

  function parseColorToRgb(input: string): string {
    const s = input.trim();
    if (s.startsWith("#")) {
      const hex = s.slice(1);
      const full =
        hex.length === 3
          ? hex.split("").map((c) => c + c).join("")
          : hex.padEnd(6, "0").slice(0, 6);
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return `${r}, ${g}, ${b}`;
    }
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (m) {
      return m[1].split(",").map((p) => p.trim()).slice(0, 3).join(", ");
    }
    return "27, 26, 23";
  }
</script>

<div
  class="cy-globe-loader"
  style="--cy-globe-loader-size: {size}px;"
  aria-label="Loading"
  role="status"
>
  <canvas
    bind:this={canvas}
    class="cy-globe-loader__canvas"
    class:cy-globe-loader__canvas--glow={glow}
    width={size}
    height={size}
    aria-hidden="true"
  ></canvas>
</div>

<style>
  .cy-globe-loader {
    width: var(--cy-globe-loader-size);
    height: var(--cy-globe-loader-size);
    position: relative;
    display: grid;
    place-items: center;
    animation: cy-globe-loader-breathe 4.6s ease-in-out infinite;
    user-select: none;
  }
  .cy-globe-loader__canvas {
    position: absolute;
    inset: 0;
    width: var(--cy-globe-loader-size);
    height: var(--cy-globe-loader-size);
    cursor: grab;
    touch-action: none;
    image-rendering: -webkit-optimize-contrast;
  }
  .cy-globe-loader__canvas--glow {
    filter: drop-shadow(0 0 2px rgba(180, 255, 200, 0.95))
      drop-shadow(0 0 8px rgba(0, 255, 120, 0.65))
      drop-shadow(0 0 22px rgba(0, 255, 100, 0.45))
      drop-shadow(0 0 48px rgba(0, 255, 90, 0.25));
  }
  /* Added at runtime via classList, so the class is unscoped — match it globally. */
  :global(.cy-globe-loader__canvas--dragging) {
    cursor: grabbing;
  }
  @keyframes cy-globe-loader-breathe {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.01);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cy-globe-loader {
      animation: none;
    }
  }
</style>
