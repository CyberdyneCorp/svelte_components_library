<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Kbd from "./Kbd.svelte";

  const { Story } = defineMeta({
    title: "ML/Kbd",
    component: Kbd,
    tags: ["autodocs"],
  });
</script>

<Story name="SingleKey">
  <div style="display: flex; gap: 1rem; align-items: center;">
    <Kbd keys={["Enter"]} />
    <Kbd keys={["Esc"]} />
    <Kbd keys={["Space"]} />
    <Kbd keys={["Tab"]} />
  </div>
</Story>

<Story name="Combination">
  <div style="display: flex; gap: 1.5rem; align-items: center;">
    <Kbd keys={["Ctrl", "C"]} />
    <Kbd keys={["Ctrl", "V"]} />
    <Kbd keys={["Ctrl", "Shift", "P"]} />
  </div>
</Story>

<Story name="ModifierKeys">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <Kbd keys={["Cmd", "K"]} /> <span style="color: rgba(255,255,255,0.5); font-size: 0.875rem;">Command palette</span>
    </div>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <Kbd keys={["Cmd", "Shift", "F"]} /> <span style="color: rgba(255,255,255,0.5); font-size: 0.875rem;">Global search</span>
    </div>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <Kbd keys={["Alt", "Enter"]} size="sm" /> <span style="color: rgba(255,255,255,0.5); font-size: 0.875rem;">Submit (small)</span>
    </div>
  </div>
</Story>
