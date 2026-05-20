import type { Viewer } from "cesium";
import type { LngLat, PickedEntity, ScreenPicker, TerrainSampler } from "./types.js";

/**
 * Cesium-backed `TerrainSampler`. Lazy-imports cesium so callers don't pull
 * the WebGL bundle on code paths that never sample terrain.
 *
 * Returns `null` per point when the terrain provider has no height (e.g.,
 * the ellipsoid fallback or an unloaded tile).
 */
export function createTerrainSampler(viewer: Viewer): TerrainSampler {
  async function sampleAll(points: LngLat[]): Promise<(number | null)[]> {
    if (points.length === 0) return [];
    const Cesium = await import("cesium");
    const cartos = points.map((p) =>
      Cesium.Cartographic.fromDegrees(p.lng, p.lat),
    );
    try {
      await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartos);
      return cartos.map((c) =>
        typeof c.height === "number" && Number.isFinite(c.height)
          ? c.height
          : null,
      );
    } catch {
      return points.map(() => null);
    }
  }

  return {
    sampleElevation: async (point) => (await sampleAll([point]))[0] ?? null,
    sampleElevations: sampleAll,
  };
}

/**
 * Cesium-backed `ScreenPicker`. `pickGroundLngLat` prefers terrain-aware
 * picking (`pickPosition`) and falls back to the ellipsoid intersection when
 * the cursor is over sky or transparent imagery.
 */
export function createScreenPicker(viewer: Viewer): ScreenPicker {
  return {
    async pickGroundLngLat(screen) {
      const Cesium = await import("cesium");
      const scene = viewer.scene;
      const cartesian2 = new Cesium.Cartesian2(screen.x, screen.y);

      // Terrain-aware pick first — accounts for elevation if a non-ellipsoid
      // terrain provider is active and the relevant tile is loaded.
      let cartesian3: import("cesium").Cartesian3 | undefined =
        scene.pickPosition(cartesian2);
      if (!cartesian3 || !Number.isFinite(cartesian3.x)) {
        const fallback = viewer.camera.pickEllipsoid(
          cartesian2,
          scene.globe.ellipsoid,
        );
        cartesian3 = fallback ?? undefined;
      }
      if (!cartesian3) return null;

      const carto = Cesium.Cartographic.fromCartesian(cartesian3);
      return {
        lng: Cesium.Math.toDegrees(carto.longitude),
        lat: Cesium.Math.toDegrees(carto.latitude),
      };
    },

    pickEntity(screen) {
      const cartesian2 = { x: screen.x, y: screen.y } as { x: number; y: number };
      const picked = viewer.scene.pick(cartesian2 as never) as
        | {
            id?: unknown;
            primitive?: unknown;
            tileset?: unknown;
            getProperty?: unknown;
          }
        | undefined;
      if (!picked) return null;

      // 3D Tiles feature
      if (typeof (picked as { getProperty?: unknown }).getProperty === "function") {
        return {
          kind: "tile-feature",
          feature: picked as never,
          tileset: (picked as { tileset?: unknown }).tileset as never,
          id: picked,
        } satisfies PickedEntity;
      }

      // Entity in a DataSource
      if (picked.id) {
        return {
          kind: "entity",
          entity: picked.id as never,
          id: picked.id,
        } satisfies PickedEntity;
      }

      // Plain primitive (billboards, polylines added directly to scene.primitives)
      return {
        kind: "primitive",
        id: picked.primitive ?? picked,
      } satisfies PickedEntity;
    },
  };
}
