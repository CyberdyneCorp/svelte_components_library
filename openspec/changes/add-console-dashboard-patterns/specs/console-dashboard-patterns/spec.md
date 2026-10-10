## ADDED Requirements

### Requirement: SettingsRow contract

The system SHALL provide a `SettingsRow` data component for a list of configurable items, each with an optional icon, a title, a description, an optional badge and application-supplied actions.

#### Scenario: Complete SettingsRow contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`SettingsRow` SHALL take a required `title`, optional `description` (string) and `children` (snippet rendered as the description when rich text is needed), optional `icon` snippet rendered inside a round, `aria-hidden` container, optional `badge` text with `badgeVariant` (Badge variants), optional `actions` snippet aligned to the end, `as` (`"div"` | `"li"`, default `"div"`) and forwarded `data-*` attributes on the root. It SHALL lay out icon, text and actions on one line at desktop widths and wrap actions below the text at narrow widths. It SHALL use foundation tokens only and have no hover lift.

(src: packages/ui/core/src/lib/data/SettingsRow/SettingsRow.svelte)

#### Scenario: Row with actions and badge

- **GIVEN** `title="Resolvedores DNS"`, `description="Use os padrões ou adicione o seu."`, `badge="Personalizado"` and two Buttons in `actions`
- **WHEN** it renders
- **THEN** the title, description and badge text SHALL be visible and both buttons SHALL be reachable by keyboard
- **AND** with `as="li"` inside a `<ul>` the root SHALL be a `listitem`
- **AND** `data-setting="dns"` SHALL be present on the root

#### Scenario: Minimal row

- **GIVEN** only `title`
- **WHEN** it renders
- **THEN** no icon container, description, badge or actions container SHALL be rendered

### Requirement: DescriptionList contract

The system SHALL provide a `DescriptionList` data component that renders label/value rows as a `<dl>`.

#### Scenario: Complete DescriptionList contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`DescriptionList` SHALL take `items: Array<{ id: string; label: string; value?: string; hint?: string }>`, optional `value` snippet `(item) => markup` that replaces the string value, optional `action` snippet `(item) => markup` rendered after the value (e.g. an edit IconButton or a link), `columns` (`1` | `2`, default `1`) and `dividers` (default `true`). Each item SHALL render a `<dt>` for the label and a `<dd>` containing the value, the optional hint and the optional action. Rows SHALL wrap value and action below the label at narrow widths.

(src: packages/ui/core/src/lib/data/DescriptionList/DescriptionList.svelte)

#### Scenario: Detail panel with edit actions

- **GIVEN** items for "Localização do servidor" = "Brazil - São Paulo", "SO" = "Ubuntu 25.04" and "Nome do host" = "srv-example.cloud", and an `action` snippet rendering an IconButton labelled "Editar {label}"
- **WHEN** it renders
- **THEN** the DOM SHALL contain one `dl` with three `dt`/`dd` pairs
- **AND** three buttons named "Editar Localização do servidor", "Editar SO" and "Editar Nome do host" SHALL exist

#### Scenario: Snippet value and hint

- **GIVEN** an item with `hint="Renovação automática ativa"` and a `value` snippet rendering a StatusBadge
- **WHEN** it renders
- **THEN** the `dd` SHALL contain the StatusBadge and the hint text

### Requirement: KeyValueStrip contract

The system SHALL provide a `KeyValueStrip` data component for an inline strip of facts with optional copy and link actions.

#### Scenario: Complete KeyValueStrip contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`KeyValueStrip` SHALL take `items: Array<{ id: string; label: string; value: string; copy?: boolean; href?: string; linkLabel?: string }>`, `ariaLabel` for the list and `copyLabel` (default `"Copy"`, used as "{copyLabel} {label}" on each CopyButton). It SHALL render a `<ul>` whose items show "{label}: {value}" with a divider between items, a `CopyButton` for the value when `copy` is true, and an `<a href>` with `linkLabel` (falling back to `value`) when `href` is set. Items SHALL wrap onto new lines at narrow widths.

(src: packages/ui/core/src/lib/data/KeyValueStrip/KeyValueStrip.svelte)

#### Scenario: SSH facts strip

- **GIVEN** items "Nome de usuário SSH" = "root" (copy), "IPv4" = "203.0.113.10" (copy) and "Esqueceu a senha root?" with `href="/reset"` and `linkLabel="Redefinir senha"`
- **WHEN** it renders with `copyLabel="Copiar"`
- **THEN** buttons named "Copiar Nome de usuário SSH" and "Copiar IPv4" SHALL exist
- **AND** a link named "Redefinir senha" SHALL point to `/reset`
- **AND** the list SHALL contain exactly three `listitem`s

### Requirement: SplitButton contract

The system SHALL provide a `SplitButton` primitive: a primary action joined to a caret that opens a menu of secondary actions.

#### Scenario: Complete SplitButton contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`SplitButton` SHALL take `label`, `onclick`, `items` (the Dropdown item shape), `onselect(value)`, `variant` and `size` (Button's), `disabled`, `loading`, `menuLabel` (default `"More actions"`) and `align` (`"left"` | `"right"`). It SHALL render the primary action with the existing `Button` and a joined caret `<button type="button" aria-haspopup="menu" aria-label={menuLabel}>` whose `aria-expanded` and `aria-controls` reflect the open menu; the caret SHALL open a `role="menu"` list of `role="menuitem"` buttons that follows the menu-button keyboard pattern (ArrowDown/ArrowUp open and move focus, Escape closes and returns focus to the caret, click outside closes). The items reuse the `Dropdown` item shape. Selecting an item SHALL call `onselect` with its value and close the menu. Both buttons SHALL be disabled together.

(src: packages/ui/core/src/lib/primitives/SplitButton/SplitButton.svelte)

#### Scenario: Restart with secondary actions

- **GIVEN** `label="Reiniciar"`, items "Desligar" and "Iniciar", `menuLabel="Mais ações"`
- **WHEN** the user clicks "Reiniciar"
- **THEN** `onclick` SHALL be called once and no menu SHALL open
- **WHEN** the user clicks the button named "Mais ações" and then "Desligar"
- **THEN** `onselect` SHALL be called with the "Desligar" value and `aria-expanded` SHALL return to `false`
- **AND** with `disabled` both buttons SHALL be disabled

### Requirement: PromoBanner contract

The system SHALL provide a `PromoBanner` feedback component for a dismissible upsell or announcement with an optional price and call to action.

#### Scenario: Complete PromoBanner contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`PromoBanner` SHALL take a required `title`, optional `description`, optional `icon` snippet (rendered `aria-hidden`), optional `price` snippet (e.g. a `PriceTag`), optional `actions` snippet, `dismissible` (default `false`), `dismissLabel` (default `"Dismiss"`) and `ondismiss`. It SHALL render `role="region"` labelled by the title, SHALL NOT use `role="alert"` or `role="status"`, and when `dismissible` SHALL render an `IconButton` named `dismissLabel` that calls `ondismiss` and removes the banner.

(src: packages/ui/core/src/lib/feedback/PromoBanner/PromoBanner.svelte)

#### Scenario: Backup upsell

- **GIVEN** `title="Faça upgrade para backups diários"`, a description, a `price` snippet with a PriceTag, an `actions` snippet with a Button "Fazer Upgrade", `dismissible` and `dismissLabel="Fechar"`
- **WHEN** it renders
- **THEN** a `region` named "Faça upgrade para backups diários" SHALL contain the price, the "Fazer Upgrade" button and a button named "Fechar"
- **WHEN** the user clicks "Fechar"
- **THEN** `ondismiss` SHALL be called once and the region SHALL be removed from the DOM

### Requirement: PriceTag contract

The system SHALL provide a `PriceTag` data component for a current price with an optional struck original price, period and savings badge.

#### Scenario: Complete PriceTag contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`PriceTag` SHALL take `amount` (decimal string), `currency`, `locale`, optional `originalAmount`, optional `period` (e.g. "/mês"), optional `savings` text rendered as a `Badge`, `originalLabel` (default `"Original price"`, visually hidden before the struck price) and `size` (`"sm"` | `"md"` | `"lg"`). Both prices SHALL render through `CurrencyDisplay` from their decimal strings; the original price SHALL be wrapped in `<s>`.

(src: packages/ui/core/src/lib/data/PriceTag/PriceTag.svelte)

#### Scenario: Discounted domain price

- **GIVEN** `amount="10.99"`, `originalAmount="103.99"`, `currency="BRL"`, `locale="pt-BR"`, `period="/1º ano"`, `savings="Economize 89%"`, `originalLabel="Preço original"`
- **WHEN** it renders
- **THEN** it SHALL display `R$ 10,99` and `/1º ano`
- **AND** an `s` element SHALL contain `R$ 103,99` preceded by visually hidden "Preço original"
- **AND** the text "Economize 89%" SHALL be rendered
- **AND** without `originalAmount` no `s` element SHALL exist

### Requirement: Console dashboard example

The library SHALL ship a Storybook composition of control-panel screens built only from library components and synthetic data.

#### Scenario: Example screens

- **GIVEN** `ConsoleDashboard.stories.svelte` under `Console/Dashboard`
- **WHEN** the stories render
- **THEN** an "Overview" story SHALL use NavBar, PageShell, a collapsed Sidebar rail beside an expanded grouped Sidebar, Breadcrumb, PageHeader with SplitButton, StatusBadge, KeyValueStrip, Alert, KpiCard with Sparkline and with a ProgressRing `visual`, PromoBanner with PriceTag and DescriptionList
- **AND** an "Empty" story SHALL use EmptyState with a Button; a "Settings" story SHALL use PasswordInput with a generate action and SettingsRow items; a "Domains" story SHALL use SearchInput, Select, DataTable with selection, Switch cells and a Dropdown kebab
- **AND** every story SHALL pass the axe accessibility check with `a11y: { test: "error" }`
