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
      // Render docs story previews in iframes so they get the dark background
      story: { inline: false, height: "400px" },
    },
    a11y: {},
    layout: "padded",
  },
};

export default preview;
