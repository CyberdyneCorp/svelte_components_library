<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import { diffById } from "../reconcile.js";
  import { circleDot } from "../glyphs.js";
  import type { LabelMode, LngLat, TrackedEntity } from "../types.js";

  type Entity = import("cesium").Entity;
  type CustomDataSource = import("cesium").CustomDataSource;
  type Cartesian2 = import("cesium").Cartesian2;
  type Cartesian3 = import("cesium").Cartesian3;
  type CesiumModule = typeof import("cesium");

  type Props = {
    entities: TrackedEntity[];
    visible?: boolean;
    /** Bindable id of the entity the user clicked most recently. */
    selectedId?: string | null;
    /**
     * Rotate billboards so headingDeg lines up with the camera-up vector
     * at each entity's position. Suitable for aircraft / vessels with a
     * top-down silhouette glyph.
     */
    rotateBillboards?: boolean;
    /**
     * Deprecated alias for `labelMode`. `true` → `"all"`, `false` → `"selected"`.
     * Prefer `labelMode`.
     */
    alwaysShowLabels?: boolean;
    /**
     * Which entities show their label:
     *  - `"all"` — every entity that has a `label`
     *  - `"perEntity"` — same as `all`; the consumer controls visibility by
     *    setting or omitting `entity.label` (good for "label only M ≥ 4.5")
     *  - `"selected"` — only the selected entity (default)
     *  - `"none"` — never
     * When unset, derives from `alwaysShowLabels` for back-compat.
     */
    labelMode?: LabelMode;
    /** Uniform layer opacity 0–1, applied to billboard / point / label / trail alpha. */
    opacity?: number;
    /** Default billboard size when entity.size is unset. */
    defaultSize?: number;
    /** Default colour for the generated dot glyph. */
    defaultColor?: string;
    /** Suffix used in entity ids to namespace this layer's primitives. */
    idPrefix?: string;
    onclick?: (entity: TrackedEntity) => void;
  };

  let {
    entities,
    visible = true,
    selectedId = $bindable(null),
    rotateBillboards = false,
    alwaysShowLabels = false,
    labelMode,
    opacity = 1,
    defaultSize = 24,
    defaultColor = "#00d4ff",
    idPrefix = "tracked",
    onclick,
  }: Props = $props();

  // Resolve label visibility mode (labelMode wins; else derive from the
  // deprecated alwaysShowLabels boolean).
  const resolvedLabelMode = $derived<LabelMode>(
    labelMode ?? (alwaysShowLabels ? "all" : "selected"),
  );

  function shouldShowLabel(e: TrackedEntity, isSelected: boolean): boolean {
    if (!e.label) return false;
    switch (resolvedLabelMode) {
      case "none":
        return false;
      case "all":
      case "perEntity":
        return true;
      case "selected":
      default:
        return isSelected;
    }
  }

  const alpha = $derived(Math.max(0, Math.min(1, opacity)));

  const getViewer = useCesiumViewer();
  let dataSource: CustomDataSource | null = null;
  let handler: import("cesium").ScreenSpaceEventHandler | null = null;
  let CesiumMod: CesiumModule | null = null;
  let mounted: TrackedEntity[] = [];

  // Mount once.
  $effect(() => {
    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = (CesiumMod ??= await import("cesium"));
      if (cancelled || dataSource) return;
      dataSource = new Cesium.CustomDataSource(`cy-cesium-${idPrefix}`);
      await viewer.dataSources.add(dataSource);
      dataSource.show = visible;
      installPickHandler(Cesium, viewer);
      sync(Cesium);
    })();
    return () => {
      cancelled = true;
    };
  });

  // Re-sync when the entity array changes.
  $effect(() => {
    void entities;
    void rotateBillboards;
    void resolvedLabelMode;
    void alpha;
    void defaultSize;
    void defaultColor;
    void selectedId;
    if (!CesiumMod || !dataSource) return;
    sync(CesiumMod);
  });

  $effect(() => {
    if (dataSource) dataSource.show = visible;
  });

  function sync(Cesium: CesiumModule): void {
    if (!dataSource) return;
    const { added, updated, removedIds } = diffById(mounted, entities);
    for (const id of removedIds) removeBundle(id);
    for (const e of added) addBundle(Cesium, e);
    for (const e of updated) updateBundle(Cesium, e);
    mounted = entities;
  }

  function entityIds(id: string): { body: string; trail: string } {
    return {
      body: `${idPrefix}:${id}`,
      trail: `${idPrefix}-trail:${id}`,
    };
  }

  function removeBundle(id: string): void {
    if (!dataSource) return;
    const { body, trail } = entityIds(id);
    const b = dataSource.entities.getById(body);
    if (b) dataSource.entities.remove(b);
    const t = dataSource.entities.getById(trail);
    if (t) dataSource.entities.remove(t);
  }

  function billboardImage(e: TrackedEntity): string {
    if (e.icon) return e.icon;
    return circleDot(e.color ?? defaultColor);
  }

  function pos(Cesium: CesiumModule, e: TrackedEntity): Cartesian3 {
    return typeof e.altitudeM === "number"
      ? Cesium.Cartesian3.fromDegrees(e.lng, e.lat, e.altitudeM)
      : Cesium.Cartesian3.fromDegrees(e.lng, e.lat);
  }

  function trailPositions(Cesium: CesiumModule, e: TrackedEntity): Cartesian3[] {
    const points: LngLat[] = e.trail ?? [];
    return points.map((p) => Cesium.Cartesian3.fromDegrees(p.lng, p.lat));
  }

  function billboardRotation(Cesium: CesiumModule, e: TrackedEntity): number {
    // Cesium billboard rotation is in radians counter-clockwise from +x.
    // Compass heading is clockwise from north (north = +y in screen frame
    // when alignedAxis = up at entity). Convert with -(heading + 90°).
    if (typeof e.headingDeg !== "number") return 0;
    return Cesium.Math.toRadians(-(e.headingDeg) + 90);
  }

  function addBundle(Cesium: CesiumModule, e: TrackedEntity): void {
    if (!dataSource) return;
    const { body, trail } = entityIds(e.trail ? e.id : e.id);
    const isSelected = selectedId === e.id;
    const heightRef =
      typeof e.altitudeM === "number"
        ? Cesium.HeightReference.NONE
        : Cesium.HeightReference.CLAMP_TO_GROUND;
    const size = e.size ?? defaultSize;

    dataSource.entities.add({
      id: body,
      position: pos(Cesium, e),
      billboard: {
        image: billboardImage(e),
        width: size,
        height: size,
        heightReference: heightRef,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        // Multiplies the billboard image — drives uniform layer opacity.
        color: Cesium.Color.WHITE.withAlpha(alpha),
        alignedAxis:
          rotateBillboards && typeof e.headingDeg === "number"
            ? Cesium.Cartesian3.UNIT_Z
            : undefined,
        rotation: billboardRotation(Cesium, e),
        scale: isSelected ? 1.25 : 1,
      },
      label: shouldShowLabel(e, isSelected)
        ? {
            text: e.label,
            font: "11px JetBrains Mono, monospace",
            fillColor: Cesium.Color.WHITE.withAlpha(alpha),
            outlineColor: Cesium.Color.BLACK.withAlpha(alpha),
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -(size / 2) - 6),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          }
        : undefined,
    });

    if (e.trail && e.trail.length >= 2) {
      dataSource.entities.add({
        id: trail,
        polyline: {
          positions: trailPositions(Cesium, e),
          width: (e.trailWidth ?? 1.5) as never,
          material: Cesium.Color.fromCssColorString(
            e.trailColor ?? e.color ?? defaultColor,
          ).withAlpha(0.65 * alpha) as never,
          clampToGround: (typeof e.altitudeM !== "number") as never,
        },
      });
    }
  }

  function updateBundle(Cesium: CesiumModule, e: TrackedEntity): void {
    if (!dataSource) return;
    const { body, trail } = entityIds(e.id);
    const entity = dataSource.entities.getById(body);
    if (!entity) {
      addBundle(Cesium, e);
      return;
    }
    const isSelected = selectedId === e.id;
    entity.position = pos(Cesium, e) as never;
    if (entity.billboard) {
      entity.billboard.image = billboardImage(e) as never;
      entity.billboard.width = (e.size ?? defaultSize) as never;
      entity.billboard.height = (e.size ?? defaultSize) as never;
      entity.billboard.rotation = billboardRotation(Cesium, e) as never;
      entity.billboard.scale = (isSelected ? 1.25 : 1) as never;
      entity.billboard.color = Cesium.Color.WHITE.withAlpha(alpha) as never;
      if (rotateBillboards && typeof e.headingDeg === "number") {
        entity.billboard.alignedAxis = Cesium.Cartesian3.UNIT_Z as never;
      }
    }
    // Label show/hide per labelMode + opacity.
    if (shouldShowLabel(e, isSelected)) {
      if (!entity.label) {
        // Recreate the bundle to attach a label cleanly.
        dataSource.entities.remove(entity);
        addBundle(Cesium, e);
        return;
      }
      entity.label.text = e.label as never;
      entity.label.show = true as never;
      entity.label.fillColor = Cesium.Color.WHITE.withAlpha(alpha) as never;
      entity.label.outlineColor = Cesium.Color.BLACK.withAlpha(alpha) as never;
    } else if (entity.label) {
      entity.label.show = false as never;
    }
    // Trail handling.
    const existingTrail = dataSource.entities.getById(trail);
    if (e.trail && e.trail.length >= 2) {
      if (existingTrail?.polyline) {
        existingTrail.polyline.positions = trailPositions(Cesium, e) as never;
        existingTrail.polyline.material = Cesium.Color.fromCssColorString(
          e.trailColor ?? e.color ?? defaultColor,
        ).withAlpha(0.65 * alpha) as never;
      } else if (!existingTrail) {
        dataSource.entities.add({
          id: trail,
          polyline: {
            positions: trailPositions(Cesium, e) as never,
            width: (e.trailWidth ?? 1.5) as never,
            material: Cesium.Color.fromCssColorString(
              e.trailColor ?? e.color ?? defaultColor,
            ).withAlpha(0.65 * alpha) as never,
            clampToGround: (typeof e.altitudeM !== "number") as never,
          },
        });
      }
    } else if (existingTrail) {
      dataSource.entities.remove(existingTrail);
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
        const id = pickedEntityId(picked);
        if (!id) return;
        const entity = entities.find((e) => e.id === id);
        if (!entity) return;
        selectedId = id;
        onclick?.(entity);
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
  }

  function pickedEntityId(
    picked: { id?: Entity } | undefined,
  ): string | null {
    if (!picked?.id) return null;
    const id = (picked.id as Entity & { id: string }).id;
    if (typeof id !== "string") return null;
    const prefix = `${idPrefix}:`;
    return id.startsWith(prefix) ? id.slice(prefix.length) : null;
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
