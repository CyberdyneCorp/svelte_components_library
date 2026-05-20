---
"@cyberdynecorp/svelte-ui-core": minor
---

Phase 1 component enhancements for the geo_dashboard migration, plus a
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
