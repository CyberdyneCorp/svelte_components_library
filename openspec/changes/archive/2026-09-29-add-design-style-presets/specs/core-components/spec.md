## ADDED Requirements

### Requirement: Components expose design-style tokens

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
