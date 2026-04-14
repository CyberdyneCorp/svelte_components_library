export type StatusDotTone = "success" | "danger" | "warning" | "info" | "muted";

export interface StatusDotItem {
  id: string;
  label: string;
  value?: string | number;
  tone?: StatusDotTone;
}
