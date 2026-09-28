## ADDED Requirements

### Requirement: Localizable chart strings

Every chart rendered through `ChartFrame` (LineChart, AreaChart, BarChart, PieChart, ScatterChart, TreeMap, SankeyChart, Sparkline, Gauge) SHALL accept an optional `labels` prop of type `ChartLabels<Column>`. Its optional keys are `chart` (accessible name when no title), `columns` (data-table column headers keyed per chart), `tableCaption`, `showData`, `hideData` and `legend` (accessible name of the legend). Each key SHALL override the corresponding English default. Omitted keys SHALL keep the English default, so a chart without `labels` renders exactly as before. (src: packages/ui/core/src/lib/charts/ChartFrame/chartTable.ts; packages/ui/core/src/lib/charts/chartLabels.test.ts)

#### Scenario: pt-BR data table

- **GIVEN** `<PieChart labels={{ columns: { label: "Categoria", value: "Valor", share: "Parcela" }, tableCaption: "Dados por categoria" }} />`
- **WHEN** the data-table fallback renders
- **THEN** the column headers SHALL be "Categoria", "Valor", "Parcela" and the caption SHALL be "Dados por categoria"

#### Scenario: Localized toggle and legend

- **GIVEN** a LineChart with `labels={{ showData: "Mostrar dados", hideData: "Ocultar dados", legend: "Legenda" }}` and two series
- **WHEN** the user activates the toggle
- **THEN** the toggle SHALL read "Mostrar dados" and then "Ocultar dados", and the legend list SHALL be named "Legenda"

#### Scenario: English defaults preserved

- **GIVEN** any `ChartFrame` chart rendered without `labels`
- **WHEN** it renders
- **THEN** it SHALL use the English headers, caption, toggle text and names it used before this change
