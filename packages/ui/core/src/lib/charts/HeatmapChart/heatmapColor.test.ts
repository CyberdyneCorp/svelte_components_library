import { describe, it, expect } from "vitest";
import { cellRgb, contrastText, luminance, rgbCss, type Rgb } from "./heatmapColor.js";

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function textRgb(background: Rgb): Rgb {
  return contrastText(background) === "#000000" ? [0, 0, 0] : [255, 255, 255];
}

describe("cellRgb", () => {
  it("runs sequential scales from black to the full colour", () => {
    expect(cellRgb(0, "green", 0, 10)).toEqual([0, 0, 0]);
    expect(cellRgb(10, "green", 0, 10)).toEqual([0, 255, 65]);
    expect(cellRgb(10, "cyan", 0, 10)).toEqual([0, 212, 255]);
  });

  it("diverges red/green around zero", () => {
    expect(cellRgb(1, "diverging", -1, 1)).toEqual([0, 255, 65]);
    expect(cellRgb(-1, "diverging", -1, 1)).toEqual([255, 30, 30]);
    expect(cellRgb(0, "diverging", -1, 1)).toEqual([0, 0, 0]);
  });

  it("does not divide by zero on a flat range", () => {
    expect(cellRgb(5, "green", 5, 5)).toEqual([0, 0, 0]);
  });

  it("formats as CSS", () => {
    expect(rgbCss([1, 2, 3])).toBe("rgb(1, 2, 3)");
  });
});

describe("contrastText", () => {
  // Regression: 0.55 in the diverging correlation story was drawn in
  // rgba(0,0,0,0.8) on #008c24 (4.08:1) and failed axe color-contrast.
  it("meets 4.5:1 on the cell that used to fail", () => {
    const bg = cellRgb(0.55, "diverging", -0.45, 1);
    expect(contrast(bg, textRgb(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("meets 4.5:1 across every scale and value", () => {
    for (const scale of ["green", "cyan", "diverging"] as const) {
      for (let v = -1; v <= 1; v += 0.05) {
        const bg = cellRgb(v, scale, -1, 1);
        expect(contrast(bg, textRgb(bg))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
