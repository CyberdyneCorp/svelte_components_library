## ADDED Requirements

### Requirement: Accessible chart frame

The system SHALL provide a `ChartFrame` component that wraps a chart in a `<figure>` and takes optional `title`, `description`, `hideTitle`, `fallbackLabel`, `data`, `tableCaption`, `showDataToggle`, bindable `dataExpanded`, `showDataLabel`, `hideDataLabel`, `inline` and `class` props, plus a `children` snippet. It SHALL:

- Render `title` and `description` in a `<figcaption>`, visible by default and visually hidden (still exposed to assistive technology) when `hideTitle` is `true`.
- Pass the chart snippet the attributes for its `<svg role="img">`: `aria-labelledby` pointing at the title when a title is set, otherwise `aria-label` set to `fallbackLabel`; and `aria-describedby` pointing at the description when one is set.
- Render a real `<table>` from a normalized `data` prop `{ columns: string[], rows: (string | number)[][] }`, with a `<caption>` (default `"<title or fallbackLabel> data"`), `<th scope="col">` column headers, and the first cell of each row as `<th scope="row">`. It SHALL render no table when `data` is absent or has no columns.
- Keep the table in the accessibility tree at all times. When collapsed, the table SHALL be visually hidden, not removed.
- When `showDataToggle` is `true` (default), render a `<button>` with `aria-controls` set to the table container and `aria-expanded` reflecting `dataExpanded`. Activating it SHALL toggle `dataExpanded`, and the label SHALL switch between `showDataLabel` ("Show data") and `hideDataLabel` ("Hide data").
- While the table is expanded, show its container as a focusable (`tabindex="0"`) `region` named by the caption, so keyboard users can scroll a wide table. When collapsed it SHALL NOT be focusable.
- Generate unique ids per instance.

(src: packages/ui/core/src/lib/charts/ChartFrame/ChartFrame.svelte; packages/ui/core/src/lib/charts/ChartFrame/chartTable.ts)

#### Scenario: Title names the chart

- **GIVEN** a chart rendered with `title="Cash flow"` and `description="Monthly totals"`
- **WHEN** assistive technology inspects the chart SVG
- **THEN** the SVG SHALL have role `img`, accessible name "Cash flow" and accessible description "Monthly totals"

#### Scenario: Fallback name without a title

- **GIVEN** a `LineChart` without a `title`
- **WHEN** it renders
- **THEN** the SVG SHALL be named "Line chart" through `aria-label`

#### Scenario: Toggle reveals the data table

- **GIVEN** a chart with data and the default `showDataToggle`
- **WHEN** the user activates the "Show data" button
- **THEN** `aria-expanded` SHALL become `true`, the table SHALL become visible and focusable, and the button SHALL read "Hide data"
- **AND** activating it again SHALL set `aria-expanded` back to `false` and visually hide the table while keeping it in the DOM

### Requirement: Non-colour series encoding

The system SHALL provide a `ChartLegend` component and marker helpers (`seriesStyle`, `markerPath`, `markerClipPath`, `CHART_MARKER_SHAPES`, `CHART_DASH_PATTERNS`). They SHALL:

- Assign each series index a marker shape from `circle`, `square`, `triangle`, `diamond`, `triangle-down`, `cross`, and a dash pattern where the first series is solid. Both SHALL cycle together, so the first six series are pairwise distinct in shape and dash.
- Derive the SVG plot-mark path and the legend's CSS clip-path from a single shape definition, so a series' legend swatch and plot marks have the same outline.
- Render the legend as a labelled list (`aria-label`, default "Legend"). Each item SHALL contain a decorative (`aria-hidden`) colour swatch cut to the series' shape, an optional dashed line sample (`showLine`), the label, and optional detail text.
- Accept a `blockClass` that adds the host chart's BEM hooks (`<block>__legend`, `__legend-item`, `__legend-dot`, `__legend-label`, `__legend-value`).

Charts SHALL use the same encoding in their plot marks:

- `LineChart` and `AreaChart` SHALL dash each series' line with its pattern and, unless `showMarkers` is `false`, draw its shape at every data point.
- `PieChart` SHALL draw each slice's legend shape inside the slice, skipping slivers too narrow to fit it.
- `ScatterChart` SHALL draw each series' points as its shape.

(src: packages/ui/core/src/lib/charts/ChartLegend/ChartLegend.svelte; packages/ui/core/src/lib/charts/ChartLegend/markers.ts)

#### Scenario: Series distinguishable in grayscale

- **GIVEN** a `LineChart` with two series and default props
- **WHEN** it renders
- **THEN** the first series SHALL be solid with circle markers and the second SHALL be dashed with square markers
- **AND** the legend items SHALL show the circle and square shapes respectively

#### Scenario: Pie slices carry their legend shape

- **GIVEN** a `PieChart` with three comparably sized slices
- **WHEN** it renders
- **THEN** each slice SHALL contain the same shape as its legend item (circle, square, triangle)

### Requirement: Chart accessibility coverage

`LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline`, `SankeyChart`, `ScatterChart`, `TreeMap` and `Gauge` SHALL render through `ChartFrame` and accept optional `title`, `description`, `hideTitle` and `showDataToggle` props, while keeping every existing prop and default. Each SHALL derive its table from its existing data props:

- `LineChart` / `AreaChart`: one row per distinct x (ascending) and one column per series. Missing values SHALL be left empty. The x header SHALL be `xLabel` (LineChart) or `"x"`. `AreaChart` SHALL list raw, unstacked values.
- `BarChart`: `Label`, `Value`.
- `PieChart` and `TreeMap` (top-level nodes): `Label`, `Value`, `Share`.
- `SankeyChart`: `Source`, `Target`, `Value`, one row per link, using node labels and falling back to ids.
- `ScatterChart`: `Series`, `xLabel`/`x`, `yLabel`/`y`, one row per point, plus `Label` when any point has one.
- `Sparkline`: `Point` (1-based index) or `Time` (sample `ts`), then `label` or `Value`.
- `Gauge`: `Measure`, `Value` (clamped, with unit), `Minimum`, `Maximum`.

`Sparkline` and `Gauge` SHALL default to `hideTitle = true` and `showDataToggle = false` and render no legend. `Sparkline` SHALL use `label` as the fallback accessible name. `Gauge` SHALL use `"<label or Gauge>: <value><unit>"` (clamped value) as the fallback accessible name and, when it has a `title` but no `description`, SHALL use the value text as its accessible description, because `role="img"` hides the value drawn inside the SVG. The Storybook stories of every chart listed here, and of `ChartFrame` and `ChartLegend`, SHALL set `parameters.a11y.test` to `"error"`, so any axe violation fails the Storybook test project.

(src: packages/ui/core/src/lib/charts/*/*.svelte; packages/ui/core/src/lib/charts/*/*.stories.svelte)

#### Scenario: Line chart data table

- **GIVEN** a `LineChart` with series "Income" `[(1,10),(2,12)]` and "Spend" `[(1,8),(3,9)]` and `xLabel="Month"`
- **WHEN** it renders
- **THEN** its table SHALL have headers `Month, Income, Spend` and rows `1,10,8`, `2,12,(empty)` and `3,(empty),9`

#### Scenario: Sparkline stays compact

- **GIVEN** a `Sparkline` with `label="Balance"` inside a table cell
- **WHEN** it renders
- **THEN** its SVG SHALL be named "Balance", no "Show data" button or legend SHALL be rendered, and a visually hidden table SHALL list the points

#### Scenario: Gauge exposes its value

- **GIVEN** a `Gauge` with `label="Budget used"`, `value=40` and `unit="%"` and no `title`
- **WHEN** it renders
- **THEN** its SVG SHALL be named "Budget used: 40%"

#### Scenario: Axe gate

- **GIVEN** a converted chart story that introduces an axe violation
- **WHEN** the Storybook test project runs
- **THEN** that story's test SHALL fail
