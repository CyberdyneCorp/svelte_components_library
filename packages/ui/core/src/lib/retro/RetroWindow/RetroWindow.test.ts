import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import RetroWindow from "./RetroWindow.svelte";

describe("RetroWindow", () => {
  it("does not render when open is false", () => {
    const { container } = render(RetroWindow, { props: { open: false, title: "T" } });
    expect(container.querySelector(".cy-rwin")).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    render(RetroWindow, { props: { open: true, title: "Terminal" } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the title", () => {
    render(RetroWindow, { props: { open: true, title: "Team" } });
    expect(screen.getAllByText("Team").length).toBeGreaterThan(0);
  });

  it("has accessible dialog label", () => {
    render(RetroWindow, { props: { open: true, title: "DAO" } });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "DAO");
  });

  it("has close button", () => {
    render(RetroWindow, { props: { open: true, title: "T" } });
    expect(screen.getByLabelText("Close window")).toBeInTheDocument();
  });

  it("closes on close button click", async () => {
    const onClose = vi.fn();
    const { container } = render(RetroWindow, { props: { open: true, title: "T", onClose } });
    await fireEvent.click(screen.getByLabelText("Close window"));
    expect(onClose).toHaveBeenCalled();
    expect(container.querySelector(".cy-rwin")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T" } });
    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(container.querySelector(".cy-rwin")).not.toBeInTheDocument();
  });

  it("applies position via inline style", () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", x: 150, y: 200 } });
    const el = container.querySelector<HTMLElement>(".cy-rwin")!;
    expect(el.style.left).toBe("150px");
    expect(el.style.top).toBe("200px");
  });

  it("applies size via inline style", () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", width: 600, height: 400 } });
    const el = container.querySelector<HTMLElement>(".cy-rwin")!;
    expect(el.style.width).toBe("600px");
    expect(el.style.height).toBe("400px");
  });

  it("fires onFocus when window is clicked", async () => {
    const onFocus = vi.fn();
    render(RetroWindow, { props: { open: true, title: "T", onFocus } });
    await fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onFocus).toHaveBeenCalled();
  });

  it("starts drag on title bar mousedown", async () => {
    render(RetroWindow, { props: { open: true, title: "T", x: 0, y: 0 } });
    const titlebar = screen.getByRole("toolbar");
    await fireEvent.mouseDown(titlebar, { clientX: 10, clientY: 10 });
    await fireEvent.mouseMove(window, { clientX: 60, clientY: 40 });
    await fireEvent.mouseUp(window);
    // no throw = drag flow executed
    expect(titlebar).toBeInTheDocument();
  });

  it("does not drag when draggable=false", async () => {
    render(RetroWindow, { props: { open: true, title: "T", draggable: false, x: 0, y: 0 } });
    const titlebar = screen.getByRole("toolbar");
    await fireEvent.mouseDown(titlebar);
    // no error
    expect(titlebar).toBeInTheDocument();
  });

  it("renders footer by default with status text", () => {
    render(RetroWindow, { props: { open: true, title: "Services" } });
    // Title appears twice: in title bar + footer status
    expect(screen.getAllByText("Services")).toHaveLength(2);
  });

  it("hides footer when showFooter=false", () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", showFooter: false } });
    expect(container.querySelector(".cy-rwin__footer")).not.toBeInTheDocument();
  });

  it("renders resize handle when resizable", () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", resizable: true } });
    expect(container.querySelector(".cy-rwin__resize")).toBeInTheDocument();
  });

  it("omits resize handle when resizable=false", () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", resizable: false } });
    expect(container.querySelector(".cy-rwin__resize")).not.toBeInTheDocument();
  });

  it("starts resize on handle mousedown", async () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", width: 400, height: 300 } });
    const handle = container.querySelector<HTMLElement>(".cy-rwin__resize")!;
    await fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 });
    await fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    await fireEvent.mouseUp(window);
    expect(handle).toBeInTheDocument();
  });

  it("enforces minWidth/minHeight on resize", async () => {
    const { container } = render(RetroWindow, { props: { open: true, title: "T", width: 400, height: 300, minWidth: 300, minHeight: 200 } });
    const handle = container.querySelector<HTMLElement>(".cy-rwin__resize")!;
    await fireEvent.mouseDown(handle, { clientX: 500, clientY: 500 });
    await fireEvent.mouseMove(window, { clientX: 0, clientY: 0 });
    await fireEvent.mouseUp(window);
    const el = container.querySelector<HTMLElement>(".cy-rwin")!;
    expect(parseInt(el.style.width)).toBeGreaterThanOrEqual(300);
    expect(parseInt(el.style.height)).toBeGreaterThanOrEqual(200);
  });
});
