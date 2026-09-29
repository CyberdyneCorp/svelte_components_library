import { render, screen, fireEvent } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { describe, it, expect, vi, afterEach } from "vitest";
import Drawer from "./Drawer.svelte";

const children = createRawSnippet(() => ({
  render: () => `<div><a href="#first">First link</a><button disabled>Disabled</button></div>`,
}));
const footer = createRawSnippet(() => ({
  render: () => `<button>Apply</button>`,
}));
const textOnly = createRawSnippet(() => ({ render: () => `<p>Read only</p>` }));

/** A focused button outside the drawer that stands in for the opener. */
function focusedOpener(): HTMLButtonElement {
  const opener = document.createElement("button");
  opener.textContent = "Open drawer";
  document.body.appendChild(opener);
  opener.focus();
  return opener;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Drawer", () => {
  it("does not render when open is false", () => {
    const { container } = render(Drawer, { props: { open: false } });
    const overlay = container.querySelector(".cy-drawer-overlay");
    expect(overlay).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(Drawer, { props: { open: true, title: "Settings" } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(Drawer, { props: { open: true, title: "My Drawer" } });
    expect(screen.getByText("My Drawer")).toBeInTheDocument();
  });

  it("has accessible close button", () => {
    render(Drawer, { props: { open: true, title: "Test" } });
    const closeBtn = screen.getByLabelText("Close drawer");
    expect(closeBtn).toBeInTheDocument();
  });

  it("applies side class", () => {
    const { container } = render(Drawer, { props: { open: true, side: "left" } });
    const drawer = container.querySelector(".cy-drawer--left");
    expect(drawer).toBeInTheDocument();
  });

  it("applies right side class by default", () => {
    const { container } = render(Drawer, { props: { open: true } });
    const drawer = container.querySelector(".cy-drawer--right");
    expect(drawer).toBeInTheDocument();
  });

  it("applies custom width", () => {
    const { container } = render(Drawer, { props: { open: true, width: "600px" } });
    const drawer = container.querySelector(".cy-drawer") as HTMLElement;
    expect(drawer.style.width).toBe("600px");
  });

  it("closes when close button is clicked", async () => {
    const { container } = render(Drawer, { props: { open: true, title: "Test" } });
    const closeBtn = screen.getByLabelText("Close drawer");
    await fireEvent.click(closeBtn);
    expect(container.querySelector(".cy-drawer-overlay")).not.toBeInTheDocument();
  });

  it("closes when backdrop is clicked", async () => {
    const { container } = render(Drawer, { props: { open: true, title: "Test" } });
    const overlay = container.querySelector(".cy-drawer-overlay")!;
    await fireEvent.click(overlay);
    expect(container.querySelector(".cy-drawer-overlay")).not.toBeInTheDocument();
  });

  it("does not close when drawer panel is clicked", async () => {
    const { container } = render(Drawer, { props: { open: true, title: "Test" } });
    const drawer = container.querySelector(".cy-drawer")!;
    await fireEvent.click(drawer);
    expect(container.querySelector(".cy-drawer-overlay")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const { container } = render(Drawer, { props: { open: true, title: "Test" } });
    const overlay = container.querySelector(".cy-drawer-overlay")!;
    await fireEvent.keyDown(overlay, { key: "Escape" });
    expect(container.querySelector(".cy-drawer-overlay")).not.toBeInTheDocument();
  });

  it("does not close on non-Escape key", async () => {
    const { container } = render(Drawer, { props: { open: true, title: "Test" } });
    const overlay = container.querySelector(".cy-drawer-overlay")!;
    await fireEvent.keyDown(overlay, { key: "Enter" });
    expect(container.querySelector(".cy-drawer-overlay")).toBeInTheDocument();
  });

  it("has aria-modal attribute", () => {
    render(Drawer, { props: { open: true } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has aria-labelledby attribute pointing to title", () => {
    render(Drawer, { props: { open: true, title: "My Title" } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "drawer-title");
    expect(document.getElementById("drawer-title")?.textContent).toBe("My Title");
  });

  it("renders the drawer body section", () => {
    const { container } = render(Drawer, { props: { open: true } });
    expect(container.querySelector(".cy-drawer__body")).toBeInTheDocument();
  });

  it("uses closeLabel as the close button name", () => {
    render(Drawer, { props: { open: true, title: "Filtros", closeLabel: "Fechar painel" } });
    expect(screen.getByRole("button", { name: "Fechar painel" })).toBeInTheDocument();
  });

  it("stays open and keeps focus inside when the panel is clicked", async () => {
    const onclose = vi.fn();
    render(Drawer, { props: { open: true, title: "Test", onclose } });
    await fireEvent.click(document.querySelector(".cy-drawer")!);
    expect(onclose).not.toHaveBeenCalled();
  });

  it.each([
    [
      "Escape",
      (overlay: Element) => fireEvent.keyDown(document.activeElement ?? overlay, { key: "Escape" }),
    ],
    ["the backdrop", (overlay: Element) => fireEvent.click(overlay)],
    ["the close button", () => fireEvent.click(screen.getByLabelText("Close drawer"))],
  ])("calls onclose when closed with %s", async (_how, act) => {
    const onclose = vi.fn();
    const { container } = render(Drawer, { props: { open: true, title: "Test", onclose } });
    await tick();
    await act(container.querySelector(".cy-drawer-overlay")!);
    expect(onclose).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".cy-drawer-overlay")).not.toBeInTheDocument();
  });

  it("does not call onclose when the parent closes it", async () => {
    const onclose = vi.fn();
    const { rerender } = render(Drawer, { props: { open: true, onclose } });
    await rerender({ open: false });
    expect(onclose).not.toHaveBeenCalled();
  });

  describe("focus management", () => {
    it("moves focus to the first focusable element on open", async () => {
      focusedOpener();
      render(Drawer, { props: { open: true, title: "Test", children, footer } });
      await tick();
      expect(document.activeElement).toBe(screen.getByLabelText("Close drawer"));
    });

    it("focuses the panel itself when it has nothing focusable", async () => {
      render(Drawer, { props: { open: true, title: "Test", children: textOnly } });
      const panel = document.querySelector<HTMLElement>(".cy-drawer")!;
      panel.querySelector("button")!.remove();
      await tick();
      await fireEvent.keyDown(panel, { key: "Tab" });
      expect(document.activeElement).toBe(panel);
      expect(panel).toHaveAttribute("tabindex", "-1");
    });

    it("wraps Tab from the last focusable element to the first", async () => {
      render(Drawer, { props: { open: true, title: "Test", children, footer } });
      await tick();
      const apply = screen.getByRole("button", { name: "Apply" });
      apply.focus();
      await fireEvent.keyDown(apply, { key: "Tab" });
      expect(document.activeElement).toBe(screen.getByLabelText("Close drawer"));
    });

    it("wraps Shift+Tab from the first focusable element to the last", async () => {
      render(Drawer, { props: { open: true, title: "Test", children, footer } });
      await tick();
      const close = screen.getByLabelText("Close drawer");
      await fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Apply" }));
    });

    it("lets Tab move normally between inner elements and skips disabled ones", async () => {
      render(Drawer, { props: { open: true, title: "Test", children, footer } });
      await tick();
      const link = screen.getByRole("link", { name: "First link" });
      link.focus();
      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(link);
    });

    it("returns focus to the opener after Escape", async () => {
      const opener = focusedOpener();
      const onclose = vi.fn();
      render(Drawer, { props: { open: true, title: "Test", children, onclose } });
      await tick();
      expect(document.activeElement).not.toBe(opener);
      await fireEvent.keyDown(document.activeElement!, { key: "Escape" });
      await tick();
      expect(onclose).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(opener);
    });

    it("returns focus to the opener when the parent closes it", async () => {
      const opener = focusedOpener();
      const { rerender } = render(Drawer, { props: { open: true, title: "Test" } });
      await tick();
      await rerender({ open: false });
      expect(document.activeElement).toBe(opener);
    });
  });
});
