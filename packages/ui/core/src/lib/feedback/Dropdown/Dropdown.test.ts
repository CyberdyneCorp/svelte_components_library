import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import DropdownTest from "./DropdownTest.svelte";

const items = [
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete", variant: "danger" as const },
];

describe("Dropdown", () => {
  it("renders the dropdown container", () => {
    const { container } = render(DropdownTest, { props: { items } });
    expect(container.querySelector(".cy-dropdown")).toBeInTheDocument();
  });

  it("renders the trigger content", () => {
    render(DropdownTest, { props: { items } });
    expect(screen.getByTestId("dropdown-trigger")).toBeInTheDocument();
  });

  it("menu is hidden by default", () => {
    const { container } = render(DropdownTest, { props: { items } });
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });

  it("shows menu when trigger clicked", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
  });

  it("renders all items in the menu", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("closes menu on second trigger click (toggle)", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });

  it("calls onselect when item clicked", async () => {
    const handler = vi.fn();
    const { container } = render(DropdownTest, { props: { items, onselect: handler } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    const editBtn = screen.getByText("Edit");
    await fireEvent.click(editBtn);
    expect(handler).toHaveBeenCalledWith("edit");
  });

  it("closes menu after item selection", async () => {
    const handler = vi.fn();
    const { container } = render(DropdownTest, { props: { items, onselect: handler } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    await fireEvent.click(screen.getByText("Edit"));
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });

  it("navigates with ArrowDown key", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    // Focus should start at index 0
    let focused = container.querySelector(".cy-dropdown__item--focused");
    expect(focused?.textContent).toContain("Edit");
    await fireEvent.keyDown(dropdown, { key: "ArrowDown" });
    focused = container.querySelector(".cy-dropdown__item--focused");
    expect(focused?.textContent).toContain("Delete");
  });

  it("navigates with ArrowUp key", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    await fireEvent.keyDown(dropdown, { key: "ArrowUp" });
    const focused = container.querySelector(".cy-dropdown__item--focused");
    expect(focused?.textContent).toContain("Delete");
  });

  it("selects item with Enter key", async () => {
    const handler = vi.fn();
    const { container } = render(DropdownTest, { props: { items, onselect: handler } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    await fireEvent.keyDown(dropdown, { key: "Enter" });
    expect(handler).toHaveBeenCalledWith("edit");
  });

  it("selects item with Space key", async () => {
    const handler = vi.fn();
    const { container } = render(DropdownTest, { props: { items, onselect: handler } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    await fireEvent.keyDown(dropdown, { key: " " });
    expect(handler).toHaveBeenCalledWith("edit");
  });

  it("closes menu with Escape key", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
    await fireEvent.keyDown(dropdown, { key: "Escape" });
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });

  it("opens menu with Enter key when closed", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    await fireEvent.keyDown(dropdown, { key: "Enter" });
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
  });

  it("opens menu with Space key when closed", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    await fireEvent.keyDown(dropdown, { key: " " });
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
  });

  it("opens menu with ArrowDown key when closed", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    await fireEvent.keyDown(dropdown, { key: "ArrowDown" });
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
  });

  it("wraps around with ArrowDown at end of list", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const dropdown = container.querySelector(".cy-dropdown")!;
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    await fireEvent.keyDown(dropdown, { key: "ArrowDown" }); // index 1
    await fireEvent.keyDown(dropdown, { key: "ArrowDown" }); // wraps to 0
    const focused = container.querySelector(".cy-dropdown__item--focused");
    expect(focused?.textContent).toContain("Edit");
  });

  it("applies danger variant class to danger items", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    const dangerItem = container.querySelector(".cy-dropdown__item--danger");
    expect(dangerItem).toBeInTheDocument();
    expect(dangerItem?.textContent).toContain("Delete");
  });

  it("updates focused index on mouse enter", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    const deleteBtn = screen.getByText("Delete").closest("button")!;
    await fireEvent.mouseEnter(deleteBtn);
    expect(deleteBtn.className).toContain("cy-dropdown__item--focused");
  });

  it("applies right alignment class", async () => {
    const { container } = render(DropdownTest, { props: { items, align: "right" } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-dropdown__menu--right")).toBeInTheDocument();
  });

  it("renders items with icons when provided", async () => {
    const itemsWithIcons = [
      { label: "Edit", value: "edit", icon: "pencil" },
      { label: "Delete", value: "delete" },
    ];
    const { container } = render(DropdownTest, { props: { items: itemsWithIcons } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector(".cy-dropdown__icon")).toBeInTheDocument();
  });

  it("sets aria-expanded on trigger", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("sets aria-selected on focused option", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("closes on outside click", async () => {
    const { container } = render(DropdownTest, { props: { items } });
    const trigger = container.querySelector(".cy-dropdown__trigger")!;
    await fireEvent.click(trigger);
    expect(container.querySelector('[role="listbox"]')).toBeInTheDocument();
    await fireEvent.click(document.body);
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument();
  });
});
