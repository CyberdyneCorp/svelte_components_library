import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Drawer from "./Drawer.svelte";

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
});
