/**
 * Shared types for the chat/ components.
 */

/**
 * Inline attachment rendered alongside a chat message bubble.
 *
 * - `kind: "image"` — rendered as a clickable thumbnail that opens the full
 *   image in a new tab.
 * - `kind: "file"` — rendered as a download chip with filename + optional size
 *   and "produced by" attribution.
 *
 * `url` is whatever the consumer hosts — a CDN link, an object URL, or a
 * data URI. The library never fetches or transforms it.
 */
export type Attachment =
  | {
      kind: "image";
      url: string;
      title?: string;
      alt?: string;
      byteSize?: number;
    }
  | {
      kind: "file";
      url: string;
      filename: string;
      byteSize?: number;
      /** Optional label shown under the filename (e.g. "openfoam"). */
      producedBy?: string;
    };

/**
 * Tool-call indicator shown as a small pill next to a message — useful for
 * agent-style chats where the assistant invoked one or more tools to produce
 * its reply. `argumentsPreview` is rendered as a hover tooltip (JSON-pretty).
 */
export type ToolCall = {
  id?: string;
  name: string;
  argumentsPreview?: unknown;
  status?: "running" | "ok" | "error";
};

/**
 * Human-readable byte formatter shared by the chip renderers. Exported so
 * consumers can produce matching strings outside the bubble (e.g. in lists).
 */
export function formatChatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
