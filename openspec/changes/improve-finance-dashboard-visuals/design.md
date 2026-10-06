# Design

## Visual direction

Retain the calm sage identity and Inter/system font. Use a flat graphite canvas, raised neutral surfaces, visible boundaries, sage for the principal metric and action, and restrained semantic colors accompanied by text for debt/expense states. Avoid decorative waves above headers and empty-state panels in the example. Decorations observed in the deployed app cannot be attributed to library source from browser inspection alone.

Desktop: navigation, compact page heading, a toolbar containing period/scope, summary grid, distribution and a compact positions table. Mobile: heading and actions on separate wrapping rows, filters stacked, summary cards in a grid that collapses when values or width require it, allocation labels/values wrapping and a table in its own scroll container. Do not create page-wide horizontal scrolling. Existing BottomNav remains application-owned composition.

## Component contracts

### PageHeader

Keep existing props. Allow wrapping of the parent and action group, constrain widths and wrap long titles. Preserve source order and native focus behavior. Regression stories cover two actions and a long heading at 320/390px.

### KpiCard

Add `emphasis: 'default' | 'featured'` and `valueTone: 'default' | 'positive' | 'negative'`. Defaults retain current appearance. Featured styling uses semantic/fallback tokens and increased value hierarchy. Color never infers whether a balance is good or bad; the consuming app chooses the tone. Allow long and masked preformatted values to wrap; preserve accessible name and snippet support.

### FilterBar

Preserve existing chip/filter APIs. Supplying children selects an opt-in native-control composition mode; existing chip mode remains the default. Typed snippets for filters (`children`) and optional actions, plus required accessible label. Use a labelled region and CSS grid/flex, not role=toolbar (native form controls retain normal tab navigation). Does not own form submission, URLs or filter state; can live inside a consumer form. No fixed minimum widths on mobile children.

### AllocationBreakdown

`items` have stable id, label, finite signed `percentage`, preformatted `value`, optional marker tone. An accessible label and caller-provided explanation identify the denominator. All values and percentages remain visible as text. Each row has a zero baseline and diverging magnitude relative to the maximum absolute finite percentage; chart geometry is explicitly relative magnitude, not a progress meter. Negative values extend to the negative side and retain their minus sign. Percentages may exceed 100 when expressed against net wealth; never silently normalize or clamp displayed data. Empty, all-zero and invalid numeric inputs cannot produce NaN/Infinity CSS; use an explicit empty or unavailable state with caller-provided labels. Color is decorative and redundant to labels/signs.

## Scope and adoption

Use existing DataTable and EmptyState rather than new product-specific financial row components. Provide a synthetic showcase for wealth and transaction screens. Publish a minor core change with exports and documentation. App adoption replaces custom allocation and filter wrappers, enables featured KpiCard, and removes application-owned wave decoration. Updating only the package version does not migrate custom app markup.

## Verification

Unit/render tests for additive props, FilterBar semantics/snippets, allocation signs/over-100/zero/invalid states. Storybook interaction and accessibility checks where configured. Browser checks at 320, 390 and 1440px for overflow, long Portuguese titles, keyboard focus and light/dark theme. Package build, svelte-check, lint and package contents. Report any unavailable configured browser checks accurately.
