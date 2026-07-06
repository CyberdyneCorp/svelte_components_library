# Cesium Globe Toolkit

## Purpose

The `cesium/` family is a headless, controlled CesiumJS 3D-globe toolkit (50 exported components) built so that CesiumJS is an optional peer dependency that is lazy-imported at runtime and never bundled — consumers who never render a globe pay no bundle cost. `CesiumGlobe` mounts the viewer and shares it with descendant layers through a Svelte context; layers declaratively project domain data (markers, aircraft, imagery, terrain, tilesets, particles) onto the globe with uniform styling conventions.

## Requirements

### Requirement: Cesium is an optional, lazy-imported peer dependency

The system SHALL declare `cesium` as an optional peer dependency and SHALL reference Cesium types only via `import type`, loading the runtime module through dynamic `import("cesium")` inside component lifecycle/effects so that it is never statically bundled. (src: packages/ui/core/package.json:20-28; packages/ui/core/src/lib/cesium/types.ts:1-14; packages/ui/core/src/lib/cesium/CesiumGlobe/CesiumGlobe.svelte:107)

#### Scenario: Consumer without a globe

- **GIVEN** an application that imports core components but never renders `CesiumGlobe`
- **WHEN** the app is bundled
- **THEN** the system SHALL NOT include CesiumJS in the bundle

#### Scenario: Runtime lazy import

- **GIVEN** a mounted `CesiumGlobe`
- **WHEN** `onMount` runs
- **THEN** the system SHALL obtain Cesium via `await import("cesium")` rather than a static import

### Requirement: Headless viewer mounting and controlled camera

The system SHALL construct the Cesium `Viewer` with a headless preset that disables the animation, timeline, geocoder, home button, scene-mode picker, navigation help, fullscreen button, base-layer picker, info box, and selection indicator by default, while spreading a `viewerOptions` escape hatch to override any of them. The `camera` and `viewBBox` props SHALL be `$bindable`: the viewer's `moveEnd` SHALL write observed camera state back and invoke `oncameramove`, and writing the bound `camera` prop SHALL fly the camera, with a guard preventing feedback loops. Child layers SHALL render only after the viewer is `ready`. (src: packages/ui/core/src/lib/cesium/CesiumGlobe/CesiumGlobe.svelte:58-59,122-135,139,184-213,267-297,355-356)

#### Scenario: Headless defaults with override

- **GIVEN** a `CesiumGlobe` rendered without `viewerOptions`
- **WHEN** the viewer is constructed
- **THEN** the system SHALL disable the timeline, animation, geocoder, and other default chrome widgets

### Requirement: Non-throwing failure modes and base-URL warning

The system SHALL route CesiumJS import failure and Viewer/WebGL initialization failure to an in-component error overlay rather than throwing out of `onMount`, and SHALL `console.warn` when `window.CESIUM_BASE_URL` is not set (provisioning the base URL is the consumer's responsibility). The one intentional throw SHALL be `useCesiumViewer()` called outside a `CesiumGlobe` subtree. (src: packages/ui/core/src/lib/cesium/CesiumGlobe/CesiumGlobe.svelte:88-101,104,108-111,138-146; packages/ui/core/src/lib/cesium/viewerContext.ts:23-31)

#### Scenario: Missing base URL

- **GIVEN** a page where `window.CESIUM_BASE_URL` is unset
- **WHEN** `CesiumGlobe` mounts
- **THEN** the system SHALL emit a console warning and continue

#### Scenario: Viewer init failure

- **GIVEN** an environment without WebGL support
- **WHEN** the Cesium `Viewer` fails to construct
- **THEN** the system SHALL display an error overlay instead of throwing

### Requirement: Viewer shared via Svelte context

The system SHALL share the viewer instance through Svelte context: `CesiumGlobe` SHALL call `provideCesiumViewer` with a live accessor closure, and every layer SHALL obtain the viewer via `useCesiumViewer()`, which SHALL throw a descriptive error when used outside a globe subtree. (src: packages/ui/core/src/lib/cesium/CesiumGlobe/CesiumGlobe.svelte:86; packages/ui/core/src/lib/cesium/viewerContext.ts:4,11-13,23-31; packages/ui/core/src/lib/cesium/Terrain/Terrain.svelte:21)

#### Scenario: Layer outside a globe

- **GIVEN** a layer component rendered with no ancestor `CesiumGlobe`
- **WHEN** it calls `useCesiumViewer()`
- **THEN** the system SHALL throw "useCesiumViewer() must be called inside a <CesiumGlobe> component tree."

### Requirement: Uniform layer styling conventions

The system SHALL apply a uniform `opacity` prop (clamped to 0..1, default 1) to entity/billboard layers, and SHALL apply a `labelMode` prop restricted to `"all" | "perEntity" | "selected" | "none"` (default `"selected"`) to tracked-entity layers, with `alwaysShowLabels` retained as a deprecated boolean alias (`true` -> `"all"`, `false` -> `"selected"`). `TrackedEntitiesLayer` SHALL be the low-level generic styling primitive that domain layers (e.g. `AircraftLayer`) compose. (src: packages/ui/core/src/lib/cesium/MarkersLayer/MarkersLayer.svelte:17-18,32,40; packages/ui/core/src/lib/cesium/TrackedEntitiesLayer/TrackedEntitiesLayer.svelte:16-51,69-85; packages/ui/core/src/lib/cesium/types.ts:205-217; packages/ui/core/src/lib/cesium/AircraftLayer/AircraftLayer.svelte:59-71)

#### Scenario: Opacity clamping

- **GIVEN** a `MarkersLayer` given `opacity={1.5}`
- **WHEN** it renders
- **THEN** the system SHALL clamp the applied alpha to 1

#### Scenario: labelMode selected default

- **GIVEN** a `TrackedEntitiesLayer` without a `labelMode` prop and `alwaysShowLabels={false}`
- **WHEN** labels are resolved
- **THEN** the system SHALL show labels only for the selected entity

### Requirement: Component and type catalog

The system SHALL export 50 globe components across engine (`CesiumGlobe`, `ImageryLayer`, `Terrain`), tilesets/models/contours, vector layers, live-entity layers, raster timelines, particle/flow layers, and chrome, plus shared utilities (`viewerContext`, `sampler`, `reconcile`, `gibs`) and a shared `types.ts` defining domain entity shapes and discriminated provider-spec unions with documented allowed values and defaults. (src: packages/ui/core/src/lib/cesium/index.ts:1-68; packages/ui/core/src/lib/cesium/types.ts:16-650)

#### Scenario: Barrel export count

- **WHEN** `cesium/index.ts` is loaded
- **THEN** the system SHALL export the engine, layer, and chrome components together with the shared utility helpers
