/**
 * Types for the sectioned OS-style {@link LauncherMenu}.
 *
 * Lives in a sibling `.ts` file because Svelte 5 runes-mode `<script>`
 * blocks can't export interfaces.
 */

export interface LauncherMenuEntry {
  id: string;
  label: string;
  /** Emoji or unicode glyph, rendered as text. */
  icon: string;
  /** Optional second line under the label (used in submenu items and
   *  for things like a "Log out" subtitle). */
  subtitle?: string;
  /** Green pill badge (e.g. a cart count). Only shown when > 0. */
  badge?: number;
  /** Hover/focus submenu entries. */
  children?: LauncherMenuEntry[];
}

export interface LauncherMenuSection {
  id: string;
  /** Section header, typically uppercased by the caller. */
  label: string;
  items: LauncherMenuEntry[];
}

/** Context handed to the `account` snippet so callers can render their
 *  own identity / connect-wallet widget instead of the built-in row. */
export interface LauncherMenuAccountContext {
  connected: boolean;
  identity: string | null;
  identityFull: string | null;
}
