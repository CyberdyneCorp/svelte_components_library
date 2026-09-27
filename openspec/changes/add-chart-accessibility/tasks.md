## 1. Shared building blocks

- [x] 1.1 Add `markers.ts`: marker polygons, `seriesStyle`, `markerPath` (SVG) and `markerClipPath` (CSS) from one shape definition
- [x] 1.2 Add `ChartLegend` with shape swatches, optional dashed line samples, details and BEM hooks for host charts
- [x] 1.3 Add `chartTable.ts` (`seriesTable`, `categoryTable`, `ChartTableData`, `ChartA11yAttributes`)
- [x] 1.4 Add `ChartFrame`: figure and figcaption, SVG name and description wiring, captioned table with `scope`d headers, and a "Show data" toggle with `aria-expanded` / `aria-controls`
- [x] 1.5 Unit-test markers, tables, legend and frame

## 2. Apply to charts

- [x] 2.1 `LineChart` and `AreaChart`: frame, series table, dashed lines, point markers, shape legend
- [x] 2.2 `BarChart` and `SankeyChart`: frame and table (bars and nodes are text-labelled, so no legend)
- [x] 2.3 `PieChart`: frame, label/value/share table, in-slice shape markers, shape legend
- [x] 2.4 `Sparkline`: frame with a screen-reader-only table and an accessible name, no legend
- [x] 2.5 Optional charts: `ScatterChart` (shape points and legend), `TreeMap` and `Gauge` (frame and table)
- [x] 2.6 Keep existing tests green; scope text queries that the table fallback now duplicates

## 3. Storybook gate

- [x] 3.1 Set `parameters.a11y.test = "error"` on every converted chart's stories and on `ChartFrame` / `ChartLegend`
- [x] 3.2 Add an `Accessible` story per chart and fix axe violations (Sparkline label contrast)

## 4. Release

- [x] 4.1 Add a changeset (minor bump of `@cyberdynecorp/svelte-ui-core`)
- [x] 4.2 Document the chart accessibility API in Storybook docs
- [ ] 4.3 Follow-up: `HeatmapChart` grid semantics and the remaining charts
- [ ] 4.4 Archive this change once released
