## 1. Extensions

- [x] 1.1 `Sidebar`: `groups`, item `badge`, `external` (+ `externalLabel`), `onnavigate`, collapsed flyout for items with children; tests and stories
- [x] 1.2 `Breadcrumb`: item `icon` and `iconOnly`; tests and story
- [x] 1.3 `KpiCard`: `visual` snippet beside the value; tests and story with ProgressRing
- [x] 1.4 `PasswordInput`: `ongenerate` + `generateLabel`, `showLabel`/`hideLabel`, native `name`, `autocomplete`, `id`; tests and story
- [x] 1.5 `IconButton`: `badge` + `badgeLabel`; tests and story
- [x] 1.6 `Icon`: add `home`, `bell`, `edit`, `trash`, `key`, `cloud`, `globe`, `more-vertical`, `refresh`, `box` glyphs (24px stroke paths, same style as existing); test that each resolves

## 2. New components

- [x] 2.1 `SplitButton` (primitives): primary Button + joined caret menu via Dropdown; tests and stories
- [x] 2.2 `SettingsRow` (data): icon circle, title, description, badge, actions, `as`, `data-*`; tests and stories
- [x] 2.3 `DescriptionList` (data): `<dl>` of label/value rows with `value`/`action` snippets, `columns`; tests and stories
- [x] 2.4 `KeyValueStrip` (data): inline facts with dividers, copy via CopyButton, link items; tests and stories
- [x] 2.5 `PromoBanner` (feedback): icon, title, description, price slot, actions, dismiss; tests and stories
- [x] 2.6 `PriceTag` (data): current and struck original price via CurrencyDisplay, period, savings badge; tests and stories

## 3. Integration and docs

- [x] 3.1 Export every new component and type from `src/lib/index.ts`; `pnpm check:package` passes
- [x] 3.2 `ConsoleDashboardDemo` in `_testdata` and `src/stories/ConsoleDashboard.stories.svelte` (Overview, Docker empty state, Settings, Domains) built only from library components, axe clean, desktop and 390px
- [x] 3.3 `guides/console-dashboard.md`, README category lines, `documentation/TRD.md` rows
- [x] 3.4 Changeset: minor `@cyberdynecorp/svelte-ui-core`
- [x] 3.5 Full gate: `pnpm lint`, `pnpm -r svelte-check`, unit project, Storybook project for new and changed stories

## 4. Release

- [ ] 4.1 Merge to main, merge the Version Packages PR, confirm the published version
- [ ] 4.2 Archive this change once released
