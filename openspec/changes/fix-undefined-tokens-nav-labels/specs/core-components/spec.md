## ADDED Requirements

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
