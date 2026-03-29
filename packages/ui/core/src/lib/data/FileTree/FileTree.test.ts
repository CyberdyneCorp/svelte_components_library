import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import FileTree from "./FileTree.svelte";

const items = [
  {
    name: "src",
    type: "folder" as const,
    children: [
      { name: "index.ts", type: "file" as const },
    ],
  },
  { name: "README.md", type: "file" as const },
];

describe("FileTree", () => {
  it("renders with tree role", () => {
    render(FileTree, { props: { items } });
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });

  it("renders file and folder names", () => {
    render(FileTree, { props: { items } });
    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();
  });

  it("expands folder on click", async () => {
    render(FileTree, { props: { items } });
    await fireEvent.click(screen.getByText("src"));
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("calls onselect when item is clicked", async () => {
    const onselect = vi.fn();
    render(FileTree, { props: { items, onselect } });
    await fireEvent.click(screen.getByText("README.md"));
    expect(onselect).toHaveBeenCalledWith("README.md");
  });

  it("renders tree items with treeitem role", () => {
    render(FileTree, { props: { items } });
    const treeItems = screen.getAllByRole("treeitem");
    expect(treeItems.length).toBe(2);
  });
});
