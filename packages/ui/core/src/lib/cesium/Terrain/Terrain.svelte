<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { TerrainProviderSpec } from "../types.js";

  type Props = {
    /**
     * Which terrain provider to mount. Only one Terrain may be active per
     * `<CesiumGlobe>` at a time (Cesium constraint); the most recent write
     * wins.
     */
    provider: TerrainProviderSpec;
    /** Vertical exaggeration (1 = real). */
    exaggeration?: number;
  };

  let { provider, exaggeration = 1 }: Props = $props();

  const getViewer = useCesiumViewer();
  let previousProvider: import("cesium").TerrainProvider | null = null;
  let mountedProvider: import("cesium").TerrainProvider | null = null;

  $effect(() => {
    const spec = provider;
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      let next: import("cesium").TerrainProvider;
      try {
        next = await resolveProvider(Cesium, spec);
      } catch (e) {
        console.warn("[Terrain] provider failed to load", e);
        return;
      }
      if (cancelled) return;

      // Remember the original provider once so we can restore on unmount even
      // if the consumer swaps `provider` several times mid-life.
      if (previousProvider === null) previousProvider = viewer.terrainProvider;
      viewer.terrainProvider = next;
      mountedProvider = next;
    })();

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    const ex = exaggeration;
    const viewer = getViewer();
    if (!viewer) return;
    viewer.scene.verticalExaggeration = ex;
  });

  onDestroy(() => {
    const viewer = getViewer();
    if (!viewer) return;
    if (previousProvider) viewer.terrainProvider = previousProvider;
    previousProvider = null;
    mountedProvider = null;
  });

  async function resolveProvider(
    Cesium: typeof import("cesium"),
    spec: TerrainProviderSpec,
  ): Promise<import("cesium").TerrainProvider> {
    switch (spec.kind) {
      case "ellipsoid":
        return new Cesium.EllipsoidTerrainProvider({});
      case "world":
        return await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
          requestVertexNormals: spec.requestVertexNormals ?? true,
          requestWaterMask: spec.requestWaterMask ?? false,
        });
      case "ion":
        return await Cesium.CesiumTerrainProvider.fromIonAssetId(spec.assetId);
      case "url":
        return await Cesium.CesiumTerrainProvider.fromUrl(spec.url);
    }
  }
</script>
