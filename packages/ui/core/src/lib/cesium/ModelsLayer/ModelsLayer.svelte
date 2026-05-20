<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { ModelEntity } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;
  type Cesium3 = import("cesium").Cartesian3;
  type CesiumModule = typeof import("cesium");

  type Props = {
    /** Controlled list of models. */
    models: ModelEntity[];
    visible?: boolean;
    /** Bindable id of the model the user clicked most recently. */
    selectedId?: string | null;
    /** Default `minimumPixelSize` applied when an entry omits it. */
    defaultMinimumPixelSize?: number;
    /** Default scale when an entry omits `scale`. */
    defaultScale?: number;
    onclick?: (model: ModelEntity) => void;
  };

  let {
    models,
    visible = true,
    selectedId = $bindable(null),
    defaultMinimumPixelSize = 64,
    defaultScale = 1,
    onclick,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let handler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: CesiumModule | null = null;
  let mounted: ModelEntity[] = [];

  // Mount once.
  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource("cy-cesium-models");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installPickHandler(Cesium, viewer);
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void models;
    void selectedId;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function sync(Cesium: CesiumModule): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, models);
    for (const id of removedIds) {
      const e = dataSource.entities.getById(`model:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const m of added) addEntity(Cesium, m);
    for (const m of updated) updateEntity(Cesium, m);
    mounted = models;
  }

  function position(Cesium: CesiumModule, m: ModelEntity): Cesium3 {
    return typeof m.altitudeM === "number"
      ? Cesium.Cartesian3.fromDegrees(m.lng, m.lat, m.altitudeM)
      : Cesium.Cartesian3.fromDegrees(m.lng, m.lat);
  }

  function orientation(
    Cesium: CesiumModule,
    m: ModelEntity,
    pos: Cesium3,
  ): import("cesium").Quaternion {
    const hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(m.headingDeg ?? 0),
      Cesium.Math.toRadians(m.pitchDeg ?? 0),
      Cesium.Math.toRadians(m.rollDeg ?? 0),
    );
    return Cesium.Transforms.headingPitchRollQuaternion(pos, hpr);
  }

  function modelGraphics(
    Cesium: CesiumModule,
    m: ModelEntity,
  ): import("cesium").ModelGraphics.ConstructorOptions {
    const opts: import("cesium").ModelGraphics.ConstructorOptions = {
      uri: m.url,
      scale: m.scale ?? defaultScale,
      minimumPixelSize: m.minimumPixelSize ?? defaultMinimumPixelSize,
    };
    if (typeof m.maximumScale === "number") opts.maximumScale = m.maximumScale;
    if (m.tintColor) {
      opts.color = Cesium.Color.fromCssColorString(m.tintColor);
      opts.colorBlendMode = Cesium.ColorBlendMode.MIX;
      opts.colorBlendAmount = m.tintAmount ?? 0.5;
    }
    if (m.silhouetteColor) {
      opts.silhouetteColor = Cesium.Color.fromCssColorString(m.silhouetteColor);
      opts.silhouetteSize = m.silhouetteSize ?? 2;
    }
    return opts;
  }

  function addEntity(Cesium: CesiumModule, m: ModelEntity): void {
    if (!dataSource) return;
    const pos = position(Cesium, m);
    dataSource.entities.add({
      id: `model:${m.id}`,
      position: pos,
      orientation: orientation(Cesium, m, pos) as never,
      model: modelGraphics(Cesium, m),
      // When no explicit altitude is provided, clamp the model's base to terrain.
      ...(typeof m.altitudeM !== "number"
        ? {
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          }
        : {}),
    });
  }

  function updateEntity(Cesium: CesiumModule, m: ModelEntity): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`model:${m.id}`);
    if (!entity) {
      addEntity(Cesium, m);
      return;
    }
    const pos = position(Cesium, m);
    entity.position = pos as never;
    entity.orientation = orientation(Cesium, m, pos) as never;
    if (entity.model) {
      const g = modelGraphics(Cesium, m);
      entity.model.uri = g.uri as never;
      entity.model.scale = g.scale as never;
      entity.model.minimumPixelSize = g.minimumPixelSize as never;
      if (g.maximumScale !== undefined)
        entity.model.maximumScale = g.maximumScale as never;
      if (g.color !== undefined) {
        entity.model.color = g.color as never;
        entity.model.colorBlendMode = g.colorBlendMode as never;
        entity.model.colorBlendAmount = g.colorBlendAmount as never;
      }
      if (g.silhouetteColor !== undefined) {
        entity.model.silhouetteColor = g.silhouetteColor as never;
        entity.model.silhouetteSize = g.silhouetteSize as never;
      }
    }
  }

  function installPickHandler(
    Cesium: CesiumModule,
    viewer: import("cesium").Viewer,
  ): void {
    if (handler) return;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
      (ev: { position: Cartesian2 }) => {
        if (!dataSource) return;
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        if (!picked?.id) return;
        const id = (picked.id as Entity & { id: string }).id;
        if (typeof id !== "string" || !id.startsWith("model:")) return;
        const key = id.slice("model:".length);
        const m = models.find((x) => x.id === key);
        if (!m) return;
        selectedId = key;
        onclick?.(m);
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
