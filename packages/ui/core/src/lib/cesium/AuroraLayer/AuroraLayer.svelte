<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { AuroraOval } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;
  type Cesium3 = import("cesium").Cartesian3;

  type Props = {
    ovals: AuroraOval[];
    visible?: boolean;
    /** Hex base colour. Kp 0..9 ramps from base → red as activity rises. */
    baseColor?: string;
  };

  let {
    ovals,
    visible = true,
    baseColor = "#22c55e",
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: AuroraOval[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-aurora");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void ovals;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function kpColor(kp: number | undefined): string {
    if (typeof kp !== "number") return baseColor;
    if (kp <= 3) return baseColor;
    if (kp <= 5) return "#ffb800";
    if (kp <= 7) return "#ff7a1a";
    return "#ef4444";
  }

  function sync(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, ovals);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`aurora:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const o of added) addEntity(Cesium, o);
    for (const o of updated) updateEntity(Cesium, o);
    mounted = ovals;
  }

  function positions(
    Cesium: typeof import("cesium"),
    o: AuroraOval,
  ): Cesium3[] {
    return o.polygon.map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
  }

  function addEntity(Cesium: typeof import("cesium"), o: AuroraOval): void {
    if (!dataSource) return;
    const color = kpColor(o.kp);
    dataSource.entities.add({
      id: `aurora:${o.id}`,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions(Cesium, o)) as never,
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.25) as never,
        outline: true as never,
        outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(
          0.6,
        ) as never,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), o: AuroraOval): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`aurora:${o.id}`);
    if (!entity?.polygon) {
      addEntity(Cesium, o);
      return;
    }
    const color = kpColor(o.kp);
    entity.polygon.hierarchy = new Cesium.PolygonHierarchy(
      positions(Cesium, o),
    ) as never;
    entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(
      0.25,
    ) as never;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
