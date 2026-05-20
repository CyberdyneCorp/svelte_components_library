<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import type { LngLat, Marker, MarkerStyle } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;

  type Props = {
    /** Controlled marker list. */
    markers: Marker[];
    visible?: boolean;
    /** Enables click-and-hold drag on each marker. */
    draggable?: boolean;
    /** Bindable id of the marker the user clicked most recently. */
    selectedId?: string | null;
    /** Per-marker style override. Falls back to marker.color / icon / size. */
    renderMarker?: (m: Marker) => MarkerStyle;
    onclick?: (marker: Marker) => void;
    onmove?: (id: string, lngLat: LngLat) => void;
  };

  let {
    markers,
    visible = true,
    draggable = false,
    selectedId = $bindable(null),
    renderMarker,
    onclick,
    onmove,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let handler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: typeof import("cesium") | null = null;

  // Index of mounted markers, keyed by id, for diffing.
  let mounted: Marker[] = [];

  // Drag state — `null` when idle, holds the marker id while a drag is active.
  let dragId: string | null = null;
  // Tracks whether a click handler has fired during a drag (to suppress
  // onclick when the user actually dragged).
  let dragMoved = false;

  // Initial mount: install handlers and seed the data source.
  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;

      dataSource = new Cesium.CustomDataSource("cy-cesium-markers");
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installHandler(Cesium, viewer);
      syncMarkers(Cesium);
    })();

    return () => {
      cancelled = true;
    };
  });

  // Sync the entity collection whenever the markers array changes.
  $effect(() => {
    void markers;
    void renderMarker;
    if (!CesiumMod || !dataSource) return;
    syncMarkers(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function syncMarkers(Cesium: typeof import("cesium")): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, markers);

    for (const id of removedIds) {
      const e = dataSource.entities.getById(`marker:${id}`);
      if (e) dataSource.entities.remove(e);
    }
    for (const m of added) addEntity(Cesium, m);
    for (const m of updated) updateEntity(Cesium, m);
    mounted = markers;
  }

  function styleFor(m: Marker): Required<MarkerStyle> {
    const override = renderMarker?.(m) ?? {};
    const isSelected = selectedId === m.id;
    return {
      color: override.color ?? m.color ?? "#00d4ff",
      icon: override.icon ?? m.icon ?? "",
      size: override.size ?? m.size ?? 14,
      scale: override.scale ?? (isSelected ? 1.25 : 1),
      outlineColor: override.outlineColor ?? "rgba(255,255,255,0.5)",
    };
  }

  function billboardImage(style: Required<MarkerStyle>): string {
    if (style.icon) return style.icon;
    // Generate a glowy circular SVG dot so consumers don't need to host any
    // asset to render markers. data-URI keeps it inline.
    const d = style.size;
    const r = d / 2;
    const stroke = style.outlineColor;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${d * 2}" height="${d * 2}" viewBox="0 0 ${d * 2} ${d * 2}">
      <defs>
        <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="${r / 2}" />
        </filter>
      </defs>
      <circle cx="${d}" cy="${d}" r="${r}" fill="${style.color}" opacity="0.6" filter="url(#g)" />
      <circle cx="${d}" cy="${d}" r="${r * 0.7}" fill="${style.color}" stroke="${stroke}" stroke-width="2" />
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function addEntity(Cesium: typeof import("cesium"), m: Marker): void {
    if (!dataSource) return;
    const style = styleFor(m);
    const position =
      typeof m.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(m.lng, m.lat, m.altitudeM)
        : Cesium.Cartesian3.fromDegrees(m.lng, m.lat);
    const heightRef =
      typeof m.altitudeM === "number"
        ? Cesium.HeightReference.NONE
        : Cesium.HeightReference.CLAMP_TO_GROUND;

    dataSource.entities.add({
      id: `marker:${m.id}`,
      position,
      billboard: {
        image: billboardImage(style),
        scale: style.scale,
        heightReference: heightRef,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
      },
      label: m.label
        ? {
            text: m.label,
            font: "12px JetBrains Mono, monospace",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -(style.size + 8)),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          }
        : undefined,
    });
  }

  function updateEntity(Cesium: typeof import("cesium"), m: Marker): void {
    if (!dataSource) return;
    const entity = dataSource.entities.getById(`marker:${m.id}`);
    if (!entity) {
      addEntity(Cesium, m);
      return;
    }
    const style = styleFor(m);
    const position =
      typeof m.altitudeM === "number"
        ? Cesium.Cartesian3.fromDegrees(m.lng, m.lat, m.altitudeM)
        : Cesium.Cartesian3.fromDegrees(m.lng, m.lat);
    entity.position = position as never;
    if (entity.billboard) {
      entity.billboard.image = billboardImage(style) as never;
      entity.billboard.scale = style.scale as never;
    }
    if (entity.label && m.label) entity.label.text = m.label as never;
  }

  function installHandler(
    Cesium: typeof import("cesium"),
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
        const id = pickedMarkerId(picked);
        if (!id) return;
        if (draggable) {
          dragId = id;
          dragMoved = false;
          viewer.scene.screenSpaceCameraController.enableInputs = false;
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    );

    handler.setInputAction(
      (ev: { endPosition: Cartesian2 }) => {
        if (!dragId || !dataSource) return;
        const ll = pickGround(Cesium, viewer, ev.endPosition);
        if (!ll) return;
        const entity = dataSource.entities.getById(`marker:${dragId}`);
        if (!entity) return;
        entity.position = Cesium.Cartesian3.fromDegrees(ll.lng, ll.lat) as never;
        dragMoved = true;
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );

    handler.setInputAction(
      (ev: { position: Cartesian2 }) => {
        const wasDragging = !!dragId;
        const id = dragId;
        const moved = dragMoved;
        dragId = null;
        dragMoved = false;
        viewer.scene.screenSpaceCameraController.enableInputs = true;

        if (wasDragging && id && moved) {
          const ll = pickGround(Cesium, viewer, ev.position);
          if (ll) onmove?.(id, ll);
          return;
        }
        // Treat as a click if no drag occurred.
        const picked = viewer.scene.pick(ev.position) as
          | { id?: Entity }
          | undefined;
        const clickedId = pickedMarkerId(picked);
        if (!clickedId) return;
        const marker = markers.find((m) => m.id === clickedId);
        if (!marker) return;
        selectedId = clickedId;
        onclick?.(marker);
      },
      Cesium.ScreenSpaceEventType.LEFT_UP,
    );
  }

  function pickedMarkerId(
    picked: { id?: Entity } | undefined,
  ): string | null {
    if (!picked?.id) return null;
    const id = (picked.id as Entity & { id: string }).id;
    return typeof id === "string" && id.startsWith("marker:")
      ? id.slice("marker:".length)
      : null;
  }

  function pickGround(
    Cesium: typeof import("cesium"),
    viewer: import("cesium").Viewer,
    point: Cartesian2,
  ): LngLat | null {
    const cartesian =
      viewer.scene.pickPosition(point) ??
      viewer.camera.pickEllipsoid(point, viewer.scene.globe.ellipsoid);
    if (!cartesian) return null;
    const carto = Cesium.Cartographic.fromCartesian(cartesian);
    return {
      lng: Cesium.Math.toDegrees(carto.longitude),
      lat: Cesium.Math.toDegrees(carto.latitude),
    };
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
