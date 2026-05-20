<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type {
    Cesium3DTileStyleSpec,
    Cesium3DTileVisibleHandler,
    TilesetSourceSpec,
  } from "../types.js";

  type Tileset = import("cesium").Cesium3DTileset;
  type TileFeature = import("cesium").Cesium3DTileFeature;
  type Tile = import("cesium").Cesium3DTile;

  type Props = {
    source: TilesetSourceSpec;
    visible?: boolean;
    /** Per-tileset alpha. Multiplies the `color` channel of every feature. */
    opacity?: number;
    /**
     * Screen-space-error threshold. Higher = lower fidelity / faster load.
     * Defaults to Cesium's own (16 for most tilesets, 1 for buildings).
     */
    maximumScreenSpaceError?: number;
    /**
     * Declarative `Cesium3DTileStyle` spec. Compiled into a style object and
     * assigned to `tileset.style`. Re-assigned on prop change.
     */
    style?: Cesium3DTileStyleSpec | null;
    /**
     * Per-feature visit hook. Fires on every tile that becomes visible —
     * iterate `tile.content.featuresLength` and use `content.getFeature(i)`
     * to colour individual features (e.g. building tinting by OSM id).
     */
    onfeature?: Cesium3DTileVisibleHandler;
    onclick?: (feature: TileFeature) => void;
    onready?: (tileset: Tileset) => void;
  };

  let {
    source,
    visible = true,
    opacity = 1,
    maximumScreenSpaceError,
    style = null,
    onfeature,
    onclick,
    onready,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let tileset: Tileset | null = null;
  let tileVisibleHandler:
    | ((tile: import("cesium").Cesium3DTile) => void)
    | null = null;
  let pickHandler: import("cesium").ScreenSpaceEventHandler | null = null;

  // Re-create the tileset when the source kind changes. Keeping the source
  // discriminator in the dep list ensures the user can switch between
  // OSM-buildings / Google / Ion / url cleanly.
  $effect(() => {
    const src = source;
    let cancelled = false;

    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      destroyExistingTileset(viewer);

      let next: Tileset | null = null;
      try {
        next = await buildTileset(Cesium, src);
      } catch (e) {
        console.warn("[Cesium3DTiles] tileset failed to load", e);
        return;
      }
      if (cancelled || !next) {
        next?.destroy?.();
        return;
      }

      viewer.scene.primitives.add(next);
      tileset = next;
      applyConfig();
      installTileVisibleHandler(Cesium);
      installPickHandler(Cesium);
      onready?.(next);
    })();

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void visible;
    void opacity;
    void maximumScreenSpaceError;
    void style;
    applyConfig();
  });

  function applyConfig(): void {
    if (!tileset) return;
    tileset.show = visible;
    if (typeof maximumScreenSpaceError === "number") {
      tileset.maximumScreenSpaceError = maximumScreenSpaceError;
    }
    void applyStyle();
    void applyOpacity();
  }

  async function applyStyle(): Promise<void> {
    if (!tileset) return;
    const Cesium = await import("cesium");
    tileset.style = style
      ? new Cesium.Cesium3DTileStyle(style as Record<string, unknown>)
      : undefined;
  }

  async function applyOpacity(): Promise<void> {
    if (!tileset) return;
    if (opacity >= 1) {
      // Clear any prior alpha mask we may have set; let the source style win.
      if (!style) tileset.style = undefined;
      tileset.makeStyleDirty?.();
      return;
    }
    const Cesium = await import("cesium");
    // Multiply existing color alpha by our opacity — overrides any previous
    // user style; that's the documented tradeoff of using `opacity` and
    // `style` together.
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: `color('#ffffff', ${Math.max(0, Math.min(1, opacity))})`,
    });
    tileset.makeStyleDirty?.();
  }

  function installTileVisibleHandler(Cesium: typeof import("cesium")): void {
    if (!tileset || !onfeature) return;
    tileVisibleHandler = (rawTile) => {
      const tile = rawTile as Tile & {
        content?: {
          featuresLength?: number;
          getFeature?: (i: number) => TileFeature | undefined;
        };
      };
      const content = tile?.content;
      if (!content?.featuresLength || !content.getFeature) return;
      for (let i = 0; i < content.featuresLength; i++) {
        const f = content.getFeature(i);
        if (f) onfeature!(f, rawTile);
      }
    };
    tileset.tileVisible.addEventListener(tileVisibleHandler);
    // The handler also needs to fire once for tiles already loaded when we
    // attach (e.g. when only `onfeature` changes). Touching the style triggers
    // Cesium to re-evaluate visible tiles.
    tileset.makeStyleDirty?.();
    void Cesium;
  }

  function installPickHandler(Cesium: typeof import("cesium")): void {
    const viewer = getViewer();
    if (!viewer || !onclick || pickHandler) return;
    pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    pickHandler.setInputAction((ev: { position: import("cesium").Cartesian2 }) => {
      if (!viewer || !tileset) return;
      const picked = viewer.scene.pick(ev.position) as TileFeature | undefined;
      if (
        picked &&
        typeof (picked as unknown as { getProperty?: unknown }).getProperty ===
          "function" &&
        (picked as unknown as { tileset?: Tileset }).tileset === tileset
      ) {
        onclick!(picked);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function destroyExistingTileset(viewer: import("cesium").Viewer): void {
    if (!tileset) return;
    if (tileVisibleHandler) {
      tileset.tileVisible.removeEventListener(tileVisibleHandler);
      tileVisibleHandler = null;
    }
    viewer.scene.primitives.remove(tileset);
    tileset = null;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer) destroyExistingTileset(viewer);
    if (pickHandler) pickHandler.destroy();
    pickHandler = null;
  });

  async function buildTileset(
    Cesium: typeof import("cesium"),
    spec: TilesetSourceSpec,
  ): Promise<Tileset> {
    switch (spec.kind) {
      case "osm-buildings":
        return await Cesium.createOsmBuildingsAsync();
      case "google-photorealistic": {
        const apiOptions: { key?: string; onlyUsingWithGoogleGeocoder?: true } = {};
        if (spec.apiKey) apiOptions.key = spec.apiKey;
        if (spec.onlyUsingWithGoogleGeocoder) {
          apiOptions.onlyUsingWithGoogleGeocoder = true;
        }
        return await Cesium.createGooglePhotorealistic3DTileset(
          Object.keys(apiOptions).length > 0 ? apiOptions : undefined,
        );
      }
      case "ion":
        return await Cesium.Cesium3DTileset.fromIonAssetId(spec.assetId);
      case "url":
        return await Cesium.Cesium3DTileset.fromUrl(spec.url);
    }
  }
</script>
