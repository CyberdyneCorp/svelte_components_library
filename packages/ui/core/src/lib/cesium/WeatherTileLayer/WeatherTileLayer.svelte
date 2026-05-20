<svelte:options runes={true} />

<script lang="ts" generics="T">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";

  type ImageryLayer = import("cesium").ImageryLayer;

  type Props = {
    /** Timeline values. Each value is converted to a tile URL via urlTemplate. */
    frames: T[];
    /** Build the URL template for a given frame value. `{z}/{y}/{x}` are mandatory. */
    urlTemplate: (frame: T) => string;
    /** Index into `frames` of the currently displayed frame. Bindable. */
    currentFrame?: number;
    /** Auto-advance through frames on a timer. Bindable. */
    playing?: boolean;
    /** Milliseconds between frame advances when playing. */
    intervalMs?: number;
    /** Crossfade duration when switching frames. Pass 0 to swap instantly. */
    crossfadeMs?: number;
    /** Loop back to frame 0 when the end is reached. */
    loop?: boolean;
    visible?: boolean;
    /** Max alpha applied to the active layer (lets you scale the whole timeline). */
    alpha?: number;
    /** Max tile pyramid level used by the underlying UrlTemplateImageryProvider. */
    maxLevel?: number;
    credit?: string;
    /** Fires after the layer crossfade has actually swapped to the new frame. */
    onframe?: (frame: T, index: number) => void;
  };

  let {
    frames,
    urlTemplate,
    currentFrame = $bindable(0),
    playing = $bindable(false),
    intervalMs = 1000,
    crossfadeMs = 350,
    loop = true,
    visible = true,
    alpha = 1,
    maxLevel,
    credit,
    onframe,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let CesiumMod: typeof import("cesium") | null = null;

  // Two-slot crossfade. `active` is what the user currently sees; `incoming`
  // is the in-flight new frame being faded in. Once the fade completes,
  // `active` is removed and `incoming` becomes `active`.
  let activeLayer: ImageryLayer | null = null;
  let incomingLayer: ImageryLayer | null = null;
  let activeFrameIndex = -1;
  let fadeAnimationId: number | null = null;
  let advanceTimer: number | null = null;

  // Re-mount the active layer when the URL template, frames, or currentFrame change.
  $effect(() => {
    void urlTemplate;
    void frames;
    const idx = currentFrame;
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled) return;
      if (idx < 0 || idx >= frames.length) return;
      if (idx === activeFrameIndex && activeLayer) return;
      await displayFrame(Cesium, viewer, idx);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (activeLayer) activeLayer.show = visible;
    if (incomingLayer) incomingLayer.show = visible;
  });

  // Drive auto-advance.
  $effect(() => {
    const isPlaying = playing;
    if (!isPlaying || frames.length <= 1) {
      if (advanceTimer != null) {
        clearInterval(advanceTimer);
        advanceTimer = null;
      }
      return;
    }
    if (advanceTimer != null) clearInterval(advanceTimer);
    advanceTimer = window.setInterval(() => {
      advanceFrame();
    }, Math.max(50, intervalMs));
    return () => {
      if (advanceTimer != null) {
        clearInterval(advanceTimer);
        advanceTimer = null;
      }
    };
  });

  function advanceFrame(): void {
    if (frames.length === 0) return;
    const next = currentFrame + 1;
    if (next >= frames.length) {
      if (loop) {
        currentFrame = 0;
      } else {
        playing = false;
      }
      return;
    }
    currentFrame = next;
  }

  async function displayFrame(
    Cesium: typeof import("cesium"),
    viewer: import("cesium").Viewer,
    idx: number,
  ): Promise<void> {
    const value = frames[idx];
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: urlTemplate(value),
      maximumLevel: maxLevel,
      credit,
    });

    // First mount: there is no active layer to fade from — just add and
    // ramp from 0 → alpha so it doesn't pop in.
    if (!activeLayer) {
      const layer = new Cesium.ImageryLayer(provider, {});
      viewer.imageryLayers.add(layer);
      layer.show = visible;
      layer.alpha = 0;
      activeLayer = layer;
      activeFrameIndex = idx;
      tweenAlpha(layer, alpha, crossfadeMs, () => {
        onframe?.(value, idx);
      });
      return;
    }

    // Subsequent frames: build the incoming layer, fade it in while fading
    // the old one out, then swap.
    if (incomingLayer) {
      // Mid-flight transition: cancel the previous fade, drop the half-faded
      // incoming layer in favour of the latest target.
      viewer.imageryLayers.remove(incomingLayer, true);
      incomingLayer = null;
    }

    const incoming = new Cesium.ImageryLayer(provider, {});
    viewer.imageryLayers.add(incoming);
    incoming.show = visible;
    incoming.alpha = 0;
    incomingLayer = incoming;

    const previous = activeLayer;
    const previousIdx = activeFrameIndex;
    activeLayer = incoming;
    activeFrameIndex = idx;

    tweenAlpha(
      incoming,
      alpha,
      crossfadeMs,
      () => {
        if (incomingLayer === incoming) incomingLayer = null;
        onframe?.(value, idx);
      },
      previous,
      () => {
        if (previous) viewer.imageryLayers.remove(previous, true);
        void previousIdx;
      },
    );
  }

  /**
   * Tween `incomingLayer.alpha` from its current value to `targetAlpha` over
   * `durationMs`. Optionally tweens a paired `fadeOutLayer` from its current
   * alpha down to 0 in the same window.
   */
  function tweenAlpha(
    incomingLayer: ImageryLayer,
    targetAlpha: number,
    durationMs: number,
    onComplete: () => void,
    fadeOutLayer?: ImageryLayer | null,
    onFadeOutComplete?: () => void,
  ): void {
    if (fadeAnimationId != null) cancelAnimationFrame(fadeAnimationId);
    if (durationMs <= 0) {
      incomingLayer.alpha = targetAlpha;
      if (fadeOutLayer) fadeOutLayer.alpha = 0;
      onComplete();
      onFadeOutComplete?.();
      return;
    }
    const startAlpha = incomingLayer.alpha;
    const startFadeOut = fadeOutLayer?.alpha ?? 0;
    const startedAt = performance.now();

    const step = (now: number): void => {
      const t = Math.min(1, (now - startedAt) / durationMs);
      incomingLayer.alpha = startAlpha + (targetAlpha - startAlpha) * t;
      if (fadeOutLayer) fadeOutLayer.alpha = startFadeOut * (1 - t);
      if (t < 1) {
        fadeAnimationId = requestAnimationFrame(step);
      } else {
        fadeAnimationId = null;
        onComplete();
        onFadeOutComplete?.();
      }
    };
    fadeAnimationId = requestAnimationFrame(step);
  }

  onDestroy(() => {
    if (fadeAnimationId != null) cancelAnimationFrame(fadeAnimationId);
    if (advanceTimer != null) clearInterval(advanceTimer);
    const viewer = getViewer();
    if (viewer) {
      if (activeLayer) viewer.imageryLayers.remove(activeLayer, true);
      if (incomingLayer) viewer.imageryLayers.remove(incomingLayer, true);
    }
    activeLayer = null;
    incomingLayer = null;
    activeFrameIndex = -1;
  });
</script>
