## ADDED Requirements

### Requirement: Dialog confirm can be disabled

`Dialog` SHALL accept `confirmDisabled` (default `false`) that disables its confirm button.

#### Scenario: Complete Dialog confirm can be disabled contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`Dialog` SHALL accept `confirmDisabled` (default `false`). While it is `true`, the confirm button SHALL have the native `disabled` attribute and activating it SHALL NOT call `onconfirm` or close the dialog. Initial focus SHALL go to the first focusable element inside the dialog body when there is one, otherwise to the first enabled button. Existing dialogs without the prop SHALL behave as before.

(src: packages/ui/core/src/lib/feedback/Dialog/Dialog.svelte)

#### Scenario: Disabled confirm

- **GIVEN** an open Dialog with `confirmDisabled`
- **WHEN** the user clicks the confirm button
- **THEN** `onconfirm` SHALL NOT be called and the dialog SHALL remain open

### Requirement: CopyButton icon-only mode

`CopyButton` SHALL accept `iconOnly` (default `false`) that hides the visible text while keeping the accessible name.

#### Scenario: Complete CopyButton icon-only mode contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

With `iconOnly`, `CopyButton` SHALL render only its icon, and SHALL keep `aria-label` set to `label` (or "Copied" after a copy) and `title` set to the same text. It SHALL also accept an optional `copiedLabel` that replaces the post-copy text (visible text, `title` and `aria-label`), so it can be translated. Without it, the post-copy text SHALL stay "Copied!" (visible and `title`) and "Copied" (`aria-label`). Without `iconOnly` and `copiedLabel`, rendering SHALL be unchanged.

(src: packages/ui/core/src/lib/primitives/CopyButton/CopyButton.svelte)

#### Scenario: Icon-only copy

- **GIVEN** `<CopyButton text="abc" label="Copy request ID" iconOnly />`
- **WHEN** it renders
- **THEN** a button named "Copy request ID" SHALL exist and no visible "Copy request ID" text SHALL be rendered
