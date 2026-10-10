# Console dashboard patterns

## Why

A review of a hosting control panel (VPS overview, Docker manager, main settings and domains screens) on 2026-10-10 showed that most of its layout can already be composed from svelte-ui-core: NavBar, PageShell, Sidebar, PageHeader, StatusBadge, Alert, KpiCard with Sparkline, EmptyState, Accordion, DataTable, Switch, Dropdown, CopyButton and Tooltip. What the library lacks is the handful of dense "console" list and detail patterns that such panels repeat on every page: settings action rows, label/value detail panels, inline key/value strips with copy actions, a split primary button, and an upsell banner with a price. Five existing components also miss small options those screens rely on: sidebar section headings, item badges and a flyout for the collapsed icon rail; a breadcrumb home icon; a ring visual on KpiCard; a generate action on PasswordInput; a count badge on IconButton.

## What Changes

- Add `SettingsRow`, `DescriptionList`, `KeyValueStrip`, `SplitButton`, `PromoBanner` and `PriceTag` as themeable, token-driven components. They present application-supplied strings and report intents through callbacks and snippets; they hold no product logic.
- Extend `Sidebar` with grouped sections, item badges, external-link items, an `onnavigate` callback and a hover/focus flyout for items with children while collapsed. Extend `Breadcrumb` items with an optional icon. Extend `KpiCard` with a `visual` snippet beside the value. Extend `PasswordInput` with a generate action plus native `name`/`autocomplete` and i18n labels. Extend `IconButton` with a count badge.
- Add a console dashboard Storybook composition (overview, empty state, settings, domains) built only from library components with synthetic data, and a `guides/console-dashboard.md` adoption guide.
- All changes are additive; existing props and defaults render as before.

## Non-goals

- No product services: no copy-to-clipboard beyond the existing `CopyButton`, no password generation algorithm (the application supplies the generator), no pricing or currency conversion, no routing.
- No new theme. A dotted page decoration stays an application concern.
- No change to `Table`/`DataTable` selection or sorting, which already cover the domains table.

## Capabilities

### New Capabilities

- `console-dashboard-patterns`: settings rows, description lists, key/value strips, split buttons, promo banners and price tags for control-panel screens.

### Modified Capabilities

- `core-components`: additive Sidebar, Breadcrumb, KpiCard, PasswordInput and IconButton options.

## Impact

- `packages/ui/core/src/lib/data/{SettingsRow,DescriptionList,KeyValueStrip,PriceTag}`, `primitives/SplitButton`, `feedback/PromoBanner` (new); `navigation/Sidebar`, `navigation/Breadcrumb`, `data/KpiCard`, `forms/PasswordInput`, `primitives/IconButton` (extended); `src/lib/index.ts` exports; `_testdata/ConsoleDashboardDemo.svelte` and `src/stories/ConsoleDashboard.stories.svelte`; README categories; `documentation/TRD.md`; `guides/console-dashboard.md`.
- Minor version bump of `@cyberdynecorp/svelte-ui-core`.

## Review

The user reviewed the gap analysis on 2026-10-10 and asked for the proposal, the extensions and the new components to be implemented and merged with a new release. Screenshots used for the analysis are not committed; the example uses synthetic hostnames, addresses and prices.
