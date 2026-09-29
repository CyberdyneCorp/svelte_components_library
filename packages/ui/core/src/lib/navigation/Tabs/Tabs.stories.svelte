<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import Tabs from "./Tabs.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Tabs",
    component: Tabs,
    tags: ["autodocs"],
    parameters: {
      // Axe violations fail the storybook test project for the tabs.
      a11y: { test: "error" },
      docs: {
        description: {
          component:
            "Button tabs (`role=\"tablist\"`, roving tabindex, ArrowLeft/ArrowRight) switch content in place. When items carry `href`, the tabs are links between pages instead: a `<nav>` landmark (named with `ariaLabel`) holding a list of `<a>` elements, the active one marked `aria-current=\"page\"`. Link tabs are not an ARIA tab widget, so they keep link keyboard behaviour: Tab moves between them and Enter follows the link.",
        },
      },
    },
  });

  const sectionLinks = [
    { id: "overview", label: "Overview", href: "#overview" },
    { id: "activity", label: "Activity", href: "#activity" },
    { id: "settings", label: "Settings", href: "#settings" },
  ];

  /** Link tabs are plain links: Tab moves between them, arrows do nothing. */
  async function linkKeyboard({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "Wallet sections" });
    const links = within(nav).getAllByRole("link");
    await expect(links[1]).toHaveAttribute("aria-current", "page");
    links[0].focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(links[1]);
    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement).toBe(links[1]);
  }
</script>

<Story name="Default" args={{
  items: [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
  ],
  activeId: "overview",
}} />

<Story name="ThreeTabs" args={{
  items: [
    { id: "models", label: "Models" },
    { id: "datasets", label: "Datasets" },
    { id: "experiments", label: "Experiments" },
  ],
  activeId: "models",
}} />

<Story
  name="LinkTabs"
  args={{ items: sectionLinks, activeId: "activity", ariaLabel: "Wallet sections" }}
  play={linkKeyboard}
/>

<Story
  name="LinkTabsCalm"
  globals={{ theme: "calm" }}
  args={{ items: sectionLinks, activeId: "overview", ariaLabel: "Wallet sections" }}
/>

<Story
  name="LinkTabsCalmDark"
  globals={{ theme: "calm-dark" }}
  args={{ items: sectionLinks, activeId: "settings", ariaLabel: "Wallet sections" }}
/>
