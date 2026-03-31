import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import MultiSelect from "./MultiSelect.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];

const groupedOptions = [
  { value: "a", label: "Alpha", group: "Group A" },
  { value: "b", label: "Beta", group: "Group A" },
  { value: "c", label: "Charlie", group: "Group B" },
];

describe("MultiSelect", () => {
  it("renders with default props", () => {
    const { container } = render(MultiSelect);
    expect(container.querySelector(".cy-ms")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(MultiSelect, { props: { options, label: "Items" } });
    expect(screen.getByText("Items")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(MultiSelect);
    expect(container.querySelector(".cy-ms__label")).not.toBeInTheDocument();
  });

  it("shows error message with alert role", () => {
    render(MultiSelect, { props: { error: "Required" } });
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("applies error class", () => {
    const { container } = render(MultiSelect, { props: { error: "err" } });
    expect(container.querySelector(".cy-ms--error")).toBeInTheDocument();
  });

  it("applies disabled class", () => {
    const { container } = render(MultiSelect, { props: { disabled: true } });
    expect(container.querySelector(".cy-ms--disabled")).toBeInTheDocument();
  });

  it("shows placeholder when no items selected and not searchable", () => {
    const { container } = render(MultiSelect, {
      props: { options, searchable: false, placeholder: "Pick items" },
    });
    expect(container.querySelector(".cy-ms__placeholder")?.textContent).toBe("Pick items");
  });

  it("renders search input when searchable", () => {
    const { container } = render(MultiSelect, { props: { options, searchable: true } });
    expect(container.querySelector(".cy-ms__search")).toBeInTheDocument();
  });

  it("does not render search input when not searchable", () => {
    const { container } = render(MultiSelect, { props: { options, searchable: false } });
    expect(container.querySelector(".cy-ms__search")).not.toBeInTheDocument();
  });

  it("opens dropdown on click", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(container.querySelector(".cy-ms__dropdown")).toBeInTheDocument();
  });

  it("does not open dropdown when disabled", async () => {
    const { container } = render(MultiSelect, { props: { options, disabled: true } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(container.querySelector(".cy-ms__dropdown")).not.toBeInTheDocument();
  });

  it("shows all options in dropdown", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const opts = container.querySelectorAll(".cy-ms__option");
    expect(opts.length).toBe(3);
  });

  it("toggles selection on option click", async () => {
    const { container } = render(MultiSelect, { props: { options, selected: [] } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const opts = container.querySelectorAll(".cy-ms__option");
    await fireEvent.click(opts[0]);
    expect(container.querySelector(".cy-ms__tag")).toBeInTheDocument();
  });

  it("deselects on second click", async () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["a"] } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const opts = container.querySelectorAll(".cy-ms__option");
    await fireEvent.click(opts[0]);
    const tags = container.querySelectorAll(".cy-ms__tag");
    expect(tags.length).toBe(0);
  });

  it("renders selected tags", () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["a", "b"] } });
    const tags = container.querySelectorAll(".cy-ms__tag");
    expect(tags.length).toBe(2);
  });

  it("shows count badge in label when items selected", () => {
    const { container } = render(MultiSelect, {
      props: { options, selected: ["a", "b"], label: "Items" },
    });
    expect(container.querySelector(".cy-ms__count")?.textContent).toBe("2");
  });

  it("removes tag on tag remove button click", async () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["a", "b"] } });
    const removeButtons = container.querySelectorAll(".cy-ms__tag-remove");
    await fireEvent.click(removeButtons[0]);
    const tags = container.querySelectorAll(".cy-ms__tag");
    expect(tags.length).toBe(1);
  });

  it("respects maxItems limit", async () => {
    const { container } = render(MultiSelect, {
      props: { options, selected: ["a", "b"], maxItems: 2 },
    });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(container.querySelector(".cy-ms__limit-warn")).toBeInTheDocument();
  });

  it("shows limit warning message", async () => {
    const { container } = render(MultiSelect, {
      props: { options, selected: ["a", "b"], maxItems: 2 },
    });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(container.querySelector(".cy-ms__limit-warn")?.textContent).toBe(
      "Maximum 2 items selected"
    );
  });

  it("disables unselected options when at limit", async () => {
    const { container } = render(MultiSelect, {
      props: { options, selected: ["a", "b"], maxItems: 2 },
    });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const disabled = container.querySelectorAll(".cy-ms__option--disabled");
    expect(disabled.length).toBe(1);
  });

  it("filters options based on search", async () => {
    const { container } = render(MultiSelect, { props: { options, searchable: true } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const searchInput = container.querySelector(".cy-ms__search") as HTMLInputElement;
    await fireEvent.input(searchInput, { target: { value: "al" } });
    const opts = container.querySelectorAll(".cy-ms__option");
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain("Alpha");
  });

  it("shows empty message when no options match filter", async () => {
    const { container } = render(MultiSelect, { props: { options, searchable: true } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const searchInput = container.querySelector(".cy-ms__search") as HTMLInputElement;
    await fireEvent.input(searchInput, { target: { value: "zzz" } });
    expect(container.querySelector(".cy-ms__empty")?.textContent).toBe("No options found");
  });

  it("renders group headers", async () => {
    const { container } = render(MultiSelect, { props: { options: groupedOptions } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const headers = container.querySelectorAll(".cy-ms__group-header");
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toBe("Group A");
    expect(headers[1].textContent).toBe("Group B");
  });

  it("opens dropdown on Enter key", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.keyDown(control, { key: "Enter" });
    expect(container.querySelector(".cy-ms__dropdown")).toBeInTheDocument();
  });

  it("opens dropdown on Space key", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.keyDown(control, { key: " " });
    expect(container.querySelector(".cy-ms__dropdown")).toBeInTheDocument();
  });

  it("opens dropdown on ArrowDown key when closed", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.keyDown(control, { key: "ArrowDown" });
    expect(container.querySelector(".cy-ms__dropdown")).toBeInTheDocument();
  });

  it("navigates with ArrowDown when open", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    await fireEvent.keyDown(control, { key: "ArrowDown" });
    const highlighted = container.querySelector(".cy-ms__option--highlighted");
    expect(highlighted).toBeInTheDocument();
  });

  it("navigates with ArrowUp when open", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    await fireEvent.keyDown(control, { key: "ArrowDown" });
    await fireEvent.keyDown(control, { key: "ArrowDown" });
    await fireEvent.keyDown(control, { key: "ArrowUp" });
    const highlighted = container.querySelector(".cy-ms__option--highlighted");
    expect(highlighted?.textContent).toContain("Alpha");
  });

  it("selects highlighted option on Enter", async () => {
    const { container } = render(MultiSelect, { props: { options, selected: [] } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    await fireEvent.keyDown(control, { key: "ArrowDown" });
    await fireEvent.keyDown(control, { key: "Enter" });
    expect(container.querySelector(".cy-ms__tag")).toBeInTheDocument();
  });

  it("closes dropdown on Escape", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(container.querySelector(".cy-ms__dropdown")).toBeInTheDocument();
    await fireEvent.keyDown(control, { key: "Escape" });
    expect(container.querySelector(".cy-ms__dropdown")).not.toBeInTheDocument();
  });

  it("removes last selected on Backspace with empty search", async () => {
    const { container } = render(MultiSelect, {
      props: { options, selected: ["a", "b"], searchable: true },
    });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    await fireEvent.keyDown(control, { key: "Backspace" });
    const tags = container.querySelectorAll(".cy-ms__tag");
    expect(tags.length).toBe(1);
  });

  it("shows checkbox checked for selected items", async () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["a"] } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const checked = container.querySelectorAll(".cy-ms__checkbox--checked");
    expect(checked.length).toBe(1);
  });

  it("highlights option on mouse enter", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    const opts = container.querySelectorAll(".cy-ms__option");
    await fireEvent.mouseEnter(opts[1]);
    expect(opts[1].classList.contains("cy-ms__option--highlighted")).toBe(true);
  });

  it("sets aria-expanded on control", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    expect(control.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(control);
    expect(control.getAttribute("aria-expanded")).toBe("true");
  });

  it("applies open class to control when dropdown is open", async () => {
    const { container } = render(MultiSelect, { props: { options } });
    const control = container.querySelector(".cy-ms__control")!;
    await fireEvent.click(control);
    expect(control.classList.contains("cy-ms__control--open")).toBe(true);
  });

  it("resolves label for selected values", () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["a"] } });
    const tag = container.querySelector(".cy-ms__tag");
    expect(tag?.textContent).toContain("Alpha");
  });

  it("falls back to value when label not found", () => {
    const { container } = render(MultiSelect, { props: { options, selected: ["unknown"] } });
    const tag = container.querySelector(".cy-ms__tag");
    expect(tag?.textContent).toContain("unknown");
  });
});
