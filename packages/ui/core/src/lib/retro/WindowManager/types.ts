export interface ManagedWindow {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized?: boolean;
  maximized?: boolean;
  icon?: string;
  meta?: Record<string, unknown>;
}
