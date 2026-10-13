## ADDED Requirements

### Requirement: Timestamp contract

The system SHALL provide a `Timestamp` data component that renders a point in time as relative or absolute text inside a `<time>` element.

#### Scenario: Complete Timestamp contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`Timestamp` SHALL take `value` (`Date | string | number`), `format` (`"relative"` | `"absolute"` | `"both"`, default `"relative"`), optional `locale`, optional `timeZone`, `dateStyle` (default `"medium"`), `timeStyle` (default `"short"`), `live` (default `true`), optional `now` (`Date`) and `invalidLabel` (default `"Invalid date"`). It SHALL render `<time datetime="<ISO 8601>">`. The relative text SHALL come from `Intl.RelativeTimeFormat` with `numeric: "auto"`, using the largest whole unit among seconds, minutes, hours, days, weeks, months and years. The absolute text SHALL come from `Intl.DateTimeFormat` with the given styles, locale and time zone, and SHALL be the element's `title` in relative mode. `"both"` SHALL render the absolute text followed by the relative text in parentheses. With `live` and relative text, the component SHALL re-render every 10 seconds while the distance is under a minute, every minute under an hour, and every hour beyond, and SHALL clear its timer on unmount. The pure helper `relativeParts(date, now)` SHALL be exported.

(src: packages/ui/core/src/lib/data/Timestamp/Timestamp.svelte)

#### Scenario: Relative past time

- **GIVEN** `value` is 3 minutes before `now`, the locale is `"en"` and `format="relative"`
- **WHEN** it renders
- **THEN** the text SHALL be "3 minutes ago"
- **AND** the `time` element SHALL have a `datetime` equal to the value's ISO string and a non-empty `title`

#### Scenario: Future and calendar words

- **GIVEN** `value` is 1 day before `now` and the locale is `"en"`
- **WHEN** it renders
- **THEN** the text SHALL be "yesterday"
- **AND** with `value` 2 hours after `now` the text SHALL be "in 2 hours"

#### Scenario: Live update

- **GIVEN** a live relative Timestamp 50 seconds in the past
- **WHEN** 20 seconds pass
- **THEN** the text SHALL change from seconds to "1 minute ago"

#### Scenario: Invalid value

- **GIVEN** `value="not a date"`
- **WHEN** it renders
- **THEN** it SHALL show "Invalid date" and SHALL NOT set `datetime`

### Requirement: HoverCard contract

The system SHALL provide a `HoverCard` overlay component that shows supplementary content next to a trigger on hover or keyboard focus.

#### Scenario: Complete HoverCard contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`HoverCard` SHALL take a `trigger` snippet, a `children` snippet for the card content, `open` (bindable, default `false`), `openDelay` (ms, default `500`), `closeDelay` (ms, default `200`) and `position` (`"top"` | `"bottom"` | `"left"` | `"right"`, default `"bottom"`). It SHALL open after `openDelay` when the pointer enters the trigger or focus moves into it. It SHALL stay open while the pointer is over the trigger or the card, or focus is within either. It SHALL close `closeDelay` after both pointer and focus have left, and immediately on Escape. The card SHALL be rendered directly after the trigger in DOM order so that Tab reaches focusable content inside it, and SHALL use foundation surface tokens. Re-entering before a delay elapses SHALL cancel the pending change.

(src: packages/ui/core/src/lib/overlay/HoverCard/HoverCard.svelte)

#### Scenario: Hover open after delay

- **GIVEN** a HoverCard with `openDelay=500` around a link "@ada"
- **WHEN** the pointer enters the link and 499 ms pass
- **THEN** the card SHALL NOT be rendered
- **AND** after 500 ms the card content SHALL be visible

#### Scenario: Keyboard reach and Escape

- **GIVEN** an open card containing a link "View profile"
- **WHEN** the user presses Tab from the trigger
- **THEN** focus SHALL move to "View profile" and the card SHALL stay open
- **AND** pressing Escape SHALL close the card

#### Scenario: Pointer moves into the card

- **GIVEN** an open card
- **WHEN** the pointer leaves the trigger and enters the card within `closeDelay`
- **THEN** the card SHALL remain open

### Requirement: ConfirmAction contract

The system SHALL provide a `ConfirmAction` feedback component: a trigger button whose action is gated by a configurable level of confirmation.

#### Scenario: Complete ConfirmAction contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`ConfirmAction` SHALL take a required `label` (trigger text), `level` (`"click"` | `"confirm"` | `"type"`, default `"confirm"`), `variant` (Button variants, default `"danger"`), `size`, `disabled`, `title` (dialog title, default the label), a `children` snippet for the dialog body, `confirmLabel` (default the label), `cancelLabel` (default `"Cancel"`), `confirmText` (required when `level="type"`), `typePrompt` (default `` `Type "${confirmText}" to confirm` ``), and `onconfirm` and `oncancel` callbacks. With `"click"`, activating the trigger SHALL call `onconfirm` directly. With `"confirm"`, it SHALL open a `Dialog` (danger variant when `variant="danger"`), and the dialog's confirm SHALL call `onconfirm`. With `"type"`, the dialog SHALL also contain a labelled text input, and the confirm button SHALL be disabled until the trimmed input equals `confirmText` exactly, case-sensitive. The input SHALL be cleared each time the dialog opens. Cancel or Escape SHALL call `oncancel` and SHALL NOT call `onconfirm`.

(src: packages/ui/core/src/lib/feedback/ConfirmAction/ConfirmAction.svelte)

#### Scenario: Type-to-confirm

- **GIVEN** `level="type"`, `label="Delete project"` and `confirmText="acme-prod"`
- **WHEN** the user opens the dialog and types "acme-pro"
- **THEN** the confirm button SHALL be disabled
- **AND** after typing the final "d" it SHALL be enabled, and activating it SHALL call `onconfirm` once

#### Scenario: Plain click

- **GIVEN** `level="click"`
- **WHEN** the trigger is activated
- **THEN** `onconfirm` SHALL be called and no dialog SHALL open

#### Scenario: Cancel

- **GIVEN** `level="confirm"` with an open dialog
- **WHEN** the user presses Escape
- **THEN** `oncancel` SHALL be called and `onconfirm` SHALL NOT be called

### Requirement: CopyableValue contract

The system SHALL provide a `CopyableValue` data component that shows an identifier, optionally truncated, with an icon-only copy button.

#### Scenario: Complete CopyableValue contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`CopyableValue` SHALL take a required `value`, optional `display` (shown instead of `value`), `truncate` (`"none"` | `"middle"` | `"end"`, default `"middle"`), `head` (default `6`), `tail` (default `4`), `mono` (default `true`), `label` (what the value is, e.g. "Request ID") and `copyLabel` (default `` label ? `Copy ${label}` : "Copy" ``). Middle truncation SHALL keep the first `head` and last `tail` characters joined by "…", and only apply when the text is longer than `head + tail + 1`. End truncation SHALL be visual (CSS ellipsis). The visible truncated text SHALL be `aria-hidden`. A visually hidden element SHALL contain the full text, and the full text SHALL be the visible element's `title`. The copy button SHALL be `CopyButton` with `iconOnly`, size `"sm"`, and SHALL copy `value`, not `display`. The pure helper `truncateMiddle(text, head, tail)` SHALL be exported.

(src: packages/ui/core/src/lib/data/CopyableValue/CopyableValue.svelte)

#### Scenario: Middle truncation

- **GIVEN** `value="0x1234567890abcdef"` with defaults
- **WHEN** it renders
- **THEN** the visible text SHALL be "0x1234…cdef"
- **AND** the accessible text SHALL contain "0x1234567890abcdef"
- **AND** a button named "Copy" SHALL exist

#### Scenario: Short value is not truncated

- **GIVEN** `value="abc"`
- **WHEN** it renders
- **THEN** the visible text SHALL be "abc"

### Requirement: MaskedValue contract

The system SHALL provide a `MaskedValue` data component that displays a secret as a fixed-length mask plus its last characters, with optional reveal and copy.

#### Scenario: Complete MaskedValue contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`MaskedValue` SHALL take a required `value`, `visibleEnd` (default `4`), `maskLength` (default `8`), `maskChar` (default `"•"`), `label` (e.g. "API key"), `revealable` (default `false`), `revealed` (bindable, default `false`), `copyable` (default `false`), optional `autoHideAfter` (ms), `showLabel` (default `"Show"`), `hideLabel` (default `"Hide"`) and `hiddenText` (default `(end) => end ? `ending in ${end}` : "hidden"`). While hidden, it SHALL render `maskLength` mask characters followed by the last `visibleEnd` characters. The mask SHALL be `aria-hidden`, a visually hidden element SHALL contain `hiddenText(end)`, and the full value SHALL NOT appear anywhere in the DOM (text, attributes or titles). When `revealable`, a toggle button with `aria-pressed` and name `` `${showLabel} ${label}` `` or `` `${hideLabel} ${label}` `` SHALL switch to the full value. When `autoHideAfter` is set, it SHALL re-mask that many ms after a reveal. When `copyable`, a `CopyButton` (`iconOnly`) SHALL copy the full value whether or not it is revealed. When `visibleEnd` is at least half the value's length, no trailing characters SHALL be shown.

(src: packages/ui/core/src/lib/data/MaskedValue/MaskedValue.svelte)

#### Scenario: Hidden secret stays out of the DOM

- **GIVEN** `value="demo_secret_51HxQ9a7"` and `label="API key"`
- **WHEN** it renders hidden
- **THEN** the visible text SHALL be "••••••••Q9a7"
- **AND** the accessible text SHALL contain "ending in Q9a7"
- **AND** the document's HTML SHALL NOT contain "demo_secret_51HxQ9a7"

#### Scenario: Reveal and auto-hide

- **GIVEN** `revealable` and `autoHideAfter=5000`
- **WHEN** the user activates "Show API key"
- **THEN** the full value SHALL be visible and the button SHALL have `aria-pressed="true"`
- **AND** after 5000 ms the value SHALL be masked again

### Requirement: OptionCard contract

The system SHALL provide an `OptionCard` form component: a selectable card wrapping a native radio or checkbox input.

#### Scenario: Complete OptionCard contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`OptionCard` SHALL take a required `title`, optional `description`, `type` (`"radio"` | `"checkbox"`, default `"radio"`), `name`, `value`, `group` (bindable, used with radios), `checked` (bindable, used with checkboxes), `disabled`, an optional `onchange(checked: boolean)`, and optional `icon`, `meta` and `children` snippets. It SHALL render a `<label>` containing a visually hidden native `<input>` of the given type, plus the icon (`aria-hidden`), title, description, meta and children. The input SHALL be labelled by the title element and described by the description element. A radio SHALL be checked when `group === value`, and selecting it SHALL set `group` to `value`. The card SHALL show distinct selected, focus-visible (`--color-border-focus`), hover and disabled states using foundation tokens only.

(src: packages/ui/core/src/lib/forms/OptionCard/OptionCard.svelte)

#### Scenario: Radio group selection

- **GIVEN** three radio OptionCards with `name="plan"`, values "free", "pro" and "team", bound to the same `group` set to "free"
- **WHEN** the user clicks the "Pro" card
- **THEN** `group` SHALL be "pro"
- **AND** the "Pro" radio SHALL be checked and named "Pro", and "Free" SHALL be unchecked

#### Scenario: Checkbox card

- **GIVEN** a checkbox OptionCard with `title="Daily backups"` and `description="Kept for 7 days"`
- **WHEN** the user presses Space on its focused input
- **THEN** `checked` SHALL become `true`
- **AND** the checkbox's accessible description SHALL be "Kept for 7 days"

### Requirement: FileTypeIcon contract

The system SHALL provide a `FileTypeIcon` primitive that draws a document shape labelled with a file's extension and coloured by file category.

#### Scenario: Complete FileTypeIcon contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`FileTypeIcon` SHALL take `type` (extension, with or without a dot, any case) or `fileName` (takes precedence), `size` (px, default `24`) and optional `label`. It SHALL render an SVG page with a folded corner, a band coloured by category and the extension in uppercase, shortened to 4 characters, or a generic page with no text when there is no extension. Categories SHALL be `pdf`, `document`, `spreadsheet`, `presentation`, `image`, `audio`, `video`, `archive`, `code` and `other`, each mapped to a foundation colour token. Without `label` the SVG SHALL be `aria-hidden`. With `label` it SHALL be `role="img"` with that name. `fileExtension(fileName)` (last dot segment, lowercase, `""` for dotfiles without another dot and for names without a dot) and `fileCategory(extOrName)` SHALL be exported.

(src: packages/ui/core/src/lib/primitives/FileTypeIcon/FileTypeIcon.svelte)

#### Scenario: Extension from filename

- **GIVEN** `fileName="Q3 report.final.PDF"`
- **WHEN** it renders
- **THEN** the icon SHALL show "PDF" and use the `pdf` category colour
- **AND** `fileCategory("archive.tar.gz")` SHALL be `"archive"` and `fileExtension(".env")` SHALL be `""`

### Requirement: FileCard contract

The system SHALL provide a `FileCard` data component that presents one file as a tile or a row with preview, metadata, upload state and actions.

#### Scenario: Complete FileCard contract

- **WHEN** this capability is implemented or used
- **THEN** it SHALL satisfy the following contract:

`FileCard` SHALL take a required `name`, optional `meta` (e.g. size or date), `layout` (`"tile"` | `"row"`, default `"tile"`), optional `preview` snippet, optional `previewSrc`, optional `progress` (0–100), optional `error` text, `onopen`, `onremove`, `openLabel` (default the name) and `removeLabel` (default `` `Remove ${name}` ``). The preview area SHALL render, in order of preference, the `preview` snippet, an `<img alt="">` from `previewSrc`, or a `FileTypeIcon` for `name`. An image load error SHALL fall back to the icon. With `onopen`, the name SHALL be a button. With `onremove`, a separate remove `IconButton` SHALL appear. When `progress` is set and there is no `error`, a `ProgressBar` with an accessible value SHALL be shown. When `error` is set, the error text SHALL be shown with error tokens and linked to the card by `aria-describedby`. The name SHALL truncate with an ellipsis and keep the full name in `title`.

(src: packages/ui/core/src/lib/data/FileCard/FileCard.svelte)

#### Scenario: Attachment row with removal

- **GIVEN** `name="diagram.png"`, `meta="240 KB"`, `layout="row"` and `onremove`
- **WHEN** the user activates "Remove diagram.png"
- **THEN** `onremove` SHALL be called once

#### Scenario: Fallback icon on broken preview

- **GIVEN** `name="photo.jpg"` and a `previewSrc` that fails to load
- **WHEN** the image fires `error`
- **THEN** the image SHALL be replaced by a FileTypeIcon showing "JPG"

#### Scenario: Upload in progress and failed

- **GIVEN** `progress=40`
- **WHEN** it renders
- **THEN** a progressbar with value 40 SHALL be present
- **AND** with `error="Upload failed"` the progressbar SHALL be absent and the error text SHALL be visible
