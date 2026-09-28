import * as Cesium from "cesium";
import { describe, it, expect } from "vitest";
import { applyGeodesicToPolarPolygons } from "./polarPolygons.js";

// Minimal ring reduced from Antarctica in the geo-countries dataset used by
// the RemoteUrl story: two consecutive vertices on the south pole.
const polarRing = [
  [-165.020804, -90],
  [-180, -90],
  [-180, -88.00554],
  [-165.020804, -90],
];
const normalRing = [
  [-100, 49],
  [-90, 49],
  [-90, 40],
  [-100, 40],
  [-100, 49],
];

function polygon(name: string, ring: number[][]) {
  return {
    type: "Feature",
    properties: { name },
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

function outline(ring: number[][], arcType: Cesium.ArcType) {
  const positions = Cesium.Cartesian3.fromDegreesArray(ring.flat());
  return () =>
    Cesium.PolygonOutlineGeometry.createGeometry(
      Cesium.PolygonOutlineGeometry.fromPositions({ positions, arcType }),
    );
}

async function load(...features: object[]) {
  const source = await Cesium.GeoJsonDataSource.load({ type: "FeatureCollection", features });
  return source.entities.values;
}

const arcTypeOf = (entity: Cesium.Entity) =>
  entity.polygon?.arcType?.getValue(Cesium.JulianDate.now());

describe("applyGeodesicToPolarPolygons", () => {
  it("reproduces the upstream crash it works around", () => {
    expect(outline(polarRing, Cesium.ArcType.RHUMB)).toThrow(/Invalid array length/);
    expect(outline(polarRing, Cesium.ArcType.GEODESIC)).not.toThrow();
  });

  it("switches only pole-touching polygons to geodesic edges", async () => {
    const [polar, normal] = await load(
      polygon("Antarctica", polarRing),
      polygon("Box", normalRing),
    );
    expect(arcTypeOf(polar)).toBe(Cesium.ArcType.RHUMB);

    expect(applyGeodesicToPolarPolygons(Cesium, [polar, normal])).toBe(1);
    expect(arcTypeOf(polar)).toBe(Cesium.ArcType.GEODESIC);
    expect(arcTypeOf(normal)).toBe(Cesium.ArcType.RHUMB);
  });

  it("detects a pole vertex inside a hole", async () => {
    const [entity] = await load({
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [normalRing, polarRing] },
    });
    expect(applyGeodesicToPolarPolygons(Cesium, [entity])).toBe(1);
  });

  it("ignores entities without polygons", async () => {
    const [line] = await load({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [0, -90],
          [10, -80],
        ],
      },
    });
    expect(applyGeodesicToPolarPolygons(Cesium, [line])).toBe(0);
  });
});
