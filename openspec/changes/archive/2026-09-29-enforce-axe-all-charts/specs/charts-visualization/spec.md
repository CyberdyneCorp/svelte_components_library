## ADDED Requirements

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

## MODIFIED Requirements

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
