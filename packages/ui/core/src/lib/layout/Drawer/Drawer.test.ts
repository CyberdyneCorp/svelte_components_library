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
});
