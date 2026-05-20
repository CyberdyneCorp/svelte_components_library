<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import { cropPlant } from "../glyphs.js";
  import type { Farm } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;

  type Props = {
    farms: Farm[];
    visible?: boolean;
    selectedId?: string | null;
    /** Cluster nearby farms below this pixel range. */
    clusterPixelRange?: number;
    /** Minimum cluster size before grouping kicks in. */
    minimumClusterSize?: number;
    /** Hex colour by crop. */
    colorByCrop?: Partial<Record<string, string>>;
    defaultColor?: string;
    onclick?: (farm: Farm) => void;
  };

  const DEFAULT_COLORS: Record<string, string> = {
    corn: "#ffb800",
    wheat: "#fde047",
    rice: "#22c55e",
    soybean: "#84cc16",
    coffee: "#a16207",
    other: "#9ca3af",
  };

  let {
    farms,
    visible = true,
    selectedId = $bindable(null),
    clusterPixelRange = 60,
    minimumClusterSize = 3,
    colorByCrop,
    defaultColor = "#22c55e",
    onclick,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let handler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: Farm[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-farms");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      dataSource.clustering.enabled = true;
      dataSource.clustering.pixelRange = clusterPixelRange;
      dataSource.clustering.minimumClusterSize = minimumClusterSize;
      installPickHandler(Cesium, viewer);
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void farms;
    void colorByCrop;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (!dataSource) return;
    dataSource.show = visible;
    dataSource.clustering.pixelRange = clusterPixelRange;
    dataSource.clustering.minimumClusterSize = minimumClusterSize;
  });

  function sync(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, farms);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`farm:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const f of added) addEntity(Cesium, f);
    for (const f of updated) updateEntity(Cesium, f);
    mounted = farms;
  }

  function colorFor(f: Farm): string {
    const crop = f.crop ?? "other";
    return colorByCrop?.[crop] ?? DEFAULT_COLORS[crop] ?? defaultColor;
  }

  function addEntity(Cesium: typeof import("cesium"), f: Farm): void {
    if (!dataSource) return;
    const color = colorFor(f);
    dataSource.entities.add({
      id: `farm:${f.id}`,
      position: Cesium.Cartesian3.fromDegrees(f.lng, f.lat),
      billboard: {
        image: cropPlant(color),
        width: 22,
        height: 22,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), f: Farm): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`farm:${f.id}`);
    if (!entity) {
      addEntity(Cesium, f);
      return;
    }
    entity.position = Cesium.Cartesian3.fromDegrees(f.lng, f.lat) as never;
    if (entity.billboard) {
      entity.billboard.image = cropPlant(colorFor(f)) as never;
    }
  }

  function installPickHandler(
    Cesium: typeof import("cesium"),
    viewer: import("cesium").Viewer,
  ): void {
    if (handler || !onclick) return;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
      (ev: { position: Cartesian2 }) => {
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const id =
          typeof (picked?.id as Entity & { id?: string })?.id === "string"
            ? (picked!.id as Entity & { id: string }).id
            : "";
        if (!id.startsWith("farm:")) return;
        const key = id.slice("farm:".length);
        const f = farms.find((x) => x.id === key);
        if (!f) return;
        selectedId = key;
        onclick?.(f);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (handler) {
      handler.destroy();
      handler = null;
    }
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
