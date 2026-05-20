<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ImageryProviderSpec } from "../types.js";

  type Props = {
    provider: ImageryProviderSpec;
    visible?: boolean;
    /** Layer opacity 0..1. */
    alpha?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    gamma?: number;
    /**
     * Optional clipping rectangle in degrees. Tiles outside the rectangle
     * are skipped, useful for regional overlays (e.g., a national WMS).
     */
    rectangle?: { west: number; south: number; east: number; north: number };
  };

  let {
    provider,
    visible = true,
    alpha = 1,
    brightness = 1,
    contrast = 1,
    saturation = 1,
    hue = 0,
    gamma = 1,
    rectangle,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let layer: import("cesium").ImageryLayer | null = null;

  // Re-create the layer when the underlying provider changes. Visibility /
  // tonal props are mutated in place on the already-mounted layer.
  $effect(() => {
    const spec = provider;
    const rect = rectangle;
    let cancelled = false;

    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      // Remove the previous layer before mounting the new one so the order
      // index stays stable for siblings.
      if (layer) {
        viewer.imageryLayers.remove(layer, true);
        layer = null;
      }

      const imageryProvider = await buildProvider(Cesium, spec);
      if (cancelled || !imageryProvider) return;

      // Build the layer ourselves so we can pass `rectangle` via constructor
      // options — `ImageryLayer.rectangle` is read-only after construction.
      const layerOptions: import("cesium").ImageryLayer.ConstructorOptions = {};
      if (rect) {
        layerOptions.rectangle = Cesium.Rectangle.fromDegrees(
          rect.west,
          rect.south,
          rect.east,
          rect.north,
        );
      }
      const created = new Cesium.ImageryLayer(imageryProvider, layerOptions);
      viewer.imageryLayers.add(created);
      layer = created;
      applyVisualState();
    })();

    return () => {
      cancelled = true;
    };
  });

  // Cheap tonal updates — no re-creation.
  $effect(() => {
    void visible;
    void alpha;
    void brightness;
    void contrast;
    void saturation;
    void hue;
    void gamma;
    applyVisualState();
  });

  function applyVisualState(): void {
    if (!layer) return;
    layer.show = visible;
    layer.alpha = alpha;
    layer.brightness = brightness;
    layer.contrast = contrast;
    layer.saturation = saturation;
    layer.hue = hue;
    layer.gamma = gamma;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && layer) {
      viewer.imageryLayers.remove(layer, true);
    }
    layer = null;
  });

  async function buildProvider(
    Cesium: typeof import("cesium"),
    spec: ImageryProviderSpec,
  ): Promise<import("cesium").ImageryProvider | null> {
    switch (spec.kind) {
      case "osm":
        return new Cesium.UrlTemplateImageryProvider({
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          credit: spec.credit ?? "© OpenStreetMap contributors",
          maximumLevel: spec.maxLevel ?? 19,
        });

      case "urlTemplate":
        return new Cesium.UrlTemplateImageryProvider({
          url: spec.url,
          maximumLevel: spec.maxLevel,
          minimumLevel: spec.minLevel,
          credit: spec.credit,
          subdomains: spec.subdomains,
        });

      case "wms":
        return new Cesium.WebMapServiceImageryProvider({
          url: spec.url,
          layers: spec.layers,
          parameters: spec.parameters ?? {
            transparent: true,
            format: "image/png",
          },
          credit: spec.credit,
        });

      case "wmts":
        return new Cesium.WebMapTileServiceImageryProvider({
          url: spec.url,
          layer: spec.layer,
          style: spec.style,
          tileMatrixSetID: spec.tileMatrixSetID,
          format: spec.format ?? "image/png",
          credit: spec.credit,
        });

      case "ion":
        try {
          return await Cesium.IonImageryProvider.fromAssetId(spec.assetId);
        } catch (e) {
          console.warn("[ImageryLayer] ion assetId failed", spec.assetId, e);
          return null;
        }

      case "bing":
        // Bing's free direct API was retired; consumers should prefer `ion`
        // with their own Bing asset. This path is a best-effort using the
        // legacy provider for self-hosted Bing tiles.
        return new Cesium.UrlTemplateImageryProvider({
          url:
            "https://ecn.t" +
            (spec.mapStyle ?? "Aerial") +
            ".tiles.virtualearth.net/tiles/r{z}/{x}/{y}?g=14529",
          credit: "© Microsoft / Bing",
          maximumLevel: 19,
        });

      case "arcgis": {
        // ArcGIS access tokens are attached to the Resource itself; the
        // ConstructorOptions surface no longer exposes a `token` field.
        const resource = spec.token
          ? new Cesium.Resource({
              url: spec.url,
              queryParameters: { token: spec.token },
            })
          : spec.url;
        return await Cesium.ArcGisMapServerImageryProvider.fromUrl(resource, {
          credit: spec.credit,
        });
      }
    }
  }
</script>
