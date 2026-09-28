## Why

The accessible charts from #18 render user-visible English strings that consumers cannot override:
- data-table column headers ("Label", "Value", "Share", "Source", …)
- the "Show data"/"Hide data" toggle
- the table caption suffix
- the legend's accessible name ("Legend")
- the fallback accessible name ("Line chart", …)

CyberWealth is pt-BR by default, and its i18n gate fails on untranslated user-visible strings.

## What Changes

- New `ChartLabels<Column>` type and `columnHeaders(defaults, overrides)` helper, both exported from core.
- Every `ChartFrame` chart takes an optional `labels` prop. Its keys are `chart`, `columns`, `tableCaption`, `showData`, `hideData` and `legend`; `columns` is typed per chart:

| Chart | Column keys |
|---|---|
| LineChart, AreaChart | `x` |
| BarChart | `label`, `value` |
| PieChart, TreeMap | `label`, `value`, `share` |
| SankeyChart | `source`, `target`, `value` |
| ScatterChart | `series`, `x`, `y`, `label` |
| Sparkline | `time`, `point`, `value` |
| Gauge | `measure`, `value`, `minimum`, `maximum` |

- Every key is optional and falls back to the current English default, so existing usage renders unchanged.

## Impact

- `@cyberdynecorp/svelte-ui-core`: minor (new optional prop and exports; no behaviour change without `labels`).
