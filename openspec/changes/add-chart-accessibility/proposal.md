## Why

The SVG charts have no text alternative for their data, tell series apart by colour alone, and run Storybook axe in `todo` mode, so accessibility regressions never fail CI. Finance consumers (CyberWealth, issue #18) need charts that pass WCAG for screen-reader, keyboard and colour-blind users.

## What Changes

- Add a `ChartFrame` component (`charts/ChartFrame/`). It renders a `<figure>` with an optional visible or visually hidden title and description, hands the chart's `<svg role="img">` its `aria-labelledby` / `aria-describedby` (or `aria-label` fallback), and renders a real data `<table>` built from a normalized `{ columns, rows }` prop. The table has a caption and `scope`d column and row headers. It is visually hidden but always available to screen readers. A "Show data" toggle button (`aria-expanded`, `aria-controls`) reveals it visually and makes it keyboard-scrollable.
- Add a `ChartLegend` component (`charts/ChartLegend/`) with non-colour markers. Each series gets a distinct shape (circle, square, triangle, diamond, triangle-down, cross) and dash pattern from `seriesStyle(index)`. The plot marks use the same shapes and dashes through `markerPath`, so series are identifiable in grayscale.
- Apply both to `LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline` and `SankeyChart`, and also to `ScatterChart`, `TreeMap` and `Gauge`. Each chart derives its table from its existing data props and gains optional `title`, `description`, `hideTitle` and `showDataToggle` props. `LineChart` and `AreaChart` also gain `showMarkers`. `Sparkline` and `Gauge` default to a screen-reader-only table without a toggle, and get no legend.
- Line and area series after the first are dashed and carry per-point shape markers. Pie slices carry their legend shape inside the slice. Scatter points are drawn as their series' shape.
- Stories for every converted chart set `parameters.a11y.test = "error"`, so axe violations fail the Storybook test project. The global preview setting stays `todo`.
- This change is additive. Existing props keep their meaning. Visible differences: a "Show data" button under charts that have it, dashed lines and point markers on multi-series line and area charts, and shape markers in legends and pie slices.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `charts-visualization`: adds the chart accessibility contract (frame, data table, non-colour legend, axe gate).

## Impact

- New: `packages/ui/core/src/lib/charts/ChartFrame/*`, `packages/ui/core/src/lib/charts/ChartLegend/*`, and barrel exports in `packages/ui/core/src/lib/index.ts`.
- Modified: `LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline`, `SankeyChart`, `ScatterChart`, `TreeMap`, `Gauge`, plus their stories and tests.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.
- Not covered: `HeatmapChart` (its cells use `role="gridcell"` with `tabindex` and no grid parent, and its existing `title` prop is a visible heading; it needs its own grid-semantics rework) and the agile/other charts (`ActivityHeatmap`, `AgingWIP`, `BurndownChart`, `CumulativeFlow`, `ElevationProfile`, `GanttChart`, `VelocityChart`, `VennDiagram`, `WordCloud`).
