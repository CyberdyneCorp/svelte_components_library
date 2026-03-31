import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import SearchInput from "./SearchInput.svelte";

const results = [
  { id: "1", label: "Apple", description: "A fruit" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry", icon: "🍒" },
];

const groupedResults = [
  { id: "1", label: "Apple", group: "Fruits" },
  { id: "2", label: "Banana", group: "Fruits" },
  { id: "3", label: "Carrot", group: "Vegetables" },
];

describe("SearchInput", () => {
  it("renders with default props", () => {
    const { container } = render(SearchInput);
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("has combobox role", () => {
    const { container } = render(SearchInput);
    expect(container.querySelector("[role='combobox']")).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    const { container } = render(SearchInput, { props: { placeholder: "Search..." } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Search...");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(SearchInput, { props: { disabled: true } });
    expect(container.querySelector("input")).toBeDisabled();
  });

  it("applies disabled class", () => {
    const { container } = render(SearchInput, { props: { disabled: true } });
    expect(container.querySelector(".cy-search--disabled")).toBeInTheDocument();
  });

  it("does not show clear button when value is empty", () => {
    const { container } = render(SearchInput, { props: { value: "" } });
    expect(container.querySelector(".cy-search__clear")).not.toBeInTheDocument();
  });

  it("shows clear button when value is non-empty", () => {
    const { container } = render(SearchInput, { props: { value: "test" } });
    expect(container.querySelector(".cy-search__clear")).toBeInTheDocument();
  });

  it("clears value on clear button click", async () => {
    const onquery = vi.fn();
    const { container } = render(SearchInput, {
      props: { value: "test", onquery },
    });
    const clearBtn = container.querySelector(".cy-search__clear")!;
    await fireEvent.click(clearBtn);
    expect(onquery).toHaveBeenCalledWith("");
  });

  it("fires onquery after debounce on input", async () => {
    vi.useFakeTimers();
    const onquery = vi.fn();
    const { container } = render(SearchInput, {
      props: { onquery, debounce: 200 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "test" } });
    expect(onquery).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(onquery).toHaveBeenCalledWith("test");
    vi.useRealTimers();
  });

  it("debounces multiple inputs", async () => {
    vi.useFakeTimers();
    const onquery = vi.fn();
    const { container } = render(SearchInput, {
      props: { onquery, debounce: 300 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(100);
    await fireEvent.input(input, { target: { value: "ab" } });
    vi.advanceTimersByTime(100);
    await fireEvent.input(input, { target: { value: "abc" } });
    vi.advanceTimersByTime(300);
    expect(onquery).toHaveBeenCalledTimes(1);
    expect(onquery).toHaveBeenCalledWith("abc");
    vi.useRealTimers();
  });

  it("opens dropdown on input when results exist", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__dropdown")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows results in dropdown", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    const items = container.querySelectorAll(".cy-search__result");
    expect(items.length).toBe(3);
    vi.useRealTimers();
  });

  it("shows loading state", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { loading: true, results: [], debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__loading")).toBeInTheDocument();
    expect(container.textContent).toContain("Searching...");
    vi.useRealTimers();
  });

  it("shows empty state when no results and value is non-empty", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results: [], debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "xyz" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__empty")).toBeInTheDocument();
    expect(container.textContent).toContain('No results for "xyz"');
    vi.useRealTimers();
  });

  it("selects result on click", async () => {
    vi.useFakeTimers();
    const onselect = vi.fn();
    const { container } = render(SearchInput, {
      props: { results, onselect, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    const items = container.querySelectorAll(".cy-search__result");
    await fireEvent.click(items[0]);
    expect(onselect).toHaveBeenCalledWith({ id: "1", label: "Apple" });
    vi.useRealTimers();
  });

  it("closes dropdown after selecting result", async () => {
    vi.useFakeTimers();
    const onselect = vi.fn();
    const { container } = render(SearchInput, {
      props: { results, onselect, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    const items = container.querySelectorAll(".cy-search__result");
    await fireEvent.click(items[0]);
    expect(container.querySelector(".cy-search__dropdown")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("navigates down with ArrowDown", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const active = container.querySelector(".cy-search__result--active");
    expect(active).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("navigates up with ArrowUp", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    const active = container.querySelector(".cy-search__result--active");
    expect(active?.textContent).toContain("Apple");
    vi.useRealTimers();
  });

  it("selects on Enter with active result", async () => {
    vi.useFakeTimers();
    const onselect = vi.fn();
    const { container } = render(SearchInput, {
      props: { results, onselect, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(onselect).toHaveBeenCalledWith({ id: "1", label: "Apple" });
    vi.useRealTimers();
  });

  it("closes dropdown on Escape", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__dropdown")).toBeInTheDocument();
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(container.querySelector(".cy-search__dropdown")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("opens dropdown on focus when value is non-empty", async () => {
    const { container } = render(SearchInput, {
      props: { results, value: "test" },
    });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-search__dropdown")).toBeInTheDocument();
  });

  it("does not open dropdown on focus when value is empty", async () => {
    const { container } = render(SearchInput, {
      props: { results, value: "" },
    });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-search__dropdown")).not.toBeInTheDocument();
  });

  it("renders result descriptions", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__result-desc")?.textContent).toBe("A fruit");
    vi.useRealTimers();
  });

  it("renders result icons", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(container.querySelector(".cy-search__result-icon")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders group headers", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results: groupedResults, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    const headers = container.querySelectorAll(".cy-search__group-header");
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toBe("Fruits");
    expect(headers[1].textContent).toBe("Vegetables");
    vi.useRealTimers();
  });

  it("highlights active result on mouse enter", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    const items = container.querySelectorAll(".cy-search__result");
    await fireEvent.mouseEnter(items[1]);
    expect(items[1].classList.contains("cy-search__result--active")).toBe(true);
    vi.useRealTimers();
  });

  it("respects showResults prop override", () => {
    const { container } = render(SearchInput, {
      props: { showResults: true, results },
    });
    expect(container.querySelector(".cy-search__dropdown")).toBeInTheDocument();
  });

  it("sets aria-expanded based on results visibility", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    vi.useRealTimers();
  });

  it("clear button has aria-label", () => {
    const { container } = render(SearchInput, { props: { value: "test" } });
    const btn = container.querySelector(".cy-search__clear");
    expect(btn?.getAttribute("aria-label")).toBe("Clear search");
  });

  it("resets activeIndex on new input", async () => {
    vi.useFakeTimers();
    const { container } = render(SearchInput, {
      props: { results, debounce: 0 },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "a" } });
    vi.advanceTimersByTime(0);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.input(input, { target: { value: "ab" } });
    vi.advanceTimersByTime(0);
    const active = container.querySelectorAll(".cy-search__result--active");
    expect(active.length).toBe(0);
    vi.useRealTimers();
  });
});
