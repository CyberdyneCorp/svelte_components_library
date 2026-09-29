import type { IconName } from "../../primitives/Icon/icon-names.js";

/** Status kinds. `warning` and `info` join the original four. */
export type StatusBadgeStatus = "active" | "inactive" | "pending" | "error" | "warning" | "info";

/** Colour tone. Defaults per status; set it to decouple colour from meaning. */
export type StatusBadgeTone = "success" | "neutral" | "warning" | "error" | "info";

/** Leading marker: the legacy colour dot or a per-status icon. */
export type StatusBadgeIndicator = "dot" | "icon";

export type StatusBadgeDefaults = { tone: StatusBadgeTone; icon: IconName; label: string };

/**
 * Default tone, icon and label for each status. Every status has its own icon
 * shape, so badges stay distinguishable in grayscale (WCAG 1.4.1).
 */
export const STATUS_BADGE_DEFAULTS: Readonly<Record<StatusBadgeStatus, StatusBadgeDefaults>> = {
  active: { tone: "success", icon: "check", label: "Active" },
  inactive: { tone: "neutral", icon: "minus", label: "Inactive" },
  pending: { tone: "warning", icon: "clock", label: "Pending" },
  error: { tone: "error", icon: "x", label: "Error" },
  warning: { tone: "warning", icon: "alert-triangle", label: "Warning" },
  info: { tone: "info", icon: "info", label: "Info" },
};
