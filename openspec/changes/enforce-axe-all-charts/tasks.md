## 1. Axe gate

- [x] 1.1 Set `parameters.a11y.test = "error"` in the `ActivityHeatmap`, `AgingWIP`, `BurndownChart`, `CumulativeFlow`, `ElevationProfile`, `GanttChart`, `HeatmapChart`, `VelocityChart`, `VennDiagram` and `WordCloud` stories
- [x] 1.2 Run the Storybook test project on `charts/` and record each violation

## 2. Fixes

- [x] 2.1 `HeatmapChart`: render through `ChartFrame`, make the grid one `role="img"`, drop the focusable `gridcell`s, add a `matrixTable` data table and the `description` / `hideTitle` / `showDataToggle` / `labels` props
- [x] 2.2 `HeatmapChart`: move the colour scale into `heatmapColor.ts` and pick black or white value text by contrast
- [x] 2.3 `AgingWIP`: make bars named buttons (Enter/Space) only with `onitemclick`, SVG `group` vs `img`
- [x] 2.4 `GanttChart`: same for `onTaskClick`, and make the non-interactive timeline a focusable region
- [x] 2.5 `ElevationProfile`: use `--color-text-secondary` for stat labels and muted text
- [x] 2.6 Add `Clickable` stories for `AgingWIP` and `GanttChart`

## 3. Tests and release

- [x] 3.1 Regression unit tests for each fix, and a `HeatmapChart` case in `chartLabels.test.ts`
- [x] 3.2 README Charts section and a minor changeset for `@cyberdynecorp/svelte-ui-core`
- [x] 3.3 `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build`
