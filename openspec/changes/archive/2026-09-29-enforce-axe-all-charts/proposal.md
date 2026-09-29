## Why

`add-chart-accessibility` put nine charts, `ChartFrame` and `ChartLegend` behind a failing axe gate, but ten chart stories still ran axe in `todo` mode, so their violations never failed CI. Turning the gate on for them surfaced real violations in four charts:

| Chart | Axe violations |
|---|---|
| `HeatmapChart` | `aria-required-parent` (focusable `role="gridcell"` divs with no `row`/`grid` parent), `color-contrast` (cell values drawn in translucent black/white, e.g. 4.08:1 on `#008c24`) |
| `AgingWIP` | `aria-command-name` (unnamed `role="button"` bars), `nested-interactive` (focusable bars inside `<svg role="img">`) |
| `GanttChart` | `aria-command-name` and `nested-interactive` (same pattern; the bars also had no key handler), then `scrollable-region-focusable` once the bars stopped being focusable |
| `ElevationProfile` | `color-contrast` (stat labels in `--color-text-tertiary`, 2.97:1 on `--color-bg-elevated` in the dark theme) |

`ActivityHeatmap`, `BurndownChart`, `CumulativeFlow`, `VelocityChart`, `VennDiagram` and `WordCloud` passed unchanged.

## What Changes

- Every story under `packages/ui/core/src/lib/charts/` sets `parameters.a11y.test = "error"`. No axe rule is disabled.
- `HeatmapChart` renders through `ChartFrame`. The labelled grid is one `role="img"` element named by `title` (fallback "Heatmap"). The cells are presentational and no longer focusable. A data table built by the new `matrixTable` helper is the text alternative. New optional props: `description`, `hideTitle`, `showDataToggle`, `labels` (`ChartLabels<"row">`). Cell values are drawn in opaque black or white, whichever contrasts more with the cell colour.
- `AgingWIP` and `GanttChart` bars are buttons only when `onitemclick` / `onTaskClick` is set. Each button has a descriptive `aria-label`, responds to Enter and Space, and sits inside a named `role="group"` SVG. Without a handler the bars are presentational and the SVG stays a `role="img"`. The non-interactive Gantt timeline becomes a focusable, labelled region so keyboard users can scroll it.
- `ElevationProfile` stat labels and muted text use `--color-text-secondary`.
- New `Clickable` stories for `AgingWIP` and `GanttChart` run axe on the interactive path.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `charts-visualization`: all chart stories run axe in failing mode, and the heatmap, aging-WIP, Gantt and elevation-profile charts meet it.

## Impact

- Modified: `HeatmapChart`, `AgingWIP`, `GanttChart`, `ElevationProfile`, `ChartFrame/chartTable.ts` (`matrixTable`), the ten remaining chart stories, and tests.
- New: `charts/HeatmapChart/heatmapColor.ts`.
- `HeatmapChart`'s title now uses the `ChartFrame` caption style instead of its own centred heading.
- Minor version bump of `@cyberdynecorp/svelte-ui-core` (new props and export).
