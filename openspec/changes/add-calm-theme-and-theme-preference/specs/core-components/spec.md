## ADDED Requirements

### Requirement: ThemeToggle theme preference

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
