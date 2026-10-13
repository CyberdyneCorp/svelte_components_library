# Query filtering

## Why

Data screens (logs, records, orders, users) need more than the preset filters of `FilterBar`: users build their own conditions over typed fields, see the active query at a glance, and come back to a named set of conditions later. The library has no structured filter model, so each application invents its own condition shape, operator list and chip text. This change adds a shared query model and three components on top of it. Like the utility components, they are written from scratch against this library's conventions.

## What Changes

- Add a typed query model (`QueryField`, `QueryCondition`, `Query`, `QueryOperator`) with pure helpers: `operatorsFor`, `defaultOperator`, `isConditionComplete`, `describeCondition` and `evaluateQuery`, a client-side evaluator for small datasets, demos and tests.
- Add `QueryBuilder` (forms): rows of field, operator and type-appropriate value control, an "all/any" combinator, and add and remove actions.
- Add `FilterChipRow` (data): the complete conditions of a query as removable chips with a "Clear all" action.
- Add `SavedViews` (data): pick, save, update, rename and delete named views of application-defined state. Persistence is the application's job.

## Non-goals

- No nested condition groups, and no mixing of AND and OR in one query.
- No server query translation (SQL, URL or GraphQL). Applications map `Query` themselves, and `evaluateQuery` is a convenience, not a data layer.
- No storage in `SavedViews` (no `localStorage`) and no sharing or permissions on views.
- No change to `FilterBar`, which stays the component for preset filters.

## Capabilities

### New Capabilities

- `query-filtering`: query model and helpers, QueryBuilder, FilterChipRow, SavedViews.

## Impact

- New: `data/QueryBuilder/query.ts` (model and helpers), `forms/QueryBuilder`, `data/FilterChipRow`, `data/SavedViews`.
- Depends on `add-utility-display-components` for `Dialog.confirmDisabled`.
- Exports, stories (including a composed "Filtered list" story with DataTable), README, TRD, and a `guides/query-filtering.md` adoption guide. Minor changeset.

## Review

The user selected this set on 2026-10-13 as a medium-sized OpenSpec change, to be implemented after the utility components.
