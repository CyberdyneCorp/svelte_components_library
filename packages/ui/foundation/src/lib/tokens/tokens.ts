export const breakpoints = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1440,
} as const;

export const grid = {
  mobile: { columns: 4, gutter: "16px", margin: "16px" },
  tablet: { columns: 8, gutter: "24px", margin: "32px" },
  desktop: { columns: 12, gutter: "24px", margin: "40px" },
} as const;

export const typography = {
  fontFamilies: {
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    body: '"Inter", "Space Grotesk", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
  },
  scales: {
    display1: { size: "3.5rem", lineHeight: "1.1", weight: 700, letterSpacing: "-0.02em" },
    display2: { size: "2.5rem", lineHeight: "1.15", weight: 700, letterSpacing: "-0.015em" },
    h1: { size: "2rem", lineHeight: "1.2", weight: 600, letterSpacing: "-0.01em" },
    h2: { size: "1.5rem", lineHeight: "1.25", weight: 600, letterSpacing: "-0.005em" },
    h3: { size: "1.25rem", lineHeight: "1.3", weight: 600, letterSpacing: "0" },
    bodyLg: { size: "1.125rem", lineHeight: "1.5", weight: 400, letterSpacing: "0" },
    bodyMd: { size: "1rem", lineHeight: "1.5", weight: 400, letterSpacing: "0" },
    bodySm: { size: "0.875rem", lineHeight: "1.5", weight: 400, letterSpacing: "0.01em" },
    label: { size: "0.875rem", lineHeight: "1.4", weight: 500, letterSpacing: "0.02em" },
    caption: { size: "0.75rem", lineHeight: "1.4", weight: 400, letterSpacing: "0.03em" },
    code: { size: "0.875rem", lineHeight: "1.6", weight: 400, letterSpacing: "0.02em" },
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;

export const radius = {
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  pill: "999px",
} as const;

export const colors = {
  primitives: {
    neonGreen: {
      10: "#00ff41",
      20: "#00e639",
      30: "#00cc33",
      40: "#00b32d",
      50: "#009926",
      60: "#007a1f",
    },
    cyan: {
      10: "#00d4ff",
      20: "#00bfe6",
      30: "#00aacc",
      40: "#0095b3",
      50: "#008099",
      60: "#006b80",
    },
    violet: {
      10: "#a855f7",
      20: "#9333ea",
      30: "#7e22ce",
      40: "#6b21a8",
      50: "#581c87",
      60: "#3b0764",
    },
    red: {
      10: "#ff4444",
      20: "#e63939",
      30: "#cc2e2e",
      40: "#b32424",
      50: "#991a1a",
      60: "#800f0f",
    },
    amber: {
      10: "#ffb800",
      20: "#e6a600",
      30: "#cc9400",
      40: "#b38200",
      50: "#997000",
      60: "#805e00",
    },
    grey: {
      5: "#0a0a0f",
      10: "#12121a",
      15: "#1a1a24",
      20: "#22222e",
      30: "#2a2a38",
      40: "#3a3a4a",
      50: "#4a4a5c",
      60: "#6a6a7e",
      70: "#8a8a9e",
      80: "#aaaabe",
      90: "#cacade",
      100: "#e0e0f0",
      110: "#f0f0ff",
    },
  },
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
