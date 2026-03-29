import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import SortableList from "./SortableList.svelte";

describe("SortableList", () => {
  it("renders the list container", () => {
    const { container } = render(SortableList, { props: { items: [] } });
    expect(container.querySelector(".cy-sortable-list")).toBeInTheDocument();
  });

  it("has listbox role", () => {
    render(SortableList, { props: { items: [] } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(SortableList, { props: { items: [] } });
    expect(screen.getByLabelText("Sortable list")).toBeInTheDocument();
  });

  it("applies disabled class when disabled", () => {
    const { container } = render(SortableList, {
      props: { items: [], disabled: true },
    });
    expect(container.querySelector(".cy-sortable-list--disabled")).toBeInTheDocument();
  });

  it("renders empty list without items", () => {
    render(SortableList, { props: { items: [] } });
    const options = screen.queryAllByRole("option");
    expect(options.length).toBe(0);
  });
});
