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
});
