---
"@cyberdynecorp/svelte-ui-core": minor
---

Run axe in failing mode for every chart story and fix the violations it found.

- `HeatmapChart` renders through `ChartFrame`: the grid is one named image (`role="img"`) with a data-table fallback instead of focusable `role="gridcell"` divs without a grid parent. New optional `description`, `hideTitle`, `showDataToggle` and `labels` (`columns.row`) props; `title` now names the chart. Cell values are drawn in black or white, whichever meets 4.5:1 against the cell colour.
- New `matrixTable(data, xLabels, yLabels, cornerHeader)` helper for matrix-shaped data tables.
- `AgingWIP` and `GanttChart` bars are `role="button"` with a descriptive `aria-label`, activated by Enter or Space, only when `onitemclick` / `onTaskClick` is set; the SVG is then a named `group`. Without a handler the bars are presentational and the SVG stays a single image. A non-interactive Gantt timeline is a focusable region so it can be scrolled by keyboard.
- `ElevationProfile` stat labels and muted text use `--color-text-secondary` for sufficient contrast.
