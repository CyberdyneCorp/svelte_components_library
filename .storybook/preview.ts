import type { Preview } from "@storybook/svelte-vite";
import "../packages/ui/foundation/src/lib/styles/index.css";
import "../packages/ui/foundation/src/lib/themes/calm.css";

/** Page background / text per toolbar theme (body sits outside the story root). */
const PAGE_COLORS: Record<string, [string, string]> = {
  dark: ["#0a0a0f", "#f0f0ff"],
  light: ["#f8f8fc", "#12121a"],
  calm: ["#f7f5f0", "#2b2f2c"],
  "calm-dark": ["#161a18", "#e8e6e0"],
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme (default dark / light / calm presets)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
          { value: "calm", title: "Calm", icon: "circle" },
          { value: "calm-dark", title: "Calm dark", icon: "circlehollow" },
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
