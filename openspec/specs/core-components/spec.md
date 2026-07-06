# Core Components

## Purpose

The `@cyberdynecorp/svelte-ui-core` package provides the general-purpose UI component families (primitives, forms, feedback, navigation, data display, layout, overlay, auth, chat, crypto, ml, graph, maps, editor). All components are authored in Svelte 5 runes mode, follow a uniform folder/authoring convention, consume design tokens for all styling, and apply consistent accessibility patterns. This spec captures the shared conventions plus representative component contracts.

## Requirements

### Requirement: Svelte 5 runes authoring convention

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

The system SHALL implement `Modal` as a dialog with `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at its title, focus trap on Tab/Shift+Tab, Escape-to-close, backdrop-click-to-close, and auto-focus of the close button on open. `Tabs` SHALL implement `role="tablist"`/`role="tab"` with `aria-selected`, roving tabindex, and ArrowLeft/ArrowRight navigation with wraparound. (src: packages/ui/core/src/lib/overlay/Modal/Modal.svelte:27-57,62-66; packages/ui/core/src/lib/navigation/Tabs/Tabs.svelte:19-33,36-43)

#### Scenario: Modal focus trap and escape

- **GIVEN** an open `Modal`
- **WHEN** the user presses Escape or Tab past the last focusable element
- **THEN** the system SHALL close on Escape and cycle focus within the dialog on Tab

### Requirement: Components consume design tokens only

The system SHALL style every component using CSS custom properties (component-layer tokens such as `--btn-brand-bg`, `--input-bg`, semantic state tokens `--color-state-*`, plus `--space-*`, `--radius-*`, `--font-*`) rather than literal color values, so theme switches occur entirely at the token layer. (src: packages/ui/core/src/lib/primitives/Button/Button.svelte:79-209; packages/ui/core/src/lib/forms/TextInput/TextInput.svelte:108-148; packages/ui/core/src/lib/feedback/Alert/Alert.svelte:97-124)

#### Scenario: Button style references tokens

- **WHEN** the `Button` `<style>` block is inspected
- **THEN** the system SHALL reference `--btn-*`, `--space-*`, `--radius-*`, and `--font-*` tokens and SHALL NOT hardcode brand hex values

### Requirement: Authentication components

The system SHALL provide a `LoginPage` with a `mode` prop `"credentials" | "wallet" | "both"` (default `"both"`) that conditionally renders a credentials form and/or an injected `walletSection` snippet, exposing bindable `email`/`password` and `onsubmit`/`onsignup`/`onforgotpassword` callbacks. The system SHALL provide a `WalletConnect` whose wallet options carry an `icon` restricted to `"metamask" | "walletconnect" | "coinbase" | "phantom" | "custom"`, defaulting to a built-in set of MetaMask, WalletConnect, Coinbase, and Phantom when none are supplied, and disabling other options while one connection is in progress. (src: packages/ui/core/src/lib/auth/LoginPage/LoginPage.svelte:6,9,19,35-37,158-160; packages/ui/core/src/lib/auth/WalletConnect/WalletConnect.svelte:4-9,23-28,30,32-36,60)

#### Scenario: Wallet connection in progress

- **GIVEN** a `WalletConnect` with a connection started for one wallet
- **WHEN** the user views the other options
- **THEN** the system SHALL disable the other wallet buttons and show a spinner on the active one
