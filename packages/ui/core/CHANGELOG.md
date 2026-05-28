# @cyberdynecorp/svelte-ui-core

## 0.7.0

### Minor Changes

- c706685: Add `LauncherMenu`: a sectioned OS-style launcher (header tile, ⌘K search, grouped sections with caller-defined accent colours via `--section-accent-<id>`, per-item hover submenus that render `position: fixed` and auto-flip on narrow viewports, and a pinned account/identity row). Two optional snippets make it fully configurable: an `icon` snippet to render custom per-entry icons (SVG/pixel-art) instead of the emoji-as-text default, and an `account` snippet to replace the built-in account row with a bespoke identity / connect-wallet widget. Additive — the existing flat `StartMenu` is unchanged.

## 0.6.0

### Minor Changes

- 4c47f65: Phase 1 component enhancements for the geo_dashboard migration, plus a
  high-severity NumberInput fix. All changes are additive / backwards-compatible.

  **Component API additions**
  - **`Sparkline`** — accepts timestamped `samples: {ts,value}[]` (in addition to
    `data: number[]`), a `min`/`max` domain clamp so cards share a y-axis, an
    inline `label` legend with last value, and `fill: 'none' | 'solid' |
'gradient'`.
  - **`Accordion`** — `items[].content` now accepts a `Snippet` (rich children,
    not just strings) and a new `items[].actions` Snippet renders right-aligned
    header controls that don't toggle the panel.
  - **`Table` & `DataTable`** — per-column `cell?: Snippet<[Row]>` render
    override (checkboxes, severity chips, formatted numbers); falls back to
    `row[col.key]`. Columns also accept `width`.
  - **`MetricCard`** — `size: 'compact' | 'md' | 'lg'` (compact = dense 2-line,
    no card chrome) and a muted `secondary` sub-line.
  - **`SearchInput`** — `resultItem?: Snippet<[SearchResult]>` for custom result
    rows; `SearchResult` gains a `data` payload and `onselect` now receives the
    full result.
  - **`ToggleGroup`** — `multiple` mode with `string[]` value + `onchange`
    (checkbox semantics); single mode unchanged.
  - **`Button`** — `id` and `dataAttrs` (forwards `data-*` to the inner button,
    e.g. `data-testid`).
  - **`Alert`** — `inline` (compact coloured text, no banner chrome), `severity`
    tones (critical / warn / caution / good), `card` appearance for severity row
    lists, `borderSide`, and an optional `icon` snippet.
  - **`Icon`** — five new built-in glyphs: `target`, `maximize`, `download`,
    `play`, `pause` (added to `IconName` + `BUILTIN_ICON_NAMES`).

  **Cesium layer enhancements (geo_dashboard ~30-layer migration)**
  - **Uniform `opacity?: number` (0–1)** on every entity / billboard layer —
    drives the alpha of billboards, points, labels, and trails. Added to
    `TrackedEntitiesLayer`, `MarkersLayer`, `LabelsLayer`, `CyclonesLayer`,
    `FarmsLayer`, `UserLocationLayer`, and passed through all 15 convenience
    layers (Aircraft, Vessels, Satellites, Earthquakes, Wildfires, Volcanoes,
    Airports, Towers, CellSites, Webcams, PowerPlants, AirQuality, TideGauges,
    Gdacs, Tsunami). Lets a layer fade in/out without unmounting.
  - **`labelMode?: 'all' | 'perEntity' | 'selected' | 'none'`** on tracked-entity
    layers (default `'selected'`) replaces the boolean `alwaysShowLabels`, which
    is kept as a deprecated alias (`true` → `'all'`). Exposed on
    `TrackedEntitiesLayer`, `AircraftLayer`, `VesselsLayer`, `SatellitesLayer`,
    `AirQualityLayer`, `EarthquakesLayer`. New `LabelMode` type exported.
  - **Documented `TrackedEntitiesLayer` as the styling escape hatch** for full
    per-entity control (colour / glyph / size / trail / conditional labels via
    `labelMode="perEntity"`), and documented that layers are presentation-only
    and that `useCesiumViewer()` resolves from any descendant of `<CesiumGlobe>`
    — including snippet children — so two globes can coexist on one page.

  **Fixes**
  - **`NumberInput`** (high severity) — no longer crashes with
    `props_invalid_value` when bound to an optional/empty value. `value` is now
    `number | null` with no concrete fallback, so `bind:value` accepts
    `undefined`/`null` and renders an empty field (distinct from a real `0`).
    Added `onchange?: (value: number | null) => void`; clearing the field emits
    `null`; stepping from empty starts at `min`.
  - **`StarRating`** — same `$bindable` footgun fixed: `value` is now
    `number | null` (nullish = unrated), so optional binds no longer throw.

  **Tooling**
  - Added a post-publish CI smoke check (`scripts/verify-published-exports.mjs`,
    wired into `release.yaml`) that downloads the just-published tarball and
    asserts every barrel export is present in `dist/index.d.ts` and the
    `cesium/` tree shipped — guards against "version bumped, tarball is a stale
    build" regressions.

## 0.5.0

### Minor Changes

- 0a3c4b5: Bring the chat components up to feature parity with agent-style chats:
  attachments, streaming, and tool-call indicators across `Chatbox`,
  `ChatResponse`, and `BotAnswer`.

  **Shared types**
  - New `Attachment` discriminated union (`kind: "image" | "file"`) and
    `ToolCall` type. `formatChatBytes(bytes)` exported as a small helper.

  **`Chatbox` — file-carrying composer**
  - `onsend` is now `(msg: string, attachments: File[]) => void` (backwards
    compatible — existing `(msg) => void` handlers still work via TS bivariance).
  - New `attachments` bindable `File[]` prop with chip rendering, per-chip
    remove buttons, and image thumbnails via `URL.createObjectURL`.
  - `onattach` is now `(files: File[]) => void` and fires when files are picked
    via the paperclip (previously the click handler was a content-less stub).
  - `acceptTypes`, `multiple`, `maxSizeBytes` props for the picker. Rejected
    files surface through a new `onerror?: (message, rejected)` callback.
  - New `ondetach?: (file, index)` fires when a chip is removed.
  - `showAttach` prop forces the paperclip on even when no `onattach` is wired.

  **`ChatResponse` and `BotAnswer` — attachments, streaming, tool calls**
  - `attachments?: Attachment[]` — images render as click-to-open thumbnails,
    files as labelled download chips with optional size + producedBy attribution.
  - `toolCalls?: ToolCall[]` — small pills with name + status (`ok` / `running`
    / `error`) and a JSON-pretty `argumentsPreview` tooltip.
  - `streaming?: boolean` — appends an inline `▍` cursor (blinking) at the end
    of the content, orthogonal to the existing `typing` dots indicator.
  - `ChatResponse` also gains an `error` prop (inline alert at the bottom of
    the bubble) and an optional `onattachmentclick(attachment)` hook to
    intercept the default link behaviour.

  All additions are non-breaking. Existing call sites keep working without
  changes. New stories illustrate the new features.

## 0.4.0

### Minor Changes

- 979f8dc: Add `ModelsLayer` for glTF / .glb on the globe, plus additive primitive
  callbacks unblocking common app patterns.

  **New components & examples**
  - **`cesium/ModelsLayer`** — controlled list of 3D model entities at lng/lat
    with optional altitude, heading/pitch/roll, scale, `minimumPixelSize`,
    `maximumScale`, tint colour (blend) and silhouette. Diff-by-id
    reconciliation, bindable `selectedId`, `onclick`. Clamps the base to terrain
    when `altitudeM` is omitted.
  - **`ModelEntity`** type exported from the package entry.
  - **`cesium/Examples/UrbanCFD`** — composition story reproducing a CFD-over-
    buildings scene (OSM Buildings tinted by stress band + streamlines +
    pressure dots + numeric labels + wind-sim domain preview).

  **Primitive additions** (all additive — no breaking changes)
  - **`TextInput`** — `type` widened to also accept `"search"`, `"tel"`,
    `"date"`, `"datetime-local"`, `"time"`, `"month"`, `"week"`. New bindable
    `inputRef: HTMLInputElement | null` for imperative focus / `select()`.
    New `onchange`, `onfocus`, `onblur`, `onkeydown` callbacks.
  - **`Checkbox`** — `ariaLabel` prop (used when `label` is omitted, e.g.
    row-select checkboxes) and `onchange: (checked, e) => void` callback.
  - **`Slider`** (ml) — `oninput(value)` and `onchange(value)` callbacks for
    driving transforming setters / dispatching to a viewmodel.
  - **`Button`** — `title` and `ariaLabel` props passed through to the
    underlying `<button>`.
  - **`Icon`** — exported `IconName` string-literal union of the built-in icons
    and `BUILTIN_ICON_NAMES` array; `name` accepts `IconName | (string & {})`
    so consumers get autocomplete while keeping the unknown-name escape hatch.

## 0.3.0

### Minor Changes

- 505c213: Actually ship the Cesium 3D globe suite, the flow node editor, and the four
  geospatial/utility components. These were nominally part of 0.2.0 but the
  published 0.2.0 tarball was a stale build that omitted them (a 0.2.0 already
  existed on the registry, so `changeset publish` skipped re-publishing). This
  release republishes the real `main` build.

  Included (verified present in `dist/`):
  - **`cesium/` category (49 components)** — headless, controlled CesiumJS globe
    toolkit: `CesiumGlobe` host, `Terrain`, `ImageryLayer`, 3D tilesets
    (`Cesium3DTiles`, `OsmBuildingsLayer`, `GooglePhotorealisticTiles`),
    `ElevationContours`, vector layers, 22 live-entity layers, raster timelines
    (`WeatherTileLayer`, `NasaGibsLayer`), particle/flow layers, and UI chrome.
    `cesium` is an optional peer dependency, lazy-imported and never bundled.
  - **`flow/` node editor (8 components)** — `NodeEditor`, `FlowNode`, `FlowPort`,
    `FlowEdge`, `NodePalette`, `NodeInspector`, `FlowMinimap`, `FlowCanvasControls`.
  - **`ElevationProfile`** (charts), **`GlobeLoader`** (feedback),
    **`FloatingPanel`** (layout), **`WeatherCard`** (data).

## 0.2.0

### Minor Changes

- 1c52a12: Add the CesiumJS 3D globe suite and four geospatial/utility components.
  - **`cesium/` category (49 components)** — headless, controlled CesiumJS globe
    toolkit: `CesiumGlobe` viewer host + terrain/imagery, 3D tilesets (incl.
    OSM Buildings and Google Photorealistic via ion asset 2275207 or a Google
    Maps API key), vector layers, 22 live-entity layers, raster timelines
    (`WeatherTileLayer`, `NasaGibsLayer`), particle/flow layers, and UI chrome
    (`CesiumControls`, `CesiumCompass`, `CesiumCoordinatesHud`,
    `CesiumLayerControl`, `BaseLayerPicker`, `CesiumMinimap`). `cesium` is an
    **optional peer dependency**, lazy-imported per component (SSR-safe, never
    bundled).
  - **`ElevationProfile`** (charts) — distance-vs-elevation cross-section with
    terrain fill and optional line-of-sight + Fresnel-zone overlay.
  - **`GlobeLoader`** (feedback) — self-contained animated rotating globe loader
    (2D canvas, no Cesium).
  - **`FloatingPanel`** (layout) — draggable + resizable titlebar window.
  - **`WeatherCard`** (data) — controlled current-conditions card.
