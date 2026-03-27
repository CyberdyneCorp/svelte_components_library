import type { Preview } from "@storybook/svelte";
import "../packages/ui/foundation/src/lib/styles/index.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "cyberdyne-dark",
      values: [
        { name: "cyberdyne-dark", value: "#0a0a0f" },
        { name: "cyberdyne-surface", value: "#12121a" },
        { name: "cyberdyne-elevated", value: "#22222e" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {},
  },
};

export default preview;
