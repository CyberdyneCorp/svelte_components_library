<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import Drawer from "./Drawer.svelte";
  import BottomNav from "../../navigation/BottomNav/BottomNav.svelte";
  import Button from "../../primitives/Button/Button.svelte";

  const { Story } = defineMeta({
    title: "Layout/Drawer",
    component: Drawer,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for the drawer.
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Slide-in modal panel. On open, focus moves to the first focusable element (or the panel); Tab / Shift+Tab stay inside; Escape, the backdrop and the close button close it and call `onclose`; focus returns to the opener. `open` is bindable and `closeLabel` names the close button.",
        },
      },
    },
  });

  const navItems = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "budgets", label: "Budgets", icon: "◈" },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "profile", label: "Profile", icon: "◉" },
  ];

  /** Tab through the drawer, close it with Escape, and check focus comes back. */
  async function keyboardFlow({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole("button", { name: "Open filters" });
    await userEvent.click(opener);

    const close = await canvas.findByRole("button", { name: "Close filters" });
    await waitFor(() => expect(document.activeElement).toBe(close));

    const apply = canvas.getByRole("button", { name: "Apply" });
    await userEvent.tab({ shift: true });
    await expect(document.activeElement).toBe(apply);
    await userEvent.tab();
    await expect(document.activeElement).toBe(close);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(document.activeElement).toBe(opener);
    await expect(canvas.getByText("Closed 1 time")).toBeInTheDocument();
  }

  /** The drawer footer must be the topmost element where it overlaps BottomNav. */
  async function footerAboveNav({ canvasElement }: { canvasElement: HTMLElement }) {
    const apply = await within(canvasElement).findByRole("button", { name: "Apply" });
    const box = apply.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    await expect(hit?.closest(".cy-drawer__footer")).not.toBeNull();
  }
</script>

<script lang="ts">
  let filtersOpen = $state(false);
  let closeCount = $state(0);
  let mobileOpen = $state(true);
</script>

<Story
  name="RightSide"
  args={{
    open: true,
    title: "System Logs",
  }}
/>

<Story
  name="LeftSide"
  args={{
    open: true,
    side: "left",
    title: "Navigation",
    width: "320px",
  }}
/>

<Story name="WithFooter" args={{ open: true, title: "Export Configuration" }}>
  {#snippet template(args)}
    <Drawer {...args}>
      <p>Choose a format and the date range to export.</p>
      {#snippet footer()}
        <Button variant="ghost">Cancel</Button>
        <Button>Export</Button>
      {/snippet}
    </Drawer>
  {/snippet}
</Story>

<!-- Keyboard: focus moves in on open, Tab / Shift+Tab wrap, Escape closes
     and calls onclose, and focus returns to the opener. -->
<Story name="Keyboard" play={keyboardFlow}>
  {#snippet template()}
    <Button onclick={() => (filtersOpen = true)}>Open filters</Button>
    <p>Closed {closeCount} {closeCount === 1 ? "time" : "times"}</p>
    <Drawer
      bind:open={filtersOpen}
      title="Filters"
      closeLabel="Close filters"
      onclose={() => (closeCount += 1)}
    >
      <label>
        Category
        <select>
          <option>All</option>
          <option>Groceries</option>
        </select>
      </label>
      {#snippet footer()}
        <Button onclick={() => (filtersOpen = false)}>Apply</Button>
      {/snippet}
    </Drawer>
  {/snippet}
</Story>

<!-- Phone layout: the drawer (--z-overlay) covers BottomNav (--z-nav), so its
     footer stays visible and clickable. The transformed frame contains the
     fixed-position drawer and nav so the story reads as a phone at any size. -->
<Story
  name="MobileWithBottomNav"
  globals={{ viewport: { value: "mobile1", isRotated: false } }}
  play={footerAboveNav}
>
  {#snippet template()}
    <div
      style="position: relative; transform: translateZ(0); overflow: hidden; width: 100%; max-width: 360px; height: 560px; border: 1px solid var(--color-border-subtle);"
    >
      <Button onclick={() => (mobileOpen = true)}>Open category</Button>
      <Drawer bind:open={mobileOpen} title="Groceries" width="85%">
        <p>12 transactions this month.</p>
        {#snippet footer()}
          <Button variant="ghost" onclick={() => (mobileOpen = false)}>Cancel</Button>
          <Button onclick={() => (mobileOpen = false)}>Apply</Button>
        {/snippet}
      </Drawer>
      <BottomNav items={navItems} activeId="budgets" />
    </div>
  {/snippet}
</Story>
