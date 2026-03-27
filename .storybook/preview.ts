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
    layout: "padded",
  },
  decorators: [
    // Ensure the story canvas always has dark background and proper CSS vars
    (Story) => ({
      Component: Story,
      props: {},
    }),
  ],
};

export default preview;

// Force dark background on the story body
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    body {
      background-color: #0a0a0f !important;
      color: #f0f0ff !important;
    }
    .sb-show-main {
      background-color: #0a0a0f !important;
    }
    .docs-story > div {
      background-color: #0a0a0f !important;
    }
    #storybook-root {
      padding: 1rem;
    }
  `;
  document.head.appendChild(style);
}
