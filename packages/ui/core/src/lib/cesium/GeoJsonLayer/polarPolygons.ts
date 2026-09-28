type CesiumModule = typeof import("cesium");
type Cartesian3 = import("cesium").Cartesian3;
type PolygonHierarchy = import("cesium").PolygonHierarchy;
type Entity = import("cesium").Entity;

const POLE_EPSILON = 1e-9;

function hierarchyTouchesPole(Cesium: CesiumModule, hierarchy: PolygonHierarchy): boolean {
  const onPole = (p: Cartesian3) => {
    const c = Cesium.Cartographic.fromCartesian(p);
    return !!c && Math.abs(Math.abs(c.latitude) - Cesium.Math.PI_OVER_TWO) < POLE_EPSILON;
  };
  return (
    hierarchy.positions.some(onPole) ||
    (hierarchy.holes ?? []).some((hole) => hierarchyTouchesPole(Cesium, hole))
  );
}

/**
 * GeoJsonDataSource draws polygon edges as rhumb lines. A rhumb line between
 * two vertices on a pole has a NaN length, which crashes Cesium's outline
 * worker ("Invalid array length") and stops rendering for the whole globe —
 * e.g. Antarctica in Natural Earth-style country datasets. Switch only the
 * polygons that touch a pole to geodesic edges; everything else keeps the
 * rhumb default. Returns how many entities were changed.
 */
export function applyGeodesicToPolarPolygons(
  Cesium: CesiumModule,
  entities: readonly Entity[],
): number {
  const now = Cesium.JulianDate.now();
  let changed = 0;
  for (const entity of entities) {
    const polygon = entity.polygon;
    const hierarchy = polygon?.hierarchy?.getValue(now) as PolygonHierarchy | undefined;
    if (!polygon || !hierarchy || !hierarchyTouchesPole(Cesium, hierarchy)) continue;
    polygon.arcType = new Cesium.ConstantProperty(Cesium.ArcType.GEODESIC);
    changed++;
  }
  return changed;
}
