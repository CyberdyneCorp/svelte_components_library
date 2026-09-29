# Charts & Visualization

## Purpose

The `charts/` family provides 19 data-visualization components (line, bar, area, pie, scatter, gauge, treemap, sankey, venn, gantt, heatmaps, sparkline, agile flow charts, and more). All charts are rendered from hand-written SVG (or CSS grid for heatmaps) with bespoke coordinate math and no third-party charting library, keeping the package dependency-free and fully themeable through design tokens.
## Requirements
### Requirement: Dependency-free hand-rolled rendering

The system SHALL render charts using inline SVG markup with manually computed coordinate math (scale functions, path string construction, tick generation) and SHALL NOT depend on any external charting library (d3, ECharts, Plotly, Chart.js, etc.). Heatmap-style charts (`HeatmapChart`, `ActivityHeatmap`) MAY render with a CSS grid of cells instead of SVG. (src: packages/ui/core/src/lib/charts/LineChart/LineChart.svelte:49-61,106-184; packages/ui/core/src/lib/charts/BarChart/BarChart.svelte:54-181; packages/ui/core/package.json)

#### Scenario: No charting dependency

- **WHEN** the core package manifest and chart imports are inspected
- **THEN** the system SHALL contain no runtime charting-library dependency and SHALL build chart geometry with local functions

### Requirement: Consistent data-input conventions

The system SHALL accept chart data through one of two conventions: a `series` array of `{ name, data: { x, y }[], color? }` for multi-series X/Y charts (e.g. `LineChart`, `AreaChart`), or a flat `data` array of category/value objects for categorical charts (e.g. `BarChart`). Per-series or per-datum `color` overrides SHALL fall back to a shared default palette. (src: packages/ui/core/src/lib/charts/LineChart/LineChart.svelte:4-5,8,29; packages/ui/core/src/lib/charts/AreaChart/AreaChart.svelte:4-5,8; packages/ui/core/src/lib/charts/BarChart/BarChart.svelte:4,7,14)

#### Scenario: Series default palette

- **GIVEN** a `LineChart` whose series omit a `color`
- **WHEN** the chart renders
- **THEN** the system SHALL assign colors from the shared default palette

### Requirement: Token-themed chrome and responsive scaling

The system SHALL draw structural chrome (grid lines, axes, tick labels, tooltip surfaces) using design tokens (`--color-border-subtle`, `--color-text-*`, `--font-body`, `--font-mono`, `--color-bg-secondary`, `--radius-*`, `--space-*`) and SHALL render into a fixed internal `viewBox` with `preserveAspectRatio="xMidYMid meet"` and 100%-width SVG so charts scale responsively to a prop-driven outer `width`/`height` (defaults `100%` / `300px` for X/Y charts). (src: packages/ui/core/src/lib/charts/LineChart/LineChart.svelte:8-9,31-32,107-108,221,227-313; packages/ui/core/src/lib/charts/BarChart/BarChart.svelte:56-57,191-236)

#### Scenario: Responsive viewBox

- **GIVEN** a `LineChart` placed in a container narrower than its logical canvas
- **WHEN** it renders
- **THEN** the system SHALL scale the SVG to 100% width while preserving aspect ratio

#### Scenario: Themed axes

- **WHEN** a chart's grid and axis labels render
- **THEN** the system SHALL color them via `--color-border-subtle` and `--color-text-*` tokens so they follow the active theme

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

### Requirement: Localizable chart strings

Every chart rendered through `ChartFrame` (LineChart, AreaChart, BarChart, PieChart, ScatterChart, TreeMap, SankeyChart, Sparkline, Gauge, HeatmapChart) SHALL accept an optional `labels` prop of type `ChartLabels<Column>`. Its optional keys are `chart` (accessible name when no title), `columns` (data-table column headers keyed per chart), `tableCaption`, `showData`, `hideData` and `legend` (accessible name of the legend). Each key SHALL override the corresponding English default. Omitted keys SHALL keep the English default, so a chart without `labels` renders exactly as before. `HeatmapChart`'s only column key is `row`, the header of its row-label column (default "Row"). (src: packages/ui/core/src/lib/charts/ChartFrame/chartTable.ts; packages/ui/core/src/lib/charts/chartLabels.test.ts)

#### Scenario: pt-BR data table

- **GIVEN** `<PieChart labels={{ columns: { label: "Categoria", value: "Valor", share: "Parcela" }, tableCaption: "Dados por categoria" }} />`
- **WHEN** the data-table fallback renders
- **THEN** the column headers SHALL be "Categoria", "Valor", "Parcela" and the caption SHALL be "Dados por categoria"

#### Scenario: Localized toggle and legend

- **GIVEN** a LineChart with `labels={{ showData: "Mostrar dados", hideData: "Ocultar dados", legend: "Legenda" }}` and two series
- **WHEN** the user activates the toggle
- **THEN** the toggle SHALL read "Mostrar dados" and then "Ocultar dados", and the legend list SHALL be named "Legenda"

#### Scenario: English defaults preserved

- **GIVEN** any `ChartFrame` chart rendered without `labels`
- **WHEN** it renders
- **THEN** it SHALL use the English headers, caption, toggle text and names it used before this change

### Requirement: Axe gate on every chart story

Every Storybook story file under `packages/ui/core/src/lib/charts/` SHALL set `parameters.a11y.test` to `"error"`, so any axe violation in any chart story fails the Storybook test project. The gate SHALL be met by fixing the component. An individual axe rule MAY be disabled for a story only when the violation is a false positive, with a code comment giving the reason.

(src: packages/ui/core/src/lib/charts/*/*.stories.svelte)

#### Scenario: New violation in an agile chart fails CI

- **GIVEN** the `VelocityChart` stories
- **WHEN** a change introduces an axe violation into `VelocityChart`
- **THEN** the Storybook test project SHALL fail

### Requirement: Accessible heatmap

`HeatmapChart` SHALL render through `ChartFrame`. It SHALL keep its existing props and accept optional `description`, `hideTitle`, `showDataToggle` and `labels` (`ChartLabels<"row">`). It SHALL:

- Expose the labelled grid (axis labels and cells) as one `role="img"` element that receives the `ChartFrame` attributes. `title` SHALL name it, and without a title the name SHALL be `labels.chart` or "Heatmap".
- Render cells as presentational, non-focusable elements. The hover tooltip SHALL stay pointer-only and hidden from assistive technology.
- Derive its data table with `matrixTable`: the first column is headed `labels.columns.row` or "Row", the other columns are the `xLabels`, and each row starts with its `yLabels` entry. Missing labels SHALL fall back to "Column n" / "Row n". An empty matrix SHALL render no table.
- Draw each cell value in opaque black or white, whichever has the higher WCAG contrast against the cell colour, so the value always reaches at least 4.5:1.

(src: packages/ui/core/src/lib/charts/HeatmapChart/HeatmapChart.svelte; packages/ui/core/src/lib/charts/HeatmapChart/heatmapColor.ts; packages/ui/core/src/lib/charts/ChartFrame/chartTable.ts)

#### Scenario: Heatmap is a named image with a table

- **GIVEN** a `HeatmapChart` with `data=[[1, 0.5], [-0.25, 1]]`, `xLabels` and `yLabels` `["A", "B"]` and no title
- **WHEN** it renders
- **THEN** the grid SHALL be one image named "Heatmap" with no focusable cells
- **AND** its table SHALL have headers `Row, A, B` and rows `A, 1, 0.50` and `B, -0.25, 1`

#### Scenario: Cell values stay readable

- **GIVEN** a diverging-scale cell whose background is `#008c24`
- **WHEN** its value is drawn
- **THEN** the text colour SHALL reach at least 4.5:1 contrast against the background

### Requirement: Interactive chart bars

`AgingWIP` and `GanttChart` SHALL make their bars interactive only when a click handler is given (`onitemclick` for `AgingWIP`, `onTaskClick` for `GanttChart`). With the handler:

- Each bar SHALL be `role="button"` with `tabindex="0"` and an `aria-label`. For `AgingWIP` the label SHALL be "<title>, <status>, <n> days in progress", followed by ", <assignee>" when there is one. For `GanttChart` it SHALL be "<label>, <start> to <end>", followed by ", <progress>% complete" when `showProgress` is on and the task has a progress value.
- Enter and Space SHALL call the handler with the bar's item. Existing pointer activation (click for `AgingWIP`, double-click for `GanttChart`) SHALL keep working.
- The chart SVG SHALL be `role="group"` and keep its existing `aria-label`.

Without the handler, the bars SHALL be presentational and not focusable, and the SVG SHALL be `role="img"`. The `GanttChart` timeline scroll container SHALL then be a focusable `region` named "Gantt timeline", so keyboard users can scroll a wide chart.

(src: packages/ui/core/src/lib/charts/AgingWIP/AgingWIP.svelte; packages/ui/core/src/lib/charts/GanttChart/GanttChart.svelte)

#### Scenario: Clickable Gantt bar

- **GIVEN** a `GanttChart` with task "Design" (progress 40) and an `onTaskClick` handler
- **WHEN** the user focuses the "Design" bar and presses Space
- **THEN** the bar SHALL be a button whose name starts with "Design" and ends with "40% complete"
- **AND** `onTaskClick` SHALL be called with that task

#### Scenario: Read-only aging chart

- **GIVEN** an `AgingWIP` without `onitemclick`
- **WHEN** it renders
- **THEN** it SHALL be one image named "Aging Work in Progress chart" with no buttons and no focusable bars

### Requirement: Elevation profile text contrast

`ElevationProfile` SHALL draw its stat labels and muted header text in `--color-text-secondary`, so they meet 4.5:1 contrast on `--color-bg-elevated` in the default dark and light themes.

(src: packages/ui/core/src/lib/charts/ElevationProfile/ElevationProfile.svelte)

#### Scenario: Stat labels pass axe

- **GIVEN** the `WithFresnelZone` story in the dark theme
- **WHEN** axe runs
- **THEN** it SHALL report no `color-contrast` violation on the stat labels

