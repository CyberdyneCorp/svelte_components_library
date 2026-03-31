import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MegaMenu from "./MegaMenu.svelte";

const sections = [
  {
    title: "Products",
    items: [
      { label: "Widget", href: "/widget", description: "A cool widget", icon: "W" },
      { label: "Gadget", href: "/gadget" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

describe("MegaMenu", () => {
  it("renders trigger area", () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    expect(container.querySelector(".cy-megamenu__trigger")).toBeInTheDocument();
  });

  it("does not show panel when closed", () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    expect(container.querySelector(".cy-megamenu__panel")).not.toBeInTheDocument();
  });

  it("shows panel when open", () => {
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
  });

  it("renders section titles", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
  });

  it("renders menu items", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("Gadget")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("renders item descriptions", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("A cool widget")).toBeInTheDocument();
  });

  it("renders item icons", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("W")).toBeInTheDocument();
  });

  it("toggles panel on trigger click", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    const trigger = container.querySelector(".cy-megamenu__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
  });

  it("closes panel on trigger click when open", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    const trigger = container.querySelector(".cy-megamenu__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-megamenu__panel")).not.toBeInTheDocument();
  });

  it("toggles on Enter key", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    const trigger = container.querySelector(".cy-megamenu__trigger")!;
    await fireEvent.keyDown(trigger, { key: "Enter" });
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
  });

  it("toggles on Space key", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    const trigger = container.querySelector(".cy-megamenu__trigger")!;
    await fireEvent.keyDown(trigger, { key: " " });
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".cy-megamenu__panel")).not.toBeInTheDocument();
  });

  it("calls onnavigate when item clicked", async () => {
    const onnavigate = vi.fn();
    render(MegaMenu, { props: { sections, open: true, onnavigate } });
    await fireEvent.click(screen.getByText("Widget"));
    expect(onnavigate).toHaveBeenCalledWith("/widget");
  });

  it("closes panel after navigation", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    await fireEvent.click(screen.getByText("Widget"));
    expect(container.querySelector(".cy-megamenu__panel")).not.toBeInTheDocument();
  });

  it("opens on mouse enter", async () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    const megamenu = container.querySelector(".cy-megamenu")!;
    await fireEvent.mouseEnter(megamenu);
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
  });

  it("closes on mouse leave after delay", async () => {
    vi.useFakeTimers();
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    const megamenu = container.querySelector(".cy-megamenu")!;
    await fireEvent.mouseLeave(megamenu);
    vi.advanceTimersByTime(300);
    expect(container.querySelector(".cy-megamenu__panel")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("cancels close when mouse re-enters", async () => {
    vi.useFakeTimers();
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    const megamenu = container.querySelector(".cy-megamenu")!;
    await fireEvent.mouseLeave(megamenu);
    vi.advanceTimersByTime(100);
    await fireEvent.mouseEnter(megamenu);
    vi.advanceTimersByTime(300);
    expect(container.querySelector(".cy-megamenu__panel")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("sets aria-expanded on trigger", () => {
    const { container } = render(MegaMenu, { props: { sections, open: true } });
    const trigger = container.querySelector(".cy-megamenu__trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  });

  it("sets aria-expanded false when closed", () => {
    const { container } = render(MegaMenu, { props: { sections, open: false } });
    const trigger = container.querySelector(".cy-megamenu__trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("applies custom width", () => {
    const { container } = render(MegaMenu, { props: { sections, open: true, width: "800px" } });
    const panel = container.querySelector(".cy-megamenu__panel") as HTMLElement;
    expect(panel.style.width).toBe("800px");
  });
});
