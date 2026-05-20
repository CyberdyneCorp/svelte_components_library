<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { Label } from "../types.js";

  type CustomDataSource = import("cesium").CustomDataSource;

  type Props = {
    labels: Label[];
    visible?: boolean;
    /** Uniform layer opacity 0–1, applied to text + backdrop alpha. */
    opacity?: number;
  };

  let { labels, visible = true, opacity = 1 }: Props = $props();

  const alpha = $derived(Math.max(0, Math.min(1, opacity)));

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let CesiumMod: typeof import("cesium") | null = null;
  let mounted: Label[] = [];

  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-labels");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      syncLabels(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void labels;
    void alpha;
    if (!CesiumMod || !dataSource) return;
    syncLabels(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function syncLabels(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, labels);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`label:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const l of added) addEntity(Cesium, l);
    for (const l of updated) updateEntity(Cesium, l);
    mounted = labels;
  }

  function addEntity(Cesium: typeof import("cesium"), l: Label): void {
    if (!dataSource) return;
    const position =
      typeof l.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(l.lng, l.lat, l.altitudeM)
        : Cesium.Cartesian3.fromDegrees(l.lng, l.lat);
    const cull = l.cullByGlobe ?? true;
    dataSource.entities.add({
      id: `label:${l.id}`,
      position,
      label: {
        text: l.text,
        font: `${l.fontPx ?? 13}px JetBrains Mono, monospace`,
        fillColor: Cesium.Color.fromCssColorString(l.color ?? "#f0f0ff").withAlpha(alpha),
        showBackground: l.showBackground ?? true,
        backgroundColor: Cesium.Color.fromCssColorString(
          l.backgroundColor ?? "#12121a",
        ).withAlpha(0.85 * alpha),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        outlineColor: Cesium.Color.BLACK.withAlpha(alpha),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        heightReference:
          typeof l.altitudeM === "number"
            ? Cesium.HeightReference.NONE
            : Cesium.HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: cull ? undefined : Number.POSITIVE_INFINITY,
      },
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), l: Label): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`label:${l.id}`);
    if (!entity) {
      addEntity(Cesium, l);
      return;
    }
    const position =
      typeof l.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(l.lng, l.lat, l.altitudeM)
        : Cesium.Cartesian3.fromDegrees(l.lng, l.lat);
    entity.position = position as never;
    if (entity.label) {
      entity.label.text = l.text as never;
      entity.label.font = `${l.fontPx ?? 13}px JetBrains Mono, monospace` as never;
      entity.label.fillColor = Cesium.Color.fromCssColorString(
        l.color ?? "#f0f0ff",
      ) as never;
      entity.label.showBackground = (l.showBackground ?? true) as never;
      entity.label.backgroundColor = Cesium.Color.fromCssColorString(
        l.backgroundColor ?? "#12121a",
      ).withAlpha(0.85) as never;
    }
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && dataSource) viewer.dataSources.remove(dataSource, true);
    dataSource = null;
    mounted = [];
  });
</script>
