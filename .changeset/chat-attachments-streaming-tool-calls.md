---
"@cyberdynecorp/svelte-ui-core": minor
---

Bring the chat components up to feature parity with agent-style chats:
attachments, streaming, and tool-call indicators across `Chatbox`,
`ChatResponse`, and `BotAnswer`.

**Shared types**

- New `Attachment` discriminated union (`kind: "image" | "file"`) and
  `ToolCall` type. `formatChatBytes(bytes)` exported as a small helper.

**`Chatbox` — file-carrying composer**

- `onsend` is now `(msg: string, attachments: File[]) => void` (backwards
  compatible — existing `(msg) => void` handlers still work via TS bivariance).
- New `attachments` bindable `File[]` prop with chip rendering, per-chip
  remove buttons, and image thumbnails via `URL.createObjectURL`.
- `onattach` is now `(files: File[]) => void` and fires when files are picked
  via the paperclip (previously the click handler was a content-less stub).
- `acceptTypes`, `multiple`, `maxSizeBytes` props for the picker. Rejected
  files surface through a new `onerror?: (message, rejected)` callback.
- New `ondetach?: (file, index)` fires when a chip is removed.
- `showAttach` prop forces the paperclip on even when no `onattach` is wired.

**`ChatResponse` and `BotAnswer` — attachments, streaming, tool calls**

- `attachments?: Attachment[]` — images render as click-to-open thumbnails,
  files as labelled download chips with optional size + producedBy attribution.
- `toolCalls?: ToolCall[]` — small pills with name + status (`ok` / `running`
  / `error`) and a JSON-pretty `argumentsPreview` tooltip.
- `streaming?: boolean` — appends an inline `▍` cursor (blinking) at the end
  of the content, orthogonal to the existing `typing` dots indicator.
- `ChatResponse` also gains an `error` prop (inline alert at the bottom of
  the bubble) and an optional `onattachmentclick(attachment)` hook to
  intercept the default link behaviour.

All additions are non-breaking. Existing call sites keep working without
changes. New stories illustrate the new features.
