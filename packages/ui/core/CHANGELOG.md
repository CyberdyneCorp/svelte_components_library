# @cyberdynecorp/svelte-ui-core

## 0.14.0

### Minor Changes

- 3d34818: `TradingChart`: keyboard editing of draggable price lines, the accessible alternative to dragging. With the chart focused, L selects the next draggable line (Shift+L the previous), ↑/↓ move it one tick (Shift: ten ticks), Enter applies it through `onpricelinechange(id, price)` with a tick-snapped price, and Escape (or blurring the chart) cancels. Steps are announced in the chart's polite live region; the description explains the keys only when a draggable line exists. New `labels` keys: `priceLineHint`, `priceLine`, `priceLineEdit.{select,move,commit,cancel}`.

  Fixed: the chart's throttled live announcements threw "Illegal invocation" in browsers when a second announcement arrived within the throttle window (`setTimeout` was called as a method of another object).

  Docs: a `Trading/Terminal` story (ticker, chart with indicators, fills and position lines, order book → ticket, trades, positions and open orders on one simulated feed), a Trading overview table and terminal Getting-Started snippet in the README, and JSDoc units on `Ticker.changePct24h` / `Position.roe` (percentages) and `Ticker.fundingRate` (fraction). The order-book decimal helpers now share `trading/decimal.ts`.

## 0.13.0

### Minor Changes

- 32beaf1: Run axe in failing mode for every chart story and fix the violations it found.
  - `HeatmapChart` renders through `ChartFrame`: the grid is one named image (`role="img"`) with a data-table fallback instead of focusable `role="gridcell"` divs without a grid parent. New optional `description`, `hideTitle`, `showDataToggle` and `labels` (`columns.row`) props; `title` now names the chart. Cell values are drawn in black or white, whichever meets 4.5:1 against the cell colour.
  - New `matrixTable(data, xLabels, yLabels, cornerHeader)` helper for matrix-shaped data tables.
  - `AgingWIP` and `GanttChart` bars are `role="button"` with a descriptive `aria-label`, activated by Enter or Space, only when `onitemclick` / `onTaskClick` is set; the SVG is then a named `group`. Without a handler the bars are presentational and the SVG stays a single image. A non-interactive Gantt timeline is a focusable region so it can be scrolled by keyboard.
  - `ElevationProfile` stat labels and muted text use `--color-text-secondary` for sufficient contrast.

- 21ba461: MoneyInput: support crypto/custom (non-ISO) assets. New optional `decimals` prop switches to asset mode — `currency` may be any asset code (USDC, ETH, BTC), input is parsed with exactly that many fraction digits using string math (18-decimal values stay exact), extra fraction digits are rejected, and the blurred value is formatted like `CurrencyDisplay` (`1.234,5678 ETH`). Optional `symbol` takes the locale's currency-symbol position. Invalid `decimals` or an empty asset code make the field read-only and warn once. ISO behaviour is unchanged without `decimals`. Also exports `formatAmount`, `resolveMinorUnits`, `exceedsDecimals` and `AmountFormatOptions`.
- a1d85bd: `TradingChart`: canvas candlestick chart on an in-house engine (no charting dependency). Candles, hollow candles, OHLC bars, line and area series with volume (overlay or pane), linear or log price scale, and a crosshair with an OHLCV legend. Declarative `indicators` prop covers every `trading/indicators` function: overlays (moving averages, Bollinger Bands with a band fill, VWAP) and resizable sub-panes (RSI, MACD, ATR, ADX, Stochastic) via `bind:paneHeights`. Trade `markers` and `priceLines` are coloured by kind from tokens; draggable lines report a tick-snapped price through `onpricelinechange`. Drag, wheel, pinch and keyboard navigation (`onrangechange`, `oncrosshairmove`). Live last-bar and append updates are incremental, and the view follows new bars only at the right edge. Time labels use `timeZone`. Theme colours are re-read on theme switch. The accessible fallback is a named image, polite crosshair announcements and a "Show data" table with indicator columns, and every string goes through `labels`. Invalid indicator configs are disabled and reported through `onindicatorerror`.
- 646c14a: Trading types and precision helpers. New `trading/` category exporting the shared trading types (`Side`, `OrderType`, `TimeInForce`, `MarginMode`, `Candle`, `MarketSpec`, `OrderDraft`, `Position`, `OpenOrder`, `BookLevel`, `Trade`, `Ticker`, `ChartMarker`, `PriceLine`, `RoundingMode`) and decimal-string precision helpers: `roundToTick` / `roundToStep` (modes `down` | `up` | `nearest`, BigInt maths, ties half away from zero), `formatPrice` / `formatSize` (precision from `pricePrecision` / `sizePrecision` or derived from `tickSize` / `stepSize`), `precisionOf`, `pricePrecisionOf` and `sizePrecisionOf`. Invalid input throws a `RangeError`.
- 80aa7bc: Trading indicators. New framework-free batch functions `sma`, `ema`, `wma`, `rsi`, `bollinger`, `atr`, `adx` (+DI/−DI), `macd`, `stochastic` and `vwap` returning series aligned with the input (`null` during warm-up; `bollinger` → `{ middle, upper, lower }`, `adx` → `{ adx, plusDI, minusDI }`, `macd` → `{ macd, signal, histogram }`, `stochastic` → `{ k, d }`), plus incremental calculators `createSMA` … `createVWAP` with O(1) `next` (append a bar) and `update` (revise the last bar), and the `trueRange` helper. Wilder smoothing for RSI/ATR/ADX, SMA-seeded EMA, population standard deviation for Bollinger Bands, VWAP with a configurable session reset (default UTC day). Invalid parameters or non-finite prices throw a `RangeError`.
- 314eb0b: Trading market-data widgets: `OrderBook` (decimal-string price grouping — bids round down, asks up — cumulative totals with depth bars, spread absolute and %, `both` / `bids` / `asks` layouts, `levels`, keyboard-operable `onpriceclick`), `RecentTrades` (newest first, side shown by colour plus a ▲/▼ glyph labelled Buy/Sell, `timeZone`, windowed list, new-trade flash disabled under `prefers-reduced-motion`) and `TickerBar` (last/mark/index, 24h change/high/low/volume/turnover, open interest, funding rate with a live `HH:MM:SS` countdown, absent fields omitted). All three coalesce prop updates to one render per animation frame and take a typed `labels` prop. Also exports `createFrameCoalescer`, `buildBook`, `groupLevels`, `computeSpread`, `defaultGroupingOptions` and `formatCountdown`.
- 1208c23: Trading order entry. New `OrderTicket` (Long/Short radio group, market / limit / stop-market / stop-limit, base or quote size via `MoneyInput` asset mode, size-percentage slider, leverage, cross/isolated, reduce-only, post-only, time in force, TP/SL; inline validation against `MarketSpec` and `available` that blocks submit; notional / initial margin / fee preview; optional `estimateLiquidation(draft)`; `onsubmit(draft)` with prices rounded to `tickSize` and size rounded down to `stepSize` in base asset), `LeverageSlider` (range input with `aria-valuetext` "20×", synced numeric input, marks, keyboard), `PositionsTable` and `OpenOrdersTable` (real tables, signed PnL in trade colours, `onclose` / `onedittpsl` / `oncancel` / `oncancelall` intents, empty states). Every string is replaceable through `labels`. Also adds exact decimal-string helpers `addDecimal`, `subtractDecimal`, `multiplyDecimal`, `divideDecimal`, `compareDecimal`, `signOf`, `isDecimal` and `trimDecimal`.

### Patch Changes

- Updated dependencies [646c14a]
  - @cyberdynecorp/svelte-ui-foundation@0.7.0

## 0.12.0

### Minor Changes

- 7a004d1: CurrencyDisplay: new `decimals` and `symbol` props for crypto and other non-ISO assets (USDC, ETH, BTC). With `decimals` set, `currency` may be any asset code and the amount is formatted from its decimal string with exactly that many fraction digits, locale grouping, sign display and masking (e.g. pt-BR `1.234,5678 ETH`). ISO currency behaviour is unchanged when `decimals` is omitted.
- 957c92a: Drawer accessibility: focus moves into the panel on open (first focusable element, else the panel), Tab / Shift+Tab stay inside, Escape / backdrop click / close button close it, and focus returns to the opener. New optional props `closeLabel` (default "Close drawer") and `onclose` (called for user-initiated closes; `bind:open` keeps working). Drawer, Modal and Dialog overlays now stack on `--z-overlay`, above `BottomNav` (`--z-nav`), so the nav no longer covers an open drawer's footer on phones. Modal and Dialog share the new focus-trap helper, which also skips disabled controls.
- c42ed1a: KpiCard: `value` now accepts a Svelte snippet as well as a string, so rich markup such as a masked `CurrencyDisplay` can be used. Strings render exactly as before; snippet content renders inside the same value element and stays part of the card link's accessible name.
- 547dccf: SankeyChart: new `formatValue?: (value: number) => string` prop (same signature as `Sparkline`) formats values in node labels, tooltips and the screen-reader data table, e.g. for `Intl.NumberFormat` currency. Node labels now use the foundation body-sm size (`0.875rem`, was a hard-coded `11px`), overridable via `--cy-sankey-label-size`, and render with a space before the value (`Moradia (3200)`).

### Patch Changes

- e4ae970: GeoJsonLayer: datasets with polygons touching a pole (e.g. Antarctica in world-countries GeoJSON) no longer crash Cesium with "Invalid array length" and stop the globe rendering. Those polygons are drawn with geodesic edges; all others keep the rhumb-line default.
- Updated dependencies [957c92a]
  - @cyberdynecorp/svelte-ui-foundation@0.6.0

## 0.11.0

### Minor Changes

- 4dcdd24: Charts can now be localized. Every `ChartFrame` chart (Line, Area, Bar, Pie, Scatter, TreeMap, Sankey, Sparkline, Gauge) takes an optional, per-chart typed `labels` prop covering the accessible name, the data-table column headers and caption, the "Show data"/"Hide data" toggle, and the legend name. `ChartLabels` and `columnHeaders` are also exported. Without `labels`, the English defaults are unchanged.

### Patch Changes

- fedab9b: CesiumLayerControl: fix an infinite effect loop (`effect_update_depth_exceeded`) whenever `groups` were passed. Group open state now falls back to each group's `defaultOpen` instead of being seeded by an effect.

## 0.10.1

### Patch Changes

- Updated dependencies [1113b7b]
  - @cyberdynecorp/svelte-ui-foundation@0.5.1

## 0.10.0

### Minor Changes

- 90e2653: Add design-style tokens so theme presets can reach gradients, textures, glass blur, style shadows, border shape and decorative type.
  - foundation: new tokens with no-op defaults: `--gradient-{surface,brand,brand-hover,brand-active,accent,backdrop}`, `--texture-surface`, `--pattern-backdrop`, `--surface-blur`, `--shadow-{offset,raised,pressed,inset}`, `--border-width`, `--border-width-strong`, `--border-style`, `--font-decorative`, `--heading-transform`, `--color-accent-1..4`. The default, light and calm themes render unchanged. `body` paints the backdrop layers.
  - core: Button, Badge, Card, TextInput, Textarea, Select, Modal, Dialog, Drawer, Popover, Tabs, NavBar, Header, Sidebar, BottomNav, Table, DataTable, PageHeader, PageShell, AppLayout and CommentThread consume the new tokens.

### Patch Changes

- Updated dependencies [90e2653]
- Updated dependencies [90e2653]
  - @cyberdynecorp/svelte-ui-foundation@0.5.0

## 0.9.0

### Minor Changes

- 69abae9: Make charts accessible (#18). New `ChartFrame` component: a `<figure>` with an optional title and description wired to the chart SVG (`aria-labelledby` / `aria-describedby`), plus a data-table fallback. The table is visually hidden, stays available to screen readers, and a "Show data" toggle (`aria-expanded`) reveals it. New `ChartLegend` component with shape markers, and `seriesStyle` / `markerPath` helpers, so series stay distinguishable in grayscale.

  `LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline`, `SankeyChart`, `ScatterChart`, `TreeMap` and `Gauge` take optional `title`, `description`, `hideTitle` and `showDataToggle` props. Each derives its table from its existing data. Line and area series after the first are now dashed and show per-point shape markers (turn these off with `showMarkers={false}`). Pie slices and scatter points carry their series shape. `Sparkline` and `Gauge` keep a screen-reader-only table with no toggle by default. An untitled `Gauge` is named by its label and value (e.g. "CPU: 72%"). The `Sparkline` label now uses the secondary text colour, since the tertiary colour failed WCAG AA contrast. Existing props are unchanged. Storybook axe checks now fail on violations for these charts.

- fe9b2c2: Add `CurrencyDisplay` (`data/CurrencyDisplay`): a neutral, locale-aware money amount display. It formats decimal-string amounts through `formatMoney` without float conversion, uses tabular numerals, marks negatives with a sign or a screen-reader label (never colour alone, optional `tone="signed"`), supports a width-preserving `masked` mode that exposes only `maskedLabel` to assistive technology, and renders an em dash with a single console warning for invalid input.
- 480e597: Add a calm theme preset and light/dark/system theme preference.
  - foundation: new optional `@cyberdynecorp/svelte-ui-foundation/themes/calm.css` defining `[data-theme="calm"]` and `[data-theme="calm-dark"]`. Every Layer 2 and Layer 3 token is redefined (except `--video-*`), contrast is WCAG AA, motion stays at or under 200ms with no spring, and the display font is Inter.
  - foundation: new `@cyberdynecorp/svelte-ui-foundation/theme` with `createThemePreference({ storageKey, themes })` and `themeInitScript(options)`. The helper follows `prefers-color-scheme` live under `system`, persists the choice to `localStorage` (storage failures fall back to `system`) and is SSR-safe. `themeInitScript` returns a pre-paint script for `app.html`.
  - foundation: test files are no longer published.
  - core: `ThemeToggle` gains an opt-in `includeSystem` light / dark / system radio group and a `themes` mapping (e.g. `{ light: "calm", dark: "calm-dark" }`), plus bindable `preference`, `ariaLabel` and `onpreferencechange`. The two-state switch remains the default and existing props are unchanged. Until the user picks a theme, the two-state switch now follows OS changes live.

- 08975d4: Add `KpiCard` and `BudgetBar`. `KpiCard` is a neutral KPI tile. It conveys trend with an icon plus hidden text, colours by sentiment independently of direction, can render as a link, and has a sparkline snippet. `BudgetBar` is a money budget meter with ok, approaching and exceeded states, a stacked committed amount, overage text, float-free formatting via `formatMoney`, and i18n labels.

### Patch Changes

- Updated dependencies [480e597]
  - @cyberdynecorp/svelte-ui-foundation@0.4.0

## 0.8.1

### Patch Changes

- f4543f3: Stop publishing compiled tests, stories and `_testdata`. The package drops from 2920 to 1603 files, with no runtime changes.

## 0.8.0

### Minor Changes

- e11015a: Add `MoneyInput`, a currency field whose value is an exact decimal string (`"1234.56"`, or `null` when empty). It is locale-aware: currency formatting on blur, `.` or `,` accepted as the decimal separator, fraction digits limited to the currency's minor units, and decimal-string `min`/`max`. Also exports the float-free money helpers (`parseMoneyInput`, `formatMoney`, `currencyMinorUnits`, `toMinorUnits`, `fromMinorUnits`, `compareMoney`, `clampMoney`, `sanitizeMoneyTyping`, `toEditableMoney`).
- 8d11e04: Define every foundation-namespaced token that core references (#17).
  - Foundation adds `--color-action-{brand,secondary}-{bg,border}`, `--color-action-danger-*`, `--color-accent-*`, `--color-syntax-number`, `--shadow-glow-red`, `--nav-height` and `--video-*`, each in dark and light.
  - Core now references existing tokens where it used synonyms, e.g. `--color-surface-base` → `--color-surface-default` and `--radius-full` → `--radius-pill`.
  - A new unit test fails on any undefined token.

  `Sidebar` and `BottomNav` accept an optional `ariaLabel` for their `<nav>` landmark (#16).

### Patch Changes

- Updated dependencies [8d11e04]
  - @cyberdynecorp/svelte-ui-foundation@0.3.0

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
