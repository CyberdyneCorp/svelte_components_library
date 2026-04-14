<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BootScreen from "./BootScreen.svelte";
  const { Story } = defineMeta({ title: "Retro/BootScreen", component: BootScreen, tags: ["autodocs"] });
</script>

<Story name="Default" args={{
  logo: "CyberdyneOS 2.1",
  lines: [
    "BIOS v4.2 — Initializing...",
    "Detecting wallet providers",
    "Mounting decentralized filesystem",
    "Connecting to RPC node",
    "Loading DAO treasury",
    "Starting terminal subsystem",
  ],
  typeSpeedMs: 250,
}} />
