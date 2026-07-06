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
