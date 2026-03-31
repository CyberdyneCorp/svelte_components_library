import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MenuBar from "./MenuBar.svelte";

const menus = [
  {
    label: "File",
    items: [
      { label: "New", action: "file.new", shortcut: "Ctrl+N" },
      { label: "Open", action: "file.open" },
      { separator: true, label: "" },
      { label: "Save", action: "file.save", disabled: true },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", action: "edit.undo" },
      {
        label: "Advanced",
        children: [
          { label: "Find", action: "edit.find", shortcut: "Ctrl+F" },
          { label: "Replace", action: "edit.replace" },
          { separator: true, label: "" },
          { label: "Disabled Sub", action: "edit.disabled", disabled: true },
        ],
      },
    ],
  },
];

describe("MenuBar", () => {
  it("renders with menubar role", () => {
    render(MenuBar, { props: { menus } });
    expect(screen.getByRole("menubar")).toBeInTheDocument();
  });

  it("renders all top-level menu triggers", () => {
    render(MenuBar, { props: { menus } });
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("opens menu on click", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("closes menu on second click", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("New")).toBeInTheDocument();
    await fireEvent.click(screen.getByText("File"));
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("shows shortcut labels", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("Ctrl+N")).toBeInTheDocument();
  });

  it("renders separators", async () => {
    const { container } = render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    const seps = container.querySelectorAll("[role='separator']");
    expect(seps.length).toBeGreaterThanOrEqual(1);
  });

  it("renders disabled items", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    const saveBtn = screen.getByText("Save").closest("button");
    expect(saveBtn).toBeDisabled();
  });

  it("calls onaction when item clicked", async () => {
    const onaction = vi.fn();
    render(MenuBar, { props: { menus, onaction } });
    await fireEvent.click(screen.getByText("File"));
    await fireEvent.click(screen.getByText("New"));
    expect(onaction).toHaveBeenCalledWith("file.new");
  });

  it("does not call onaction for disabled items", async () => {
    const onaction = vi.fn();
    render(MenuBar, { props: { menus, onaction } });
    await fireEvent.click(screen.getByText("File"));
    const saveBtn = screen.getByText("Save").closest("button")!;
    await fireEvent.click(saveBtn);
    expect(onaction).not.toHaveBeenCalled();
  });

  it("closes menu after action", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    await fireEvent.click(screen.getByText("New"));
    expect(screen.queryByText("Open")).not.toBeInTheDocument();
  });

  it("switches to another menu on mouseenter when open", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("New")).toBeInTheDocument();
    await fireEvent.mouseEnter(screen.getByText("Edit"));
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("does not switch menu on mouseenter when closed", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.mouseEnter(screen.getByText("Edit"));
    expect(screen.queryByText("Undo")).not.toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("navigates to next menu with ArrowRight", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    await fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  it("navigates to previous menu with ArrowLeft", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    await fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("wraps ArrowRight from last to first menu", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    await fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("opens submenu on hover", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    const advancedWrapper = screen.getByText("Advanced").closest(".cy-menubar__item-wrapper")!;
    await fireEvent.mouseEnter(advancedWrapper);
    expect(screen.getByText("Find")).toBeInTheDocument();
    expect(screen.getByText("Replace")).toBeInTheDocument();
  });

  it("shows submenu shortcuts", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    const advancedWrapper = screen.getByText("Advanced").closest(".cy-menubar__item-wrapper")!;
    await fireEvent.mouseEnter(advancedWrapper);
    expect(screen.getByText("Ctrl+F")).toBeInTheDocument();
  });

  it("calls onaction for submenu item", async () => {
    const onaction = vi.fn();
    render(MenuBar, { props: { menus, onaction } });
    await fireEvent.click(screen.getByText("Edit"));
    const advancedWrapper = screen.getByText("Advanced").closest(".cy-menubar__item-wrapper")!;
    await fireEvent.mouseEnter(advancedWrapper);
    await fireEvent.click(screen.getByText("Find"));
    expect(onaction).toHaveBeenCalledWith("edit.find");
  });

  it("closes submenu on mouse leave", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    const advancedWrapper = screen.getByText("Advanced").closest(".cy-menubar__item-wrapper")!;
    await fireEvent.mouseEnter(advancedWrapper);
    expect(screen.getByText("Find")).toBeInTheDocument();
    await fireEvent.mouseLeave(advancedWrapper);
    expect(screen.queryByText("Find")).not.toBeInTheDocument();
  });

  it("sets aria-expanded on open trigger", async () => {
    render(MenuBar, { props: { menus } });
    const fileTrigger = screen.getByText("File");
    expect(fileTrigger.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(fileTrigger);
    expect(fileTrigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("shows arrow indicator for items with children", async () => {
    const { container } = render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    const arrows = container.querySelectorAll(".cy-menubar__item-arrow");
    expect(arrows.length).toBeGreaterThanOrEqual(1);
  });
});
