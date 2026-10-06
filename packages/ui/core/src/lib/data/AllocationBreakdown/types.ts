export type AllocationTone = "brand" | "info" | "violet" | "warning" | "negative";

export interface AllocationItem {
  id: string;
  label: string;
  /** Signed percentage supplied by the application. May exceed 100. */
  percentage: number;
  /** Preformatted amount, including currency and any sign. */
  value: string;
  tone?: AllocationTone;
}

/** Relative geometry only; does not calculate or normalize financial percentages. */
export function allocationWidth(percentage: number, maximum: number): number {
  if (!Number.isFinite(percentage) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.min(1, Math.abs(percentage) / maximum) * 50;
}
