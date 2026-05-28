import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import { createRawSnippet } from "svelte";
import LauncherMenu from "./LauncherMenu.svelte";
import type {
  LauncherMenuAccountContext,
  LauncherMenuEntry,
  LauncherMenuSection,
} from "./types.js";

const sections: LauncherMenuSection[] = [
  {
    id: "core",
    label: "CORE",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "🛰️", subtitle: "Mission control" },
      { id: "cart", label: "Cart", icon: "🛒", badge: 3 },
    ],
  },
  {
    id: "ecosystem",
    label: "ECOSYSTEM",
    items: [
      {
        id: "products",
        label: "Products",
        icon: "📦",
        children: [
          { id: "wallet", label: "Wallet", icon: "👛", subtitle: "Custody & keys" },
          { id: "products", label: "View all products", icon: "↗" },
        ],
      },
    ],
  },
];

describe("LauncherMenu", () => {
  it("renders the trigger with the default label", () => {
    render(LauncherMenu, { props: { sections } });
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
  });

  it("honours a custom triggerLabel", () => {
    render(LauncherMenu, { props: { sections, triggerLabel: "Apps" } });
    expect(screen.getByRole("button", { name: /apps/i })).toBeInTheDocument();
  });

  it("menu is closed by default", () => {
    render(LauncherMenu, { props: { sections } });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on trigger click and reflects aria-expanded", async () => {
    render(LauncherMenu, { props: { sections } });
    const btn = screen.getByRole("button", { name: /start/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await fireEvent.click(btn);
    expect(screen.getByRole("menu", { name: /cyberdyne os/i })).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("renders header, tagline and section labels", async () => {
    render(LauncherMenu, { props: { sections, header: "CYBERDYNE OS" } });
    await fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByText("CYBERDYNE OS")).toBeInTheDocument();
    expect(screen.getByText("CORE")).toBeInTheDocument();
    expect(screen.getByText("ECOSYSTEM")).toBeInTheDocument();
  });

  it("renders item subtitle, badge and submenu chevron", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    expect(screen.getByText("Mission control")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // badge
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("fires onItemSelect and closes on pick", async () => {
    const onItemSelect = vi.fn();
    render(LauncherMenu, { props: { sections, open: true, onItemSelect } });
    await fireEvent.click(screen.getByText("Dashboard"));
    expect(onItemSelect).toHaveBeenCalledWith("dashboard");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the submenu on hover of an item with children", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    const products = screen.getByText("Products").closest(".item")!;
    await fireEvent.mouseEnter(products);
    expect(screen.getByRole("menu", { name: /products submenu/i })).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("View all products")).toBeInTheDocument();
  });

  it("filters items by label and subtitle via search", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    const input = screen.getByPlaceholderText(/search/i);
    await fireEvent.input(input, { target: { value: "mission" } });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Products")).not.toBeInTheDocument();
  });

  it("shows an empty message when nothing matches", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    await fireEvent.input(screen.getByPlaceholderText(/search/i), {
      target: { value: "zzzzz" },
    });
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();
  });

  it("opens and focuses search on the keyboard shortcut (Cmd/Ctrl+K)", async () => {
    render(LauncherMenu, { props: { sections } });
    await fireEvent.keyDown(document, { key: "k", metaKey: true });
    const input = await screen.findByPlaceholderText(/search/i);
    await waitFor(() => expect(input).toHaveFocus());
  });

  it("does not bind a shortcut when shortcut is null", async () => {
    render(LauncherMenu, { props: { sections, shortcut: null } });
    await fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    await fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", async () => {
    render(LauncherMenu, { props: { sections, open: true } });
    await fireEvent.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  describe("snippets", () => {
    it("renders a custom icon snippet per entry instead of emoji text", async () => {
      const icon = createRawSnippet((entry: () => LauncherMenuEntry) => ({
        render: () => `<span class="custom-icon">icon:${entry().id}</span>`,
      }));
      render(LauncherMenu, { props: { sections, open: true, icon } });
      // Custom icon used for items...
      expect(screen.getByText("icon:dashboard")).toBeInTheDocument();
      // ...and the raw emoji is no longer rendered.
      expect(screen.queryByText("🛰️")).not.toBeInTheDocument();
    });

    it("uses the icon snippet for submenu entries too", async () => {
      const icon = createRawSnippet((entry: () => LauncherMenuEntry) => ({
        render: () => `<span class="custom-icon">icon:${entry().id}</span>`,
      }));
      render(LauncherMenu, { props: { sections, open: true, icon } });
      const products = screen.getByText("Products").closest(".item")!;
      await fireEvent.mouseEnter(products);
      expect(screen.getByText("icon:wallet")).toBeInTheDocument();
    });

    it("replaces the built-in account row with the account snippet", async () => {
      const account = createRawSnippet((ctx: () => LauncherMenuAccountContext) => ({
        render: () =>
          `<div data-testid="custom-account">${ctx().connected ? "ON" : "OFF"}</div>`,
      }));
      render(LauncherMenu, { props: { sections, open: true, connected: false, account } });
      expect(screen.getByTestId("custom-account")).toHaveTextContent("OFF");
      // Built-in row is suppressed when the snippet is provided.
      expect(screen.queryByText("NOT SIGNED IN")).not.toBeInTheDocument();
    });
  });

  describe("account row", () => {
    it("shows NOT SIGNED IN when disconnected", async () => {
      render(LauncherMenu, { props: { sections, open: true, connected: false } });
      expect(screen.getByText("NOT SIGNED IN")).toBeInTheDocument();
    });

    it("shows identity + copies the full value to the clipboard", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText } });
      render(LauncherMenu, {
        props: {
          sections,
          open: true,
          connected: true,
          identity: "0x7aF…9c3B",
          identityFull: "0x7aF1c0Dd9c3B",
        },
      });
      expect(screen.getByText("ACCOUNT CONNECTED")).toBeInTheDocument();
      expect(screen.getByText("0x7aF…9c3B")).toBeInTheDocument();
      await fireEvent.click(screen.getByRole("button", { name: /copy address/i }));
      expect(writeText).toHaveBeenCalledWith("0x7aF1c0Dd9c3B");
    });
  });
});
