## ADDED Requirements

### Requirement: Drawer accessibility contract

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

The system SHALL set the `z-index` of the `Drawer`, `Modal` and `Dialog` overlays to `var(--z-overlay)` and of `BottomNav` to `var(--z-nav)`, so an open overlay, including the drawer footer, is never covered by `BottomNav`. (src: packages/ui/core/src/lib/layout/Drawer/Drawer.svelte; packages/ui/core/src/lib/overlay/Modal/Modal.svelte; packages/ui/core/src/lib/feedback/Dialog/Dialog.svelte; packages/ui/core/src/lib/navigation/BottomNav/BottomNav.svelte; packages/ui/core/src/lib/style-contract.test.ts)

#### Scenario: Drawer footer above BottomNav on a phone

- **GIVEN** an open drawer with a footer and a `BottomNav` rendered after it, on a phone-sized layout
- **WHEN** the point at the centre of a footer button is hit-tested
- **THEN** the topmost element there SHALL be inside the drawer footer
