export type RetroTerminalLineKind = "in" | "out" | "err" | "sys";

export interface RetroTerminalLine {
  text: string;
  kind?: RetroTerminalLineKind;
}
