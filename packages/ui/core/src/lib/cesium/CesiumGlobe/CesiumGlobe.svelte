<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy, type Snippet } from "svelte";
  import { provideCesiumViewer } from "../viewerContext.js";
  import type {
    CameraState,
    DefaultBaseLayer,
    LngLat,
    PickedEntity,
    ViewBBox,
  } from "../types.js";

  type Viewer = import("cesium").Viewer;
  type ViewerOptions = import("cesium").Viewer.ConstructorOptions;
  type PositionedEvent = import("cesium").ScreenSpaceEventHandler.PositionedEvent;

  type Props = {
    /**
     * Cesium Ion access token. Without it, Bing imagery and Cesium World
     * Terrain are unavailable and the component falls back to OSM + ellipsoid.
     */
    ionToken?: string;
    /** Starting camera. Used only on mount. Use `camera` for live control. */
    initialCamera?: CameraState;
    /**
     * Controlled / observed camera state. When the user drags the camera the
     * component writes back via `$bindable`; consumers can also write to it to
     * fly the camera to a new position.
     */
    camera?: CameraState | null;
    /** Read-only output: the camera's view rectangle on the globe. */
    viewBBox?: ViewBBox | null;
    /**
     * Default base imagery layer when no `<ImageryLayer>` child is provided.
     * `none` lets the consumer fully own imagery via child components.
     */
    defaultBaseLayer?: DefaultBaseLayer;
    enableLighting?: boolean;
    depthTestAgainstTerrain?: boolean;
    fog?: boolean;
    atmosphere?: boolean;
    /**
     * Escape hatch for Cesium options we don't yet expose as named props.
     * Merged into the Viewer constructor options after our defaults.
     */
    viewerOptions?: Partial<ViewerOptions>;
    height?: string;
    onready?: (viewer: Viewer) => void;
    oncameramove?: (camera: CameraState, viewBBox: ViewBBox | null) => void;
    onpick?: (picked: PickedEntity | null, lngLat: LngLat | null) => void;
    children?: Snippet;
  };

  let {
    ionToken,
    initialCamera = { lng: 0, lat: 20, heightM: 20_000_000 },
    camera = $bindable(null),
    viewBBox = $bindable(null),
    defaultBaseLayer = "osm",
    enableLighting = true,
    depthTestAgainstTerrain = true,
    fog = true,
    atmosphere = true,
    viewerOptions,
    height = "600px",
    onready,
    oncameramove,
    onpick,
    children,
  }: Props = $props();

  let container: HTMLDivElement;
  let viewer: Viewer | null = $state(null);
  let ready = $state(false);
  let error = $state<string | null>(null);

  let resizeObserver: ResizeObserver | null = null;
  let cameraMoveHandler: (() => void) | null = null;
  let pickHandler: ((ev: PositionedEvent) => void) | null = null;
  let screenHandler: import("cesium").ScreenSpaceEventHandler | null = null;
  // Set when our $effect drives the camera; lets us ignore the moveEnd that
  // results so we don't ping-pong with the consumer's bound value.
  let flyingFromEffect = false;

  provideCesiumViewer(() => viewer);

  function warnMissingBaseUrl(): void {
    if (typeof window === "undefined") return;
    if (
      typeof (window as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL ===
      "string"
    ) {
      return;
    }
    console.warn(
      "[CesiumGlobe] window.CESIUM_BASE_URL is not set. Cesium will 404 on " +
        "Workers/Assets and silently fall back to single-threaded mode. See " +
        "documentation/CESIUM_ROADMAP.md §6 for the consumer setup.",
    );
  }

  onMount(async () => {
    warnMissingBaseUrl();
    let Cesium: typeof import("cesium");
    try {
      Cesium = await import("cesium");
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load cesium";
      return;
    }

    if (typeof ionToken === "string" && ionToken.length > 0) {
      Cesium.Ion.defaultAccessToken = ionToken;
    }
    const ionAvailable =
      typeof Cesium.Ion.defaultAccessToken === "string" &&
      Cesium.Ion.defaultAccessToken.length > 0;

    const baseLayer = pickBaseLayer(Cesium, defaultBaseLayer, ionAvailable);

    const mergedOptions: ViewerOptions = {
      animation: false,
      timeline: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      baseLayerPicker: false,
      infoBox: false,
      selectionIndicator: false,
      baseLayer: baseLayer ?? undefined,
      ...viewerOptions,
    };

    const v = new Cesium.Viewer(container, mergedOptions);
    viewer = v;

    if (ionAvailable) {
      try {
        v.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
          1,
          { requestVertexNormals: true, requestWaterMask: true },
        );
      } catch (terrainErr) {
        console.warn(
          "[CesiumGlobe] Cesium World Terrain unavailable; using ellipsoid.",
          terrainErr,
        );
      }
    }

    v.scene.globe.enableLighting = enableLighting;
    v.scene.globe.depthTestAgainstTerrain = depthTestAgainstTerrain;
    if (v.scene.skyAtmosphere) v.scene.skyAtmosphere.show = atmosphere;
    v.scene.fog.enabled = fog;

    // Seed the camera from the initialCamera prop (or the bound camera prop
    // if the consumer already wrote to it).
    const startCam = camera ?? initialCamera;
    v.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        startCam.lng,
        startCam.lat,
        startCam.heightM,
      ),
      orientation: {
        heading: startCam.heading ?? 0,
        pitch: startCam.pitch ?? -Cesium.Math.PI_OVER_TWO,
        roll: startCam.roll ?? 0,
      },
    });

    cameraMoveHandler = () => {
      if (!viewer || flyingFromEffect) {
        flyingFromEffect = false;
        return;
      }
      const pos = viewer.camera.positionCartographic;
      const next: CameraState = {
        lng: Cesium.Math.toDegrees(pos.longitude),
        lat: Cesium.Math.toDegrees(pos.latitude),
        heightM: pos.height,
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
        roll: viewer.camera.roll,
      };
      const rect = viewer.camera.computeViewRectangle(
        viewer.scene.globe.ellipsoid,
      );
      const nextBBox: ViewBBox | null = rect
        ? {
            minLng: Cesium.Math.toDegrees(rect.west),
            minLat: Cesium.Math.toDegrees(rect.south),
            maxLng: Cesium.Math.toDegrees(rect.east),
            maxLat: Cesium.Math.toDegrees(rect.north),
          }
        : null;
      camera = next;
      viewBBox = nextBBox;
      oncameramove?.(next, nextBBox);
    };
    v.camera.moveEnd.addEventListener(cameraMoveHandler);
    // Seed observed state before any user interaction.
    cameraMoveHandler();

    if (onpick) {
      screenHandler = new Cesium.ScreenSpaceEventHandler(v.scene.canvas);
      pickHandler = (ev) => {
        if (!viewer) return;
        const cartesian2 = ev.position;
        const picked = viewer.scene.pick(cartesian2);
        const cartesian3 =
          viewer.scene.pickPosition(cartesian2) ??
          viewer.camera.pickEllipsoid(cartesian2, viewer.scene.globe.ellipsoid);
        const lngLat = cartesian3
          ? (() => {
              const c = Cesium.Cartographic.fromCartesian(cartesian3);
              return {
                lng: Cesium.Math.toDegrees(c.longitude),
                lat: Cesium.Math.toDegrees(c.latitude),
              };
            })()
          : null;

        if (!picked) {
          onpick(null, lngLat);
          return;
        }
        const entry = picked as {
          id?: unknown;
          primitive?: unknown;
          getProperty?: unknown;
        };
        const result: PickedEntity =
          typeof entry.getProperty === "function"
            ? { kind: "tile-feature", feature: picked as never, id: picked }
            : entry.id
              ? { kind: "entity", entity: entry.id as never, id: entry.id }
              : { kind: "primitive", id: entry.primitive ?? picked };
        onpick(result, lngLat);
      };
      screenHandler.setInputAction(
        pickHandler,
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
      );
    }

    resizeObserver = new ResizeObserver(() => viewer?.resize());
    resizeObserver.observe(container);

    ready = true;
    onready?.(v);
  });

  // Drive camera from the consumer when they update the bound prop.
  $effect(() => {
    const c = camera;
    if (!ready || !viewer || !c) return;
    const current = viewer.camera.positionCartographic;
    let CesiumMod: typeof import("cesium") | null = null;
    void (async () => {
      CesiumMod ??= await import("cesium");
      const currentLng = CesiumMod.Math.toDegrees(current.longitude);
      const currentLat = CesiumMod.Math.toDegrees(current.latitude);
      // Skip when the bound camera matches the live viewer state; otherwise
      // the moveEnd echo would re-trigger this effect.
      const drift =
        Math.abs(currentLng - c.lng) +
        Math.abs(currentLat - c.lat) +
        Math.abs(current.height - c.heightM);
      if (drift < 1e-6) return;
      flyingFromEffect = true;
      viewer!.camera.flyTo({
        destination: CesiumMod.Cartesian3.fromDegrees(c.lng, c.lat, c.heightM),
        orientation:
          c.heading != null || c.pitch != null
            ? {
                heading: c.heading ?? viewer!.camera.heading,
                pitch: c.pitch ?? viewer!.camera.pitch,
                roll: c.roll ?? viewer!.camera.roll,
              }
            : undefined,
        duration: 1.2,
      });
    })();
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (viewer) {
      if (cameraMoveHandler) {
        viewer.camera.moveEnd.removeEventListener(cameraMoveHandler);
      }
      if (screenHandler) screenHandler.destroy();
      viewer.destroy();
      viewer = null;
    }
    cameraMoveHandler = null;
    pickHandler = null;
    screenHandler = null;
    ready = false;
  });

  function pickBaseLayer(
    Cesium: typeof import("cesium"),
    kind: DefaultBaseLayer,
    ionAvailable: boolean,
  ): import("cesium").ImageryLayer | null {
    if (kind === "none") return null;
    if (kind === "bing" && ionAvailable) {
      // Bing comes from Ion; falls through to OSM if no token.
      return Cesium.ImageryLayer.fromWorldImagery({});
    }
    if (kind === "esri-world") {
      return new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          credit: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          maximumLevel: 19,
        }),
        {},
      );
    }
    // Default / OSM fallback
    return new Cesium.ImageryLayer(
      new Cesium.UrlTemplateImageryProvider({
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        credit: "© OpenStreetMap contributors",
        maximumLevel: 19,
      }),
      {},
    );
  }
</script>

<div
  class="cy-cesium"
  style="--cy-cesium-height: {height};"
  data-cesium-ready={ready ? "true" : "false"}
>
  <div bind:this={container} class="cy-cesium__viewer"></div>

  {#if ready}
    {@render children?.()}
  {:else if error}
    <div class="cy-cesium__overlay cy-cesium__overlay--error">
      <span class="cy-cesium__message">Cesium failed to load: {error}</span>
    </div>
  {:else}
    <div class="cy-cesium__overlay">
      <span class="cy-cesium__message">Initializing globe&hellip;</span>
    </div>
  {/if}
</div>

<style>
  .cy-cesium {
    position: relative;
    width: 100%;
    height: var(--cy-cesium-height, 600px);
    border-radius: 8px;
    overflow: hidden;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
  }

  .cy-cesium__viewer {
    position: absolute;
    inset: 0;
  }

  .cy-cesium__viewer :global(.cesium-viewer-bottom) {
    bottom: 4px !important;
  }

  .cy-cesium__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-primary);
    z-index: 1000;
  }

  .cy-cesium__overlay--error {
    color: var(--color-state-error);
  }

  .cy-cesium__message {
    font-family: var(--font-mono, monospace);
    font-size: 13px;
    color: var(--color-action-brand-default, #00ff41);
    animation: cy-cesium-pulse 1.5s ease-in-out infinite;
  }

  .cy-cesium__overlay--error .cy-cesium__message {
    color: var(--color-state-error);
    animation: none;
  }

  @keyframes cy-cesium-pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
</style>
