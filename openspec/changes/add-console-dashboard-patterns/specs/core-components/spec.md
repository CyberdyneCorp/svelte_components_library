## ADDED Requirements

### Requirement: Sidebar groups, badges, external links and rail flyout

`Sidebar` SHALL accept grouped sections, per-item badges and external links, report navigation through a callback, and show a flyout for nested items while collapsed.

#### Scenario: Complete Sidebar groups, badges, external links and rail flyout contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`SidebarItem` SHALL gain optional `badge` (text rendered with `Badge`), `external` (renders `target="_blank"`, `rel="noopener noreferrer"` and an external-link icon with visually hidden `externalLabel`, default `"opens in a new tab"`) and `disabled`. `Sidebar` SHALL accept an optional `groups: Array<{ id: string; label: string; items: SidebarItem[]; collapsible?: boolean; defaultOpen?: boolean }>` rendered as labelled sections with a heading row (a toggle button when `collapsible`), used instead of `items` when present. It SHALL accept `onnavigate(href, item)` called when a link item is activated. While `collapsed`, an item with children SHALL show its children in a flyout list on hover and on focus-within, and the flyout SHALL close on blur and on Escape. Existing `items`, `activeId` and `collapsed` behaviour SHALL be unchanged.

(src: packages/ui/core/src/lib/navigation/Sidebar/Sidebar.svelte)

#### Scenario: Grouped sections

- **GIVEN** groups "Aplicativos" (collapsible, open) with two items and "Marketing" (collapsible, closed) with one item
- **WHEN** it renders
- **THEN** the two "Aplicativos" links SHALL be visible and the "Marketing" link SHALL NOT be rendered until its heading button is activated

#### Scenario: Badge and external item

- **GIVEN** an item `label="GPU"`, `badge="Beta"` and an item `label="API"`, `href="https://example.test"`, `external: true`
- **WHEN** it renders
- **THEN** "Beta" SHALL be rendered next to "GPU"
- **AND** the "API" link SHALL have `target="_blank"`, `rel` containing `noopener` and accessible name "API opens in a new tab"

#### Scenario: Collapsed flyout

- **GIVEN** `collapsed` and an item "Configurações" with children "Principais" and "Endereço IP"
- **WHEN** the item receives focus
- **THEN** a list containing "Principais" and "Endereço IP" SHALL be visible
- **WHEN** Escape is pressed
- **THEN** the list SHALL be hidden

### Requirement: Breadcrumb item icons

`Breadcrumb` items SHALL accept an optional icon.

#### Scenario: Complete Breadcrumb item icons contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

Each breadcrumb item SHALL accept `icon` (an `Icon` name) rendered `aria-hidden` before the label, and `iconOnly` which hides the label visually while keeping it as the link's accessible name. Items without `icon` SHALL render exactly as before.

(src: packages/ui/core/src/lib/navigation/Breadcrumb/Breadcrumb.svelte)

#### Scenario: Home crumb

- **GIVEN** items `{ label: "Início", href: "/", icon: "home", iconOnly: true }`, `{ label: "VPS", href: "/vps" }`, `{ label: "Docker" }`
- **WHEN** it renders
- **THEN** a link named "Início" SHALL exist with no visible label text and an icon
- **AND** "Docker" SHALL carry `aria-current="page"`

### Requirement: KpiCard visual slot

`KpiCard` SHALL accept an optional `visual` snippet rendered beside the value.

#### Scenario: Complete KpiCard visual slot contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`KpiCard` SHALL accept `visual?: Snippet` rendered in a second column aligned to the end of the card, next to label and value, for a ring or icon. `sparkline` SHALL keep rendering below the value. Without `visual`, the card layout SHALL be unchanged.

(src: packages/ui/core/src/lib/data/KpiCard/KpiCard.svelte)

#### Scenario: Disk usage ring

- **GIVEN** `label="Uso do disco"`, `value="152 GB / 400 GB"` and a `visual` snippet rendering `ProgressRing` with `value={38}`
- **WHEN** it renders
- **THEN** the ring SHALL be inside the card beside the value
- **AND** a card without `visual` SHALL render no visual container

### Requirement: PasswordInput generate action and native attributes

`PasswordInput` SHALL accept an application-supplied generate action, translatable toggle labels and native form attributes.

#### Scenario: Complete PasswordInput generate action and native attributes contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`PasswordInput` SHALL accept `ongenerate?: () => string`; when set, a button labelled `generateLabel` (default `"Generate"`) SHALL appear next to the visibility toggle and clicking it SHALL set `value` to the callback's return value. It SHALL accept `showLabel` (default `"Show password"`) and `hideLabel` (default `"Hide password"`) for the toggle's accessible name, and native `name`, `autocomplete` and `id`. The component SHALL NOT generate passwords itself.

(src: packages/ui/core/src/lib/forms/PasswordInput/PasswordInput.svelte)

#### Scenario: Generate root password

- **GIVEN** `ongenerate={() => "s3cret-example"}`, `generateLabel="Gerar"`, `showLabel="Mostrar senha"`, `autocomplete="new-password"`
- **WHEN** the user clicks "Gerar"
- **THEN** the input value SHALL be `s3cret-example`
- **AND** the toggle SHALL be named "Mostrar senha" and the input SHALL have `autocomplete="new-password"`
- **AND** without `ongenerate` no generate button SHALL be rendered

### Requirement: IconButton count badge

`IconButton` SHALL accept an optional count badge.

#### Scenario: Complete IconButton count badge contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`IconButton` SHALL accept `badge?: string | number` rendered as a small bubble over the icon, and `badgeLabel?: string` appended as visually hidden text to the button's accessible name. Without `badge` the button SHALL render exactly as before.

(src: packages/ui/core/src/lib/primitives/IconButton/IconButton.svelte)

#### Scenario: Notification bell

- **GIVEN** `icon="bell"`, `label="Notificações"`, `badge={1}`, `badgeLabel="1 não lida"`
- **WHEN** it renders
- **THEN** the bubble SHALL show "1" and the button's accessible name SHALL contain "Notificações" and "1 não lida"
- **AND** without `badge` no bubble SHALL be rendered
