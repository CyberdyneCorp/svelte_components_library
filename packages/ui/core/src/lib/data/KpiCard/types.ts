/** Direction of change; drives the arrow icon. */
export type KpiTrend = "up" | "down" | "flat";

/** Whether the change is good or bad; drives the colour, independently of direction. */
export type KpiSentiment = "positive" | "negative" | "neutral";

/** Visually hidden words announced with the arrow icon (override for i18n). */
export type KpiTrendLabels = Record<KpiTrend, string>;

export const DEFAULT_TREND_LABELS: KpiTrendLabels = {
  up: "increased",
  down: "decreased",
  flat: "unchanged",
};
