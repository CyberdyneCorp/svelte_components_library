---
"@cyberdynecorp/svelte-ui-core": minor
---

Charts can now be localized. Every `ChartFrame` chart (Line, Area, Bar, Pie, Scatter, TreeMap, Sankey, Sparkline, Gauge) takes an optional, per-chart typed `labels` prop covering the accessible name, the data-table column headers and caption, the "Show data"/"Hide data" toggle, and the legend name. `ChartLabels` and `columnHeaders` are also exported. Without `labels`, the English defaults are unchanged.
