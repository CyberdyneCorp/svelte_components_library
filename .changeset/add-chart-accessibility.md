---
"@cyberdynecorp/svelte-ui-core": minor
---

Make charts accessible (#18). New `ChartFrame` component: a `<figure>` with an optional title and description wired to the chart SVG (`aria-labelledby` / `aria-describedby`), plus a data-table fallback. The table is visually hidden, stays available to screen readers, and a "Show data" toggle (`aria-expanded`) reveals it. New `ChartLegend` component with shape markers, and `seriesStyle` / `markerPath` helpers, so series stay distinguishable in grayscale.

`LineChart`, `AreaChart`, `BarChart`, `PieChart`, `Sparkline`, `SankeyChart`, `ScatterChart`, `TreeMap` and `Gauge` take optional `title`, `description`, `hideTitle` and `showDataToggle` props. Each derives its table from its existing data. Line and area series after the first are now dashed and show per-point shape markers (turn these off with `showMarkers={false}`). Pie slices and scatter points carry their series shape. `Sparkline` and `Gauge` keep a screen-reader-only table with no toggle by default. Existing props are unchanged. Storybook axe checks now fail on violations for these charts.
