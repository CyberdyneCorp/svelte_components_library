<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RetroTerminal from "./RetroTerminal.svelte";

  const { Story } = defineMeta({
    title: "Retro/RetroTerminal",
    component: RetroTerminal,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
  welcome: ["Welcome to CyberdyneOS!", 'For available commands, try "help".', "Last login: 14/04/2026, 16:15:50"],
  prompt: "user@CyberdyneOS $",
}} />

<Story name="WithOutput" args={{
  welcome: ["System initialized."],
  lines: [
    { text: "user@CyberdyneOS $ help", kind: "in" },
    { text: "Available commands: ls, cd, help, exit", kind: "out" },
    { text: "ERROR: unknown flag", kind: "err" },
  ],
}} />

<Story name="ReadOnly" args={{
  welcome: ["Read-only log view"],
  lines: [{ text: "[2026-04-14] init complete", kind: "sys" }],
  readOnly: true,
}} />
