---
"@cyberdynecorp/svelte-ui-core": minor
---

SankeyChart: new `formatValue?: (value: number) => string` prop (same signature as `Sparkline`) formats values in node labels, tooltips and the screen-reader data table, e.g. for `Intl.NumberFormat` currency. Node labels now use the foundation body-sm size (`0.875rem`, was a hard-coded `11px`), overridable via `--cy-sankey-label-size`, and render with a space before the value (`Moradia (3200)`).
