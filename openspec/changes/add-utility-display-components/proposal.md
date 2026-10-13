# Utility display components

## Why

A comparison of the library against two other component sets on 2026-10-13 showed a group of small, generic components that console and data screens need repeatedly and that we lack: human-readable timestamps, a hover preview card, a graduated confirmation for destructive actions, a truncated identifier with a copy button, a masked secret, a selectable option card, a file-type icon with a file tile, and stacked or grouped bars. Applications currently rebuild each of these by hand, with inconsistent accessibility.

The source libraries are proprietary, so these components are specified and implemented from scratch against this library's own conventions. No code, documentation or tests are copied from them, and no component carries another company's name or brand.

## What Changes

- Add `Timestamp` (data): relative or absolute time in a `<time>` element, kept current while mounted, with the absolute time available on hover.
- Add `HoverCard` (overlay): a delayed, non-modal preview card that opens on hover or keyboard focus of a trigger and stays open while the pointer or focus is inside it.
- Add `ConfirmAction` (feedback): a trigger button whose action needs one of three levels of confirmation: none, a confirm dialog, or typing an exact phrase.
- Add `CopyableValue` (data): an identifier shown truncated, full text available to assistive tech and on hover, with an icon-only copy button.
- Add `MaskedValue` (data): a secret shown as a fixed-length mask plus its last characters, optionally revealable and copyable, never placing the hidden value in the DOM.
- Add `OptionCard` (forms): a card wrapping a native radio or checkbox, for plan, method or setting choices.
- Add `FileTypeIcon` (primitives) and `FileCard` (data): an extension badge drawn as a document shape, and a file tile or row with preview, metadata, upload progress, error and remove action.
- Extend `BarChart` with multi-series data in grouped or stacked layout, with a legend and per-series marker shapes.
- Extend `Dialog` with `confirmDisabled` and `CopyButton` with `iconOnly`, both additive and needed by the new components.

## Non-goals

- No date library or time zone database; formatting uses `Intl` only.
- No PDF or video thumbnail rendering in `FileCard`; the application passes its own preview.
- No secret generation or storage, and no async progress handling in `ConfirmAction` (the application shows progress and errors).
- No negative values in stacked bars.

## Capabilities

### New Capabilities

- `utility-display-components`: Timestamp, HoverCard, ConfirmAction, CopyableValue, MaskedValue, OptionCard, FileTypeIcon, FileCard.

### Modified Capabilities

- `charts-visualization`: multi-series grouped and stacked `BarChart`.
- `core-components`: `Dialog.confirmDisabled`, `CopyButton.iconOnly`.

## Impact

- New: `data/{Timestamp,CopyableValue,MaskedValue,FileCard}`, `overlay/HoverCard`, `feedback/ConfirmAction`, `forms/OptionCard`, `primitives/FileTypeIcon`.
- Extended: `charts/BarChart`, `feedback/Dialog`, `primitives/CopyButton`.
- `src/lib/index.ts` exports, Storybook stories, README categories, `documentation/TRD.md` rows, and a minor changeset for `@cyberdynecorp/svelte-ui-core`.

## Review

The user picked these components from the gap analysis on 2026-10-13 and asked for OpenSpec changes followed by implementation. `ConfirmationLadder` and `FileWithPreview` from the analysis are renamed `ConfirmAction` and `FileCard` here, since they are written from scratch.
