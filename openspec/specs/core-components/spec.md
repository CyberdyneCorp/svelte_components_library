# Core Components

## Purpose

The `@cyberdynecorp/svelte-ui-core` package provides the general-purpose UI component families (primitives, forms, feedback, navigation, data display, layout, overlay, auth, chat, crypto, ml, graph, maps, editor). All components are authored in Svelte 5 runes mode, follow a uniform folder/authoring convention, consume design tokens for all styling, and apply consistent accessibility patterns. This spec captures the shared conventions plus representative component contracts.

## Requirements

### Requirement: Svelte 5 runes authoring convention

The system SHALL author every component in Svelte 5 runes mode (`<svelte:options runes={true} />`), declaring props via `$props()`, local state via `$state()`, two-way bindable props via `$bindable()`, derived values via `$derived`/`$derived.by`, and slotted content via Svelte `Snippet` + `{@render children()}`.

#### Scenario: Complete Svelte 5 runes authoring convention contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL author every component in Svelte 5 runes mode (`<svelte:options runes={true} />`), declaring props via `$props()`, local state via `$state()`, two-way bindable props via `$bindable()`, derived values via `$derived`/`$derived.by`, and slotted content via Svelte `Snippet` + `{@render children()}`. Each component SHALL live in its own directory containing `Component.svelte`, an `index.ts` re-export, a `Component.stories.svelte`, and a `Component.test.ts`. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte:1,4,6-40; packages/ui/core/src/lib/forms/TextInput/TextInput.svelte:1,5; packages/ui/core/src/lib/primitives/Button/index.ts:1)

#### Scenario: Component folder shape

- **GIVEN** the `primitives/Button/` directory
- **WHEN** its contents are listed
- **THEN** the system SHALL include `Button.svelte`, `index.ts`, `Button.stories.svelte`, and `Button.test.ts`

#### Scenario: Bindable prop

- **GIVEN** `TextInput`
- **WHEN** its `value` prop is declared at `TextInput.svelte:5`
- **THEN** the system SHALL make it a `$bindable("")` string enabling `bind:value`

### Requirement: Barrel export surface

The system SHALL re-export every public component from `packages/ui/core/src/lib/index.ts`, grouped by family with section comments, so consumers import named components from the package root. (src: packages/ui/core/src/lib/index.ts:1-254)

#### Scenario: Named import

- **WHEN** a consumer writes `import { Button, Card, Badge } from "@cyberdynecorp/svelte-ui-core"`
- **THEN** the system SHALL resolve each name to its component via the barrel export

### Requirement: Button contract

The system SHALL provide a `Button` with a `variant` prop restricted to `"brand" | "secondary" | "outline" | "ghost" | "danger"` (default `"brand"`), a `size` prop restricted to `"sm" | "md" | "lg"` (default `"md"`, heights 32/40/48px), boolean `disabled` and `loading` props (default `false`), and a `type` prop `"button" | "submit" | "reset"` (default `"button"`).

#### Scenario: Complete Button contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a `Button` with a `variant` prop restricted to `"brand" | "secondary" | "outline" | "ghost" | "danger"` (default `"brand"`), a `size` prop restricted to `"sm" | "md" | "lg"` (default `"md"`, heights 32/40/48px), boolean `disabled` and `loading` props (default `false`), and a `type` prop `"button" | "submit" | "reset"` (default `"button"`). When `loading` is true the button SHALL be disabled, render a spinner, hide its content, and set `aria-busy`. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte:7-11,29-33,42,60-71,109-125)

#### Scenario: Loading disables and busies the button

- **GIVEN** a `Button` with `loading={true}`
- **WHEN** it renders
- **THEN** the system SHALL set the native `disabled` attribute, set `aria-busy`, and hide the button content behind a spinner

#### Scenario: Invalid variant rejected by type

- **GIVEN** the `variant` prop typed at `Button.svelte:29`
- **WHEN** a consumer passes a value outside the five allowed variants
- **THEN** the system SHALL reject it at type-check time

### Requirement: Form control validation display

The system SHALL, for form controls (e.g. `TextInput`, `Select`, `Checkbox`), render an error message as an element with `role="alert"`, set `aria-invalid` when an `error` is present, and link the control to its error or hint text via `aria-describedby`.

#### Scenario: Complete Form control validation display contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL, for form controls (e.g. `TextInput`, `Select`, `Checkbox`), render an error message as an element with `role="alert"`, set `aria-invalid` when an `error` is present, and link the control to its error or hint text via `aria-describedby`. `TextInput` SHALL restrict its `type` prop to eleven allowed HTML input types (default `"text"`) and auto-generate a stable id when none is supplied. (src: packages/ui/core/src/lib/forms/TextInput/TextInput.svelte:29-40,50,75-80; packages/ui/core/src/lib/forms/Select/Select.svelte:37-38,54; packages/ui/core/src/lib/forms/Checkbox/Checkbox.svelte:32-34,51)

#### Scenario: Error surfaced accessibly

- **GIVEN** a `TextInput` with a non-empty `error` prop
- **WHEN** it renders
- **THEN** the system SHALL set `aria-invalid`, render the error text with `role="alert"`, and reference it via `aria-describedby`

### Requirement: Toast queue manager

The system SHALL provide a `Toast` component that exposes an imperative API via Svelte context under key `"toast"` with methods `success`, `warning`, `error`, `info` (each taking a message and optional `{ label, onclick }` action) and `dismiss`. Toasts SHALL auto-dismiss after 5000ms and animate out over 300ms; the container SHALL be `aria-live="polite"` and each toast `role="alert"`. (src: packages/ui/core/src/lib/feedback/Toast/Toast.svelte:12,22,26-41,48-56,70,75,86)

#### Scenario: Auto-dismiss

- **GIVEN** a toast added via the context API
- **WHEN** 5000ms elapse
- **THEN** the system SHALL begin dismissing it and remove it after a 300ms exit animation

### Requirement: Accessible overlays and tab navigation

The system SHALL implement `Modal` as a dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title, focus trap on Tab/Shift+Tab, Escape-to-close, backdrop-click-to-close, and auto-focus of the close button on open.

#### Scenario: Complete Accessible overlays and tab navigation contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL implement `Modal` as a dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title, focus trap on Tab/Shift+Tab, Escape-to-close, backdrop-click-to-close, and auto-focus of the close button on open. `Tabs` SHALL implement `role="tablist"`/`role="tab"` with `aria-selected`, roving tabindex, and ArrowLeft/ArrowRight navigation with wraparound. (src: packages/ui/core/src/lib/overlay/Modal/Modal.svelte:27-57,62-66; packages/ui/core/src/lib/navigation/Tabs/Tabs.svelte:19-33,36-43)

#### Scenario: Modal focus trap and escape

- **GIVEN** an open `Modal`
- **WHEN** the user presses Escape or Tab past the last focusable element
- **THEN** the system SHALL close on Escape and cycle focus within the dialog on Tab

### Requirement: Components consume design tokens only

The system SHALL style every component using CSS custom properties (component-layer tokens such as `--btn-brand-bg`, `--input-bg`, semantic state tokens `--color-state-*`, plus `--space-*`, `--radius-*`, `--font-*`) rather than literal color values, so theme switches occur entirely at the token layer.

#### Scenario: Complete Components consume design tokens only contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL style every component using CSS custom properties (component-layer tokens such as `--btn-brand-bg`, `--input-bg`, semantic state tokens `--color-state-*`, plus `--space-*`, `--radius-*`, `--font-*`) rather than literal color values, so theme switches occur entirely at the token layer. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte:79-209; packages/ui/core/src/lib/forms/TextInput/TextInput.svelte:108-148; packages/ui/core/src/lib/feedback/Alert/Alert.svelte:97-124)

#### Scenario: Button style references tokens

- **WHEN** the `Button` `<style>` block is inspected
- **THEN** the system SHALL reference `--btn-*`, `--space-*`, `--radius-*`, and `--font-*` tokens and SHALL NOT hardcode brand hex values

### Requirement: Authentication components

The system SHALL provide a `LoginPage` with a `mode` prop `"credentials" | "wallet" | "both"` (default `"both"`) that conditionally renders a credentials form and/or an injected `walletSection` snippet, exposing bindable `email`/`password` and `onsubmit`/`onsignup`/`onforgotpassword` callbacks.

#### Scenario: Complete Authentication components contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a `LoginPage` with a `mode` prop `"credentials" | "wallet" | "both"` (default `"both"`) that conditionally renders a credentials form and/or an injected `walletSection` snippet, exposing bindable `email`/`password` and `onsubmit`/`onsignup`/`onforgotpassword` callbacks. The system SHALL provide a `WalletConnect` whose wallet options carry an `icon` restricted to `"metamask" | "walletconnect" | "coinbase" | "phantom" | "custom"`, defaulting to a built-in set of MetaMask, WalletConnect, Coinbase, and Phantom when none are supplied, and disabling other options while one connection is in progress. (src: packages/ui/core/src/lib/auth/LoginPage/LoginPage.svelte:6,9,19,35-37,158-160; packages/ui/core/src/lib/auth/WalletConnect/WalletConnect.svelte:4-9,23-28,30,32-36,60)

#### Scenario: Wallet connection in progress

- **GIVEN** a `WalletConnect` with a connection started for one wallet
- **WHEN** the user views the other options
- **THEN** the system SHALL disable the other wallet buttons and show a spinner on the active one

### Requirement: Labelable navigation landmarks

The system SHALL let consumers name the `<nav>` landmark rendered by `Sidebar` and `BottomNav` through an optional `ariaLabel` prop. `Sidebar` SHALL render no `aria-label` when the prop is omitted. `BottomNav` SHALL default to `"Bottom navigation"`. Pages with several navigation regions can then give each landmark a distinct, translated name. (src: packages/ui/core/src/lib/navigation/Sidebar/Sidebar.svelte; packages/ui/core/src/lib/navigation/BottomNav/BottomNav.svelte)

#### Scenario: Custom landmark name

- **GIVEN** `<Sidebar ariaLabel="Main navigation" />`
- **WHEN** it renders
- **THEN** the system SHALL expose a navigation landmark named "Main navigation"

#### Scenario: Translated bottom navigation

- **GIVEN** `<BottomNav ariaLabel="Navegação inferior" />`
- **WHEN** it renders
- **THEN** the navigation landmark SHALL be named "Navegação inferior" instead of the English default

### Requirement: MoneyInput contract

The system SHALL provide a `MoneyInput` form component.

#### Scenario: Complete MoneyInput contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a `MoneyInput` form component. It SHALL:

- Take a bindable `value` of type `string | null`, where `null` means empty. When set, the value SHALL always be a canonical decimal string with exactly the currency's minor-unit fraction digits (`"1234.56"`, `"-5.00"`, `"1500"` for JPY). The component SHALL never convert an amount to a JS `number`.
- Take a required ISO 4217 `currency`, plus optional `locale`, decimal-string `min`/`max`, `label`, `error`, `hint`, `name`, `disabled`, `required`, `id`, `allowNegative` (default `false`) and `onchange(value)`.
- Derive minor units from `Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits`.
- Render a `type="text"` input with `inputmode="decimal"`.
- Format with Intl currency style while unfocused, and show the plain number with the locale's decimal mark while focused.
- Clamp to `min`/`max` on blur.
- When `name` is set, render a hidden input carrying the canonical value.

(src: packages/ui/core/src/lib/forms/MoneyInput/MoneyInput.svelte; packages/ui/core/src/lib/forms/MoneyInput/money.ts)

#### Scenario: Round-trip precision

- **GIVEN** a `MoneyInput` with `currency="USD"`
- **WHEN** the user types `12345678901234.56` and the field blurs
- **THEN** the system SHALL emit the value `"12345678901234.56"` exactly
- **AND** the field SHALL display `$12,345,678,901,234.56`

#### Scenario: Separator parsing

- **GIVEN** a currency with 2 minor units
- **WHEN** the user types `1.234,56`, `1,234.56`, `12,5` or `1,234`
- **THEN** the system SHALL treat the last `.` or `,` as the decimal separator only when at most 2 digits follow it, and SHALL drop every other separator as grouping
- **AND** it SHALL emit `"1234.56"`, `"1234.56"`, `"12.50"` and `"1234.00"` respectively

#### Scenario: Blur formatting

- **GIVEN** a `MoneyInput` with `currency="EUR"`, `locale="de-DE"` and `value="1234.56"`
- **WHEN** the field is unfocused
- **THEN** it SHALL display `1.234,56 €`
- **WHEN** the field receives focus
- **THEN** it SHALL display the editable text `1234,56`

#### Scenario: Minor-unit limit

- **GIVEN** a `MoneyInput` with `currency="JPY"` (0 minor units)
- **WHEN** the user types `1.500`
- **THEN** the system SHALL treat the separator as grouping and emit `"1500"`
- **AND** characters other than digits, `.`, `,` and (only with `allowNegative`) a leading `-` SHALL be removed from the field while typing

#### Scenario: Accessible error

- **GIVEN** a `MoneyInput` with a `label`, a `hint` and an `error`
- **WHEN** it renders
- **THEN** the label SHALL be tied to the input via `for`/`id`
- **AND** the input SHALL set `aria-invalid="true"` and an `aria-describedby` that references both the hint id and the error id
- **AND** the error text SHALL be rendered with `role="alert"`

### Requirement: CurrencyDisplay contract

The system SHALL provide a `CurrencyDisplay` data component.

#### Scenario: Complete CurrencyDisplay contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a `CurrencyDisplay` data component. It SHALL:

- Take a required decimal-string `amount` (e.g. `"-1234.50"`) and a required ISO 4217 `currency`, plus optional `locale`, `signDisplay` (`auto` | `always` | `exceptZero` | `negative` | `never`, default `auto`), `currencyDisplay` (`symbol` | `narrowSymbol` | `code` | `name`, default `symbol`), `tone` (`neutral` | `signed`, default `neutral`), `masked` (default `false`), `maskedLabel` (default `"Hidden amount"`) and `negativeLabel` (default `"negative"`).
- Format through `formatMoney` (Intl currency style with string input) and never convert the amount to a JS `number`.
- Render with tabular numerals (`font-variant-numeric: tabular-nums`) using foundation font tokens.
- Keep negative amounts identifiable without colour: the formatted sign SHALL be shown for negatives unless `signDisplay="never"`, in which case a visually hidden `negativeLabel` prefix SHALL be rendered. The sign SHALL be the sign of the amount as displayed after rounding to the currency's minor units: an amount that displays as zero (e.g. `"-0.00"`, or `"-0.001"` in USD) SHALL render without a minus sign, label or tone colour. `tone="signed"` MAY colour positive and negative amounts with `--color-state-success` / `--color-state-error`, and colouring SHALL be dropped while masked.
- When `masked`, keep the rendered width of the value, expose only `maskedLabel` to assistive technology, and keep the real digits (including locale-native digits such as Arabic-Indic) out of both the accessibility tree and the DOM.
- When the amount is not a decimal string or the currency cannot be formatted, render an em dash and log a single `console.warn` per invalid input, without throwing.

(src: packages/ui/core/src/lib/data/CurrencyDisplay/CurrencyDisplay.svelte; packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts)

#### Scenario: Locale formatting

- **GIVEN** a `CurrencyDisplay` with `amount="1234.56"`
- **WHEN** it renders with `currency="USD"`, `locale="en-US"`, or with `currency="EUR"`, `locale="de-DE"`, or with `amount="1500"`, `currency="JPY"`
- **THEN** it SHALL display `$1,234.56`, `1.234,56 €` and `¥1,500` respectively
- **AND** `amount="12345678901234.56"` in USD SHALL display `$12,345,678,901,234.56` exactly

#### Scenario: Negative without colour

- **GIVEN** `amount="-12.30"`, `currency="USD"`, `locale="en-US"`
- **WHEN** `signDisplay` is `auto`, `always`, `exceptZero` or `negative`
- **THEN** it SHALL display `-$12.30` with no additional label
- **WHEN** `signDisplay` is `never`
- **THEN** it SHALL display `$12.30` preceded by visually hidden text `negative`, so assistive technology announces "negative $12.30"

#### Scenario: Amount that displays as zero

- **GIVEN** `amount="-0.00"` or `amount="-0.001"`, `currency="USD"`, `locale="en-US"`, `tone="signed"`
- **WHEN** it renders
- **THEN** it SHALL display `$0.00` without a minus sign and without the error or success colour
- **AND** with `signDisplay="never"` it SHALL NOT render the `negativeLabel`

#### Scenario: Signed tone

- **GIVEN** `tone="signed"`
- **WHEN** the amount is negative, positive or zero
- **THEN** the component SHALL apply the error colour, the success colour, or no colour respectively
- **AND** the negative sign or label SHALL still be rendered

#### Scenario: Masked amount

- **GIVEN** a `CurrencyDisplay` with `amount="-1234.56"` and `masked`
- **WHEN** it renders
- **THEN** the only text exposed to assistive technology SHALL be `maskedLabel` ("Hidden amount" by default)
- **AND** the DOM SHALL contain no digit of the real amount
- **AND** its rendered width SHALL equal the width of the same amount unmasked
- **AND** with `locale="ar-EG"` the DOM SHALL contain no Arabic-Indic digit of the real amount either

#### Scenario: Invalid amount

- **GIVEN** an `amount` such as `"abc"`, `""` or `"1,234.50"`, or an unknown `currency`
- **WHEN** it renders, including on later re-renders with the same input
- **THEN** it SHALL display an em dash (`—`)
- **AND** it SHALL call `console.warn` exactly once for that input and SHALL NOT throw

### Requirement: ThemeToggle theme preference

`ThemeToggle` SHALL delegate theme resolution, application and persistence to `createThemePreference` from `@cyberdynecorp/svelte-ui-foundation/theme`, using `persistKey` as the storage key; an empty `persistKey` keeps the choice in memory only.

#### Scenario: Complete ThemeToggle theme preference contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`ThemeToggle` SHALL delegate theme resolution, application and persistence to `createThemePreference` from `@cyberdynecorp/svelte-ui-foundation/theme`, using `persistKey` as the storage key; an empty `persistKey` keeps the choice in memory only. By default it SHALL render the existing two-state light/dark switch with its existing props (`theme`, `size`, `persistKey`, `onchange`) and accessible name. With `includeSystem` it SHALL render a `role="radiogroup"` named by `ariaLabel` (default "Color theme") that contains native radio inputs labelled "Light", "Dark" and "System"; the checked option SHALL be marked by an outline of at least 3:1 contrast, not by colour alone. The `themes` prop (default `{ light: "light", dark: "dark" }`) SHALL map the modes to the `data-theme` values applied. The component SHALL expose bindable `theme` (the resolved mode) and `preference` (`"light" | "dark" | "system"`). It SHALL call `onchange` with the resolved mode and `onpreferencechange` with the chosen preference after a user choice. It SHALL stop following the OS when it unmounts. (src: packages/ui/core/src/lib/primitives/ThemeToggle/ThemeToggle.svelte)

#### Scenario: Two-state default is unchanged

- **GIVEN** a `ThemeToggle` with no new props and a stored `"light"` under `cyberdyne-theme`
- **WHEN** it mounts and the user clicks it
- **THEN** it SHALL first apply `data-theme="light"`, then apply and persist `"dark"`, and call `onchange("dark")`

#### Scenario: System option follows the OS

- **GIVEN** `includeSystem` and `themes={{ light: "calm", dark: "calm-dark" }}` with no stored choice
- **WHEN** the OS switches from light to dark
- **THEN** the "System" radio SHALL stay checked and `data-theme` SHALL change from `calm` to `calm-dark`

#### Scenario: Explicit choice from the radio group

- **GIVEN** `includeSystem`
- **WHEN** the user selects "Dark"
- **THEN** the component SHALL persist the dark theme name, call `onpreferencechange("dark")`, and ignore later OS changes

### Requirement: KpiCard contract

The system SHALL provide a neutral `KpiCard` data-display component, exported from the package root.

#### Scenario: Complete KpiCard contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a neutral `KpiCard` data-display component, exported from the package root. (`StatCard` is taken by `retro/StatCard`.) It SHALL:

- Take a required `label` and a preformatted `value`, plus optional preformatted `delta`, `deltaLabel`, `trend` (`"up" | "down" | "flat"`), `sentiment` (`"positive" | "negative" | "neutral"`, default `"neutral"`), `href`, a `sparkline` snippet, `trendLabels` and `ariaLabel`.
- Drive the arrow icon from `trend` and the colour from `sentiment`, so the two stay independent.
- Never convey the trend by colour alone. It SHALL render an `aria-hidden` arrow icon together with visually hidden text, which defaults to `increased`, `decreased` and `unchanged` and can be overridden per trend through `trendLabels`.
- When `href` is set, render the whole card as a single `<a>` whose accessible name is the card text (label, value, trend text, delta and delta label) unless `ariaLabel` overrides it.
- When `href` is not set, render a non-interactive `<article>` labelled by the label (or by `ariaLabel`).
- Render the `sparkline` snippet in its own area below the value, and omit that area when no snippet is given.
- Style only with defined card and state tokens (`--card-bg`, `--card-border`, `--card-hover-border`, `--color-state-success`, `--color-state-error`).

(src: packages/ui/core/src/lib/data/KpiCard/KpiCard.svelte)

#### Scenario: Rising expenses are negative

- **GIVEN** a `KpiCard` with `trend="up"`, `sentiment="negative"` and `delta="+12%"`
- **WHEN** it renders
- **THEN** it SHALL show an upward arrow icon with `aria-hidden="true"` and the visually hidden text `increased`
- **AND** the delta SHALL use the negative (error) colour

#### Scenario: Linked card

- **GIVEN** a `KpiCard` with `label="Monthly spend"`, `value="€1,240.00"`, `trend="up"`, `delta="+4.2%"`, `deltaLabel="vs last month"` and `href="/spend"`
- **WHEN** it renders
- **THEN** it SHALL render exactly one link to `/spend` with the accessible name `Monthly spend €1,240.00 increased +4.2% vs last month`
- **AND** it SHALL NOT render an `article`

#### Scenario: Static card

- **GIVEN** a `KpiCard` without `href`
- **WHEN** it renders
- **THEN** it SHALL render an `article` whose accessible name is the label, with no link

#### Scenario: Translated trend text

- **GIVEN** a `KpiCard` with `trend="down"` and `trendLabels={{ down: "diminuiu" }}`
- **WHEN** it renders
- **THEN** the visually hidden trend text SHALL be `diminuiu`

### Requirement: BudgetBar contract

The system SHALL provide a `BudgetBar` data-display component, exported from the package root.

#### Scenario: Complete BudgetBar contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL provide a `BudgetBar` data-display component, exported from the package root. It SHALL:

- Take `spent`, `limit` and an optional `committed` as decimal strings, a required ISO 4217 `currency`, an optional `locale`, `thresholds` (default `[0.8, 1]`), a required `label`, plus `stateLabels`, `messages` and `ariaLabel` for i18n and naming.
- Treat an invalid amount as `"0"` and an empty `committed` as absent. Truncate every amount to the currency's minor units, and display that same canonical amount, so the shown values always agree with the state and overage. Compute the overage with BigInt minor units. Use `Number()` only to derive the spent/limit ratio, and format every displayed amount with `formatMoney`.
- Never divide by a zero or negative limit. With such a limit, any positive spending SHALL be `exceeded`, and no spending SHALL be `ok`.
- Derive the state from the ratio: `approaching` when the ratio is at or above `thresholds[0]`, `exceeded` when it is strictly above `thresholds[1]`, and `ok` otherwise.
- Distinguish the states by visible text and a distinct `aria-hidden` icon, as well as colour (`--color-state-success`, `--color-state-warning`, `--color-state-error`).
- Render the track with `role="meter"`, named by the label through `aria-labelledby` (or by `ariaLabel`), with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` equal to the rounded spent percentage capped at 100, and an `aria-valuetext` joining the amount text, the committed text, the overage text and the state label.
- Cap the spent segment at 100% width and show the overage as text when `spent` exceeds `limit`.
- Draw `committed` as a striped, translucent segment stacked after `spent`, capped so both segments fit within 100%.

(src: packages/ui/core/src/lib/data/BudgetBar/BudgetBar.svelte; packages/ui/core/src/lib/data/BudgetBar/budget.ts)

#### Scenario: Approaching the limit

- **GIVEN** a `BudgetBar` with `spent="820"`, `limit="1000"`, `currency="EUR"`, `locale="en-IE"` and `label="Groceries"`
- **WHEN** it renders
- **THEN** a meter named `Groceries` SHALL expose `aria-valuenow="82"` and `aria-valuetext="€820.00 of €1,000.00, approaching limit"`
- **AND** the visible state SHALL read `approaching limit` next to the approaching icon

#### Scenario: Over the limit

- **GIVEN** a `BudgetBar` with `spent="1120.50"` and `limit="1000"` in EUR
- **WHEN** it renders
- **THEN** the spent segment SHALL be 100% wide and `aria-valuenow` SHALL be `100`
- **AND** the text `€120.50 over` SHALL be shown
- **AND** `aria-valuetext` SHALL be `€1,120.50 of €1,000.00, €120.50 over, limit exceeded`

#### Scenario: Zero limit

- **GIVEN** a `BudgetBar` with `spent="25"` and `limit="0"`
- **WHEN** it renders
- **THEN** no division by zero SHALL occur, the state SHALL be `exceeded` and no text SHALL contain `NaN`

#### Scenario: Sub-minor-unit precision

- **GIVEN** a `BudgetBar` with `spent="1000.009"` and `limit="1000"` in EUR
- **WHEN** it renders
- **THEN** `aria-valuetext` SHALL be `€1,000.00 of €1,000.00, approaching limit` (no rounded-up `€1,000.01` beside a non-exceeded state)

#### Scenario: Committed amount

- **GIVEN** a `BudgetBar` with `spent="600"`, `committed="150"` and `limit="1000"`
- **WHEN** it renders
- **THEN** a committed segment 15% wide SHALL follow the spent segment
- **AND** `aria-valuetext` SHALL include `€150.00 committed`

#### Scenario: Translated text

- **GIVEN** a `BudgetBar` with `stateLabels={{ exceeded: "orçamento estourado" }}` and `messages` overriding `amount` and `overage`
- **WHEN** it renders over the limit
- **THEN** the visible state and `aria-valuetext` SHALL use the translated words

### Requirement: Components expose design-style tokens

Core components SHALL route the style-defining parts of their look through the design-style tokens, so that a theme can reach them.

#### Scenario: Complete Components expose design-style tokens contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

Core components SHALL route the style-defining parts of their look through the design-style tokens, so that a theme can reach them.

Backgrounds SHALL be written as `background: <layer tokens>, <surface colour>`:

- **Surface containers** use `var(--texture-surface), var(--gradient-surface), <surface>`. They are Card, Modal, Dialog, Drawer, Popover, NavBar, Header, Sidebar, BottomNav, DataTable, the PageShell/AppLayout header and sidebar, and the secondary Button.
- **Table headers** (Table, DataTable) use `var(--gradient-surface), <header bg>`.
- **The brand Button** uses `var(--gradient-brand), <brand bg>` at rest, `var(--gradient-brand-hover), <brand hover bg>` on hover and `var(--gradient-brand-active), <brand active bg>` when pressed.
- **The active Tab** SHALL paint `var(--gradient-accent)` only as a decorative indicator strip on its underline, never under the label.
- **Page shells** (PageShell, AppLayout, and `body` in `base.css`) use `var(--pattern-backdrop), var(--gradient-backdrop), var(--color-bg-primary)`.

Other properties:

- **Glass:** the floating Modal, Dialog and Popover panels SHALL set `backdrop-filter: var(--surface-blur)`. Containers that can hold arbitrary content (Card, Drawer, NavBar, Header, BottomNav) SHALL NOT set `backdrop-filter`, because it makes them the containing block of `position: fixed` descendants.
- **Borders:** the wired components SHALL write their borders as `var(--border-width) var(--border-style) <colour>`. Tab and NavBar active indicators SHALL use `var(--border-width-strong)`. Focus outlines SHALL keep their literal width.
- **Shadows:**
  - Button and Card SHALL include `var(--shadow-offset)` and `var(--shadow-raised)` in `box-shadow`, at rest and on hover (hover glows are appended, never substituted).
  - Button `:active` SHALL include `var(--shadow-pressed)`.
  - Modal, Dialog, Drawer and Popover SHALL prepend `var(--shadow-offset)` to their elevation shadow.
  - TextInput, Textarea and Select SHALL include `var(--shadow-inset)`, at rest and when focused.
- **Titles:** the Modal, Dialog, Drawer, Header and PageHeader titles SHALL use `font-family: var(--font-decorative)` and `text-transform: var(--heading-transform)`.
- **Accents:** CommentThread depth markers SHALL use `--color-accent-1..3` for depths 1–3 and `--color-accent-4` for depth 4 and deeper.

With the default token values, every component SHALL render as before. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte; packages/ui/core/src/lib/layout/Card/Card.svelte; packages/ui/core/src/lib/overlay/Modal/Modal.svelte; packages/ui/core/src/lib/navigation/Tabs/Tabs.svelte)

#### Scenario: Default rendering is unchanged

- **GIVEN** no design-style preset is loaded
- **WHEN** a Card, Button or Modal renders
- **THEN** its computed background colour, border and visible shadows SHALL match the pre-change rendering

#### Scenario: Brutalism reaches the Button

- **GIVEN** a theme that sets `--border-width: 3px` and `--shadow-offset: 4px 4px 0 0 #000`
- **WHEN** a Button renders inside it
- **THEN** the Button SHALL show a 3px border and a hard 4px offset shadow, with no prop changes

### Requirement: Drawer accessibility contract

The system SHALL implement `Drawer` as a modal dialog.

#### Scenario: Complete Drawer accessibility contract contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL implement `Drawer` as a modal dialog. Its existing props (`open` bindable, `side`, `width`, `title`, `children`, `footer`) keep their meaning. It SHALL:

- On open, move focus to the first focusable element in the panel, or to the panel itself (which carries `tabindex="-1"`) when it has none.
- Keep Tab and Shift+Tab inside the panel: Tab on the last focusable element moves to the first, and Shift+Tab on the first moves to the last. Disabled controls are skipped.
- Close on Escape, on a click on the backdrop (not the panel), and on the close button. Each of these SHALL set `open` to `false` and then call the optional `onclose` callback once. Setting `open` to `false` from the parent SHALL NOT call `onclose`.
- On close, return focus to the element that was focused when it opened, if that element is still in the document.
- Name the close button with the optional `closeLabel` prop, defaulting to `"Close drawer"`.
- Share its Tab trap with `Modal` and `Dialog` through `overlay/focusTrap.ts`.

(src: packages/ui/core/src/lib/layout/Drawer/Drawer.svelte; packages/ui/core/src/lib/overlay/focusTrap.ts)

#### Scenario: Focus moves in and returns to the opener

- **GIVEN** a focused button outside the drawer
- **WHEN** the drawer opens and the user then presses Escape
- **THEN** focus SHALL first be on the drawer's first focusable element
- **AND** after Escape the drawer SHALL close, `onclose` SHALL be called once, and focus SHALL be back on the button

#### Scenario: Tab wraps inside the drawer

- **GIVEN** an open drawer whose footer holds an "Apply" button
- **WHEN** focus is on "Apply" and the user presses Tab
- **THEN** focus SHALL move to the close button
- **AND** Shift+Tab on the close button SHALL move focus back to "Apply"

#### Scenario: Translated close label

- **GIVEN** a drawer with `closeLabel="Fechar painel"`
- **WHEN** it renders open
- **THEN** its close button SHALL have the accessible name "Fechar painel"

#### Scenario: Drawer stories fail on axe violations

- **WHEN** the Storybook test project runs the `Layout/Drawer` stories
- **THEN** they SHALL run with `parameters.a11y.test = "error"`, so any axe violation fails the run

### Requirement: Overlays stack above fixed navigation

The system SHALL set the `z-index` of the `Drawer`, `Modal` and `Dialog` overlays to `var(--z-overlay)` and of `BottomNav` to `var(--z-nav)`, so an open overlay, including the drawer footer, is never covered by `BottomNav`.

#### Scenario: Complete Overlays stack above fixed navigation contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

The system SHALL set the `z-index` of the `Drawer`, `Modal` and `Dialog` overlays to `var(--z-overlay)` and of `BottomNav` to `var(--z-nav)`, so an open overlay, including the drawer footer, is never covered by `BottomNav`. (src: packages/ui/core/src/lib/layout/Drawer/Drawer.svelte; packages/ui/core/src/lib/overlay/Modal/Modal.svelte; packages/ui/core/src/lib/feedback/Dialog/Dialog.svelte; packages/ui/core/src/lib/navigation/BottomNav/BottomNav.svelte; packages/ui/core/src/lib/style-contract.test.ts)

#### Scenario: Drawer footer above BottomNav on a phone

- **GIVEN** an open drawer with a footer and a `BottomNav` rendered after it, on a phone-sized layout
- **WHEN** the point at the centre of a footer button is hit-tested
- **THEN** the topmost element there SHALL be inside the drawer footer

### Requirement: CurrencyDisplay custom asset amounts

`CurrencyDisplay` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets.

#### Scenario: Complete CurrencyDisplay custom asset amounts contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`CurrencyDisplay` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets. It SHALL:

- Enter asset mode only when `decimals` is set. In asset mode, `currency` MAY be any non-empty asset code (e.g. `USDC`, `ETH`, `BTC`). When `decimals` is omitted, all existing ISO 4217 behaviour SHALL be unchanged.
- In asset mode, display exactly `decimals` fraction digits, rounding half-expand. The amount SHALL be formatted from its decimal string and never converted to a JS `number`, so amounts with 18 fraction digits and 18 integer digits display without precision loss.
- Use the locale's grouping separator, decimal separator and digits, and honour `signDisplay`, `tone`, `negativeLabel` and `masked` exactly as for ISO amounts. "Displays as zero" SHALL be judged at the asset's precision.
- By default, append the asset code after the number with a no-break space, in every locale. When `symbol` is set and `currencyDisplay` is `symbol` or `narrowSymbol` (the default), the symbol SHALL take the locale's currency-symbol position instead. `currencyDisplay` `code` or `name` SHALL always use the code suffix.
- Treat `decimals` that is not an integer from 0 to 100, or an empty asset code, as invalid input: render an em dash and log a single `console.warn`, without throwing.

(src: packages/ui/core/src/lib/data/CurrencyDisplay/CurrencyDisplay.svelte; packages/ui/core/src/lib/data/CurrencyDisplay/currencyDisplay.ts)

#### Scenario: Assets with their own decimals

- **GIVEN** `amount="1234.5"`, `currency="USDC"`, `decimals={6}`
- **WHEN** it renders with `locale="en-US"` or `locale="pt-BR"`
- **THEN** it SHALL display `1,234.500000 USDC` or `1.234,500000 USDC` respectively
- **AND** `amount="1234.5678"`, `currency="ETH"`, `decimals={18}`, `locale="pt-BR"` SHALL display `1.234,567800000000000000 ETH`
- **AND** `amount="0.00000001"`, `currency="BTC"`, `decimals={8}`, `locale="pt-BR"` SHALL display `0,00000001 BTC`

#### Scenario: No precision loss

- **GIVEN** `amount="123456789012345678.123456789012345678"`, `currency="ETH"`, `decimals={18}`, `locale="en-US"`
- **WHEN** it renders
- **THEN** it SHALL display `123,456,789,012,345,678.123456789012345678 ETH`

#### Scenario: Asset signs and zero

- **GIVEN** `currency="ETH"`, `decimals={4}`, `locale="pt-BR"`, `tone="signed"`
- **WHEN** `amount="-0.5"`
- **THEN** it SHALL display `-0,5000 ETH` with the error colour
- **WHEN** `amount="-0.0000004"` with `currency="USDC"`, `decimals={6}`, `signDisplay="never"`
- **THEN** it SHALL display `0.000000 USDC` (en-US) with no minus sign, no `negativeLabel` and no tone colour

#### Scenario: Masked asset

- **GIVEN** `amount="-1234.5678"`, `currency="ETH"`, `decimals={4}`, `locale="pt-BR"`, `masked`
- **WHEN** it renders
- **THEN** only `maskedLabel` SHALL be exposed to assistive technology
- **AND** the DOM SHALL contain no digit of the real amount
- **AND** the hidden sizer SHALL be `-0.000,0000 ETH`

#### Scenario: Asset symbol placement

- **GIVEN** `amount="1.5"`, `currency="BTC"`, `decimals={8}`, `symbol="₿"`
- **WHEN** it renders with `locale="en-US"`
- **THEN** it SHALL display `₿1.50000000`
- **AND** with `locale="de-DE"` and `amount="-1.5"` it SHALL display `-1,50000000 ₿`
- **AND** with `currencyDisplay="code"` it SHALL display `1.50000000 BTC`

#### Scenario: ISO behaviour unchanged

- **GIVEN** no `decimals`
- **WHEN** `currency="USDC"`
- **THEN** it SHALL render the em dash and warn once, as before
- **AND** `amount="1234.5"`, `currency="USD"`, `locale="en-US"` SHALL still display `$1,234.50`

#### Scenario: Invalid decimals

- **GIVEN** `decimals` of `-1`, `1.5`, `101` or `NaN`
- **WHEN** it renders
- **THEN** it SHALL display an em dash and call `console.warn` once

### Requirement: MoneyInput custom asset amounts

`MoneyInput` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets, with the same meaning as on `CurrencyDisplay`.

#### Scenario: Complete MoneyInput custom asset amounts contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`MoneyInput` SHALL accept optional `decimals` and `symbol` props for crypto and other non-ISO assets, with the same meaning as on `CurrencyDisplay`. It SHALL:

- Enter asset mode only when `decimals` is set. In asset mode, `currency` MAY be any non-empty asset code (e.g. `USDC`, `ETH`, `BTC`). When `decimals` is omitted, all existing ISO 4217 behaviour SHALL be unchanged.
- In asset mode, use `decimals` as the fraction-digit count for parsing, clamping and the emitted canonical value. The emitted `value` and the hidden input SHALL be decimal strings with exactly `decimals` fraction digits, computed without converting to a JS `number`.
- Apply the existing separator rule with `decimals` as the limit: the last `.` or `,` is the decimal separator when at most `decimals` digits follow it, and every other separator is grouping.
- In asset mode, reject typed or pasted text whose last separator is followed by more than `decimals` digits (except a three-digit thousands group): the field SHALL keep its previous text and `value` SHALL NOT change.
- While unfocused, display the value formatted like `CurrencyDisplay` in asset mode: the code appended after a no-break space, or `symbol` in the locale's currency-symbol position when set. While focused, show the plain number with the locale's decimal mark and the code as affix.
- Treat `decimals` that is not an integer from 0 to 100, or an empty asset code, as invalid: render the input disabled with `aria-invalid="true"`, keep `value` and the hidden input unchanged, display the raw value, ignore input, and log a single `console.warn`, without throwing.

(src: packages/ui/core/src/lib/forms/MoneyInput/MoneyInput.svelte; packages/ui/core/src/lib/forms/MoneyInput/asset.ts; packages/ui/core/src/lib/forms/MoneyInput/money.ts)

#### Scenario: Typed asset amounts

- **GIVEN** `currency="USDC"`, `decimals={6}`
- **WHEN** the user types `1,234.567891` with `locale="en-US"` or `1.234,567891` with `locale="pt-BR"`
- **THEN** the system SHALL emit `"1234.567891"`
- **AND** with `currency="BTC"`, `decimals={8}`, typing `21.000,5` in pt-BR SHALL emit `"21000.50000000"`

#### Scenario: Last separator with asset decimals

- **GIVEN** `currency="BTC"`, `decimals={8}`
- **WHEN** the user types `1.234` or `1,234`
- **THEN** the system SHALL emit `"1.23400000"`

#### Scenario: 18-decimal paste without precision loss

- **GIVEN** `currency="ETH"`, `decimals={18}`, `locale="pt-BR"`, `name="amount"`
- **WHEN** the user pastes `123.456.789.012.345.678,123456789012345678` and the field blurs
- **THEN** the system SHALL emit `"123456789012345678.123456789012345678"`
- **AND** the hidden input SHALL carry that same string
- **AND** the field SHALL display `123.456.789.012.345.678,123456789012345678 ETH`

#### Scenario: Excess decimals rejected

- **GIVEN** `currency="USDC"`, `decimals={6}` and the field text `1.123456`
- **WHEN** the user types a seventh fraction digit (`1.1234567`)
- **THEN** the field SHALL keep `1.123456` and no change SHALL be emitted

#### Scenario: Negative asset amounts

- **GIVEN** `currency="ETH"`, `decimals={18}`, `locale="pt-BR"`, `allowNegative`
- **WHEN** the user types `-0,5`
- **THEN** the system SHALL emit `"-0.500000000000000000"`
- **AND** without `allowNegative` the minus sign SHALL be dropped

#### Scenario: Asset display

- **GIVEN** `value="1234.5"`, `currency="USDC"`, `decimals={6}`
- **WHEN** the field is unfocused with `locale="pt-BR"`
- **THEN** it SHALL display `1.234,500000 USDC`
- **AND** `value="1.5"`, `currency="BTC"`, `decimals={8}`, `symbol="₿"`, `locale="en-US"` SHALL display `₿1.50000000`

#### Scenario: Invalid decimals

- **GIVEN** `decimals` of `-1`, `1.5`, `101` or `NaN`, and `value="1.5"`
- **WHEN** it renders
- **THEN** the input SHALL be disabled with `aria-invalid="true"` and display `1.5`
- **AND** the hidden input SHALL keep `1.5`
- **AND** `console.warn` SHALL be called once

#### Scenario: ISO behaviour unchanged

- **GIVEN** no `decimals` and `currency="USD"`, `locale="en-US"`
- **WHEN** the user types `1.2345`
- **THEN** the system SHALL still treat the separator as grouping and emit `"12345.00"`
- **AND** `value="1234.5"` SHALL still display `$1,234.50`
