/** Opaque sRGB colour as 0–255 channels. */
export type Rgb = [number, number, number];

export type HeatmapColorScale = "green" | "cyan" | "diverging";

/** Channel maxima of each scale, reached at the end of its range. */
const SEQUENTIAL_MAX: Record<Exclude<HeatmapColorScale, "diverging">, Rgb> = {
  green: [0, 255, 65],
  cyan: [0, 212, 255],
};
const DIVERGING_POSITIVE: Rgb = [0, 255, 65];
const DIVERGING_NEGATIVE: Rgb = [255, 30, 30];

function scaleRgb(max: Rgb, t: number): Rgb {
  return max.map((c) => Math.round(t * c)) as Rgb;
}

/**
 * Cell colour for `value`. Sequential scales run black → full colour over
 * `[min, max]`; the diverging scale runs red → black → green around zero.
 */
export function cellRgb(value: number, scale: HeatmapColorScale, min: number, max: number): Rgb {
  if (scale === "diverging") {
    const norm = value / (Math.max(Math.abs(min), Math.abs(max)) || 1);
    return norm >= 0 ? scaleRgb(DIVERGING_POSITIVE, norm) : scaleRgb(DIVERGING_NEGATIVE, -norm);
  }
  return scaleRgb(SEQUENTIAL_MAX[scale], (value - min) / (max - min || 1));
}

export function rgbCss([r, g, b]: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance. */
export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Black or white, whichever contrasts more with `background` (never below 4.58:1). */
export function contrastText(background: Rgb): "#000000" | "#ffffff" {
  const l = luminance(background);
  return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#000000" : "#ffffff";
}
