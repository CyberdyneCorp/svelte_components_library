## ADDED Requirements

### Requirement: Multi-series BarChart

`BarChart` SHALL accept multi-series categorical data and draw it grouped or stacked.

#### Scenario: Complete Multi-series BarChart contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`BarChart` SHALL accept an optional `series: Array<{ name: string; color?: string; data: Array<{ label: string; value: number }> }>` and `stacked` (default `false`). When `series` is non-empty, it SHALL take precedence over `data`. Categories SHALL be the distinct labels in order of first appearance across all series, and a series without a category SHALL count as 0. With `stacked=false`, each category SHALL show one bar per series side by side. With `stacked=true`, each category SHALL show one bar whose segments are stacked in series order, the value axis SHALL scale to the largest category total, and values below 0 SHALL be drawn as 0. Both layouts SHALL work with `horizontal`. Series without a `color` SHALL take colours from the shared default palette in order. When there are two or more series, the chart SHALL render a `ChartLegend` with each series' marker shape, and each bar or segment large enough to hold its marker SHALL draw that series' shape inside it. With `showValues`, grouped bars SHALL label each bar and stacked bars SHALL label the category total. The data-table fallback SHALL have one row per category and one column per series. Single-series `data` rendering SHALL be unchanged.

(src: packages/ui/core/src/lib/charts/BarChart/BarChart.svelte; packages/ui/core/src/lib/charts/BarChart/barLayout.ts)

#### Scenario: Stacked bars

- **GIVEN** series "Compute" with Jan 10 and Feb 20, and "Storage" with Jan 5 and Feb 5, with `stacked`
- **WHEN** it renders
- **THEN** there SHALL be 4 bar segments and the value axis maximum SHALL be at least 25
- **AND** the legend SHALL list "Compute" and "Storage"
- **AND** the data table SHALL have columns for the category, "Compute" and "Storage", and 2 rows

#### Scenario: Grouped bars with a missing category

- **GIVEN** series A with labels "x" and "y", and series B with only "y"
- **WHEN** it renders with `stacked=false`
- **THEN** there SHALL be 2 categories and B's "x" value in the data table SHALL be 0
