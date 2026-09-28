import type { Preview } from "@storybook/svelte-vite";
import "../packages/ui/foundation/src/lib/styles/index.css";
import "../packages/ui/foundation/src/lib/themes/calm.css";
import "../packages/ui/foundation/src/lib/themes/minimal.css";
import "../packages/ui/foundation/src/lib/themes/flat.css";
import "../packages/ui/foundation/src/lib/themes/material.css";
import "../packages/ui/foundation/src/lib/themes/swiss.css";
import "../packages/ui/foundation/src/lib/themes/organic.css";
import "../packages/ui/foundation/src/lib/themes/maximalism.css";
import "../packages/ui/foundation/src/lib/themes/y2k.css";
import "../packages/ui/foundation/src/lib/themes/glass.css";
import "../packages/ui/foundation/src/lib/themes/neumorphism.css";
import "../packages/ui/foundation/src/lib/themes/skeuomorphism.css";
import "../packages/ui/foundation/src/lib/themes/brutalism.css";
import "../packages/ui/foundation/src/lib/themes/bento.css";
import "../packages/ui/foundation/src/lib/themes/clay.css";
import "../packages/ui/foundation/src/lib/themes/memphis.css";
import "../packages/ui/foundation/src/lib/themes/vaporwave.css";
import "../packages/ui/foundation/src/lib/themes/art-deco.css";
import "../packages/ui/foundation/src/lib/themes/editorial.css";

/** Page background / text per toolbar theme (body sits outside the story root). */
const PAGE_COLORS: Record<string, [string, string]> = {
  dark: ["#0a0a0f", "#f0f0ff"],
  light: ["#f8f8fc", "#12121a"],
  calm: ["#f7f5f0", "#2b2f2c"],
  "calm-dark": ["#161a18", "#e8e6e0"],
  minimal: ["#ffffff", "#111111"],
  flat: ["#ffffff", "#1a2233"],
  material: ["#fef7ff", "#1d1b20"],
  swiss: ["#ffffff", "#000000"],
  organic: ["#f4efe4", "#2e261c"],
  maximalism: ["#fff3dc", "#1a0b2e"],
  y2k: ["#eef0f7", "#1b1d3a"],
  glass: ["#0d0b1f", "#f4f2ff"],
  neumorphism: ["#e0e5ec", "#2d3440"],
  skeuomorphism: ["#e9e2d3", "#2e2419"],
  brutalism: ["#fff4e0", "#000000"],
  bento: ["#f1f1f4", "#111118"],
  clay: ["#f3eefc", "#2e2344"],
  memphis: ["#fff6e5", "#1a1a1a"],
  vaporwave: ["#1b0a33", "#fbeaff"],
  "art-deco": ["#0b0b0c", "#f4ecd8"],
  editorial: ["#faf7f0", "#1b1a17"],
};

/** Design-style presets (themes/<id>.css) listed in the toolbar. */
const STYLE_PRESETS: [string, string][] = [
  ["minimal", "Minimal"],
  ["flat", "Flat"],
  ["material", "Material"],
  ["swiss", "Swiss"],
  ["organic", "Organic"],
  ["maximalism", "Maximalism"],
  ["y2k", "Y2K"],
  ["glass", "Glass"],
  ["neumorphism", "Neumorphism"],
  ["skeuomorphism", "Skeuomorphism"],
  ["brutalism", "Brutalism"],
  ["bento", "Bento"],
  ["clay", "Clay"],
  ["memphis", "Memphis"],
  ["vaporwave", "Vaporwave"],
  ["art-deco", "Art Deco"],
  ["editorial", "Editorial"],
];

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme (default dark / light / calm / design-style presets)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
          { value: "calm", title: "Calm", icon: "circle" },
          { value: "calm-dark", title: "Calm dark", icon: "circlehollow" },
          ...STYLE_PRESETS.map(([value, title]) => ({ value, title, icon: "paintbrush" })),
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "dark",
  },
  parameters: {
    backgrounds: { disabled: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    layout: "padded",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark";

      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
        const [background, color] = PAGE_COLORS[theme] ?? PAGE_COLORS.dark;
        document.body.style.backgroundColor = background;
        document.body.style.color = color;
      }

      return Story(context.args);
    },
  ],
};

export default preview;
