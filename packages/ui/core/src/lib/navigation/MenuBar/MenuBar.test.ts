import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MenuBar from "./MenuBar.svelte";

const menus = [
  {
    label: "File",
    items: [
      { label: "New", action: "file.new", shortcut: "Ctrl+N" },
      { label: "Save", action: "file.save", shortcut: "Ctrl+S" },
      { label: "", separator: true },
      { label: "Close", action: "file.close" },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", action: "edit.undo", shortcut: "Ctrl+Z" },
      { label: "Disabled Action", action: "edit.disabled", disabled: true },
    ],
  },
];

describe("MenuBar", () => {
  it("renders the menubar", () => {
    render(MenuBar, { props: { menus } });
    expect(screen.getByRole("menubar")).toBeInTheDocument();
  });

  it("displays menu labels", () => {
    render(MenuBar, { props: { menus } });
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("toggles dropdown on click", async () => {
    render(MenuBar, { props: { menus } });
    const fileBtn = screen.getByText("File");
    expect(screen.queryByText("New")).not.toBeInTheDocument();
    await fireEvent.click(fileBtn);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("displays shortcuts", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("Ctrl+N")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+S")).toBeInTheDocument();
  });

  it("renders disabled items", async () => {
    render(MenuBar, { props: { menus } });
    await fireEvent.click(screen.getByText("Edit"));
    const disabledItem = screen.getByText("Disabled Action");
    expect(disabledItem.closest("button")).toBeDisabled();
  });
});
