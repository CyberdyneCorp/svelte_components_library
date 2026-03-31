import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const cyberdyneTheme = create({
  base: "dark",

  // Brand
  brandTitle: "Cyberdyne Design System",
  brandUrl: "https://github.com/CyberdyneCorp",
  brandTarget: "_blank",

  // Colors
  colorPrimary: "#00ff41",
  colorSecondary: "#00d4ff",

  // UI
  appBg: "#0a0a0f",
  appContentBg: "#12121a",
  appPreviewBg: "#0a0a0f",
  appBorderColor: "#2a2a38",
  appBorderRadius: 8,

  // Text
  textColor: "#f0f0ff",
  textInverseColor: "#0a0a0f",
  textMutedColor: "#6a6a7e",

  // Toolbar
  barTextColor: "#aaaabe",
  barSelectedColor: "#00ff41",
  barHoverColor: "#00d4ff",
  barBg: "#12121a",

  // Form
  inputBg: "#1a1a24",
  inputBorder: "#2a2a38",
  inputTextColor: "#f0f0ff",
  inputBorderRadius: 6,

  // Buttons
  buttonBg: "#1a1a24",
  buttonBorder: "#2a2a38",

  // Booleans
  booleanBg: "#1a1a24",
  booleanSelectedBg: "#00ff41",
});

addons.setConfig({
  theme: cyberdyneTheme,
});
