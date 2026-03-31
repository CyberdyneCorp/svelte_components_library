import type { Preview } from "@storybook/svelte-vite";
import "../packages/ui/foundation/src/lib/styles/index.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Light / Dark mode",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "dark", title: "Dark", icon: "moon" },
          { value: "light", title: "Light", icon: "sun" },
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
        document.body.style.backgroundColor = theme === "light" ? "#f8f8fc" : "#0a0a0f";
        document.body.style.color = theme === "light" ? "#12121a" : "#f0f0ff";
      }

      return Story(context.args);
    },
  ],
};

export default preview;
