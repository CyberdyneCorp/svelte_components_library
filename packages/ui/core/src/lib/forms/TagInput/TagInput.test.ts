import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import TagInput from "./TagInput.svelte";

describe("TagInput", () => {
  it("renders with default props", () => {
    const { container } = render(TagInput);
    expect(container.querySelector(".cy-ti")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(TagInput, { props: { label: "Tags" } });
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(TagInput);
    expect(container.querySelector(".cy-ti__label")).not.toBeInTheDocument();
  });

  it("renders existing tags", () => {
    const { container } = render(TagInput, { props: { tags: ["foo", "bar"] } });
    expect(container.textContent).toContain("foo");
    expect(container.textContent).toContain("bar");
  });

  it("shows error message with alert role", () => {
    render(TagInput, { props: { error: "Too many" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Too many");
  });

  it("applies error class when error is set", () => {
    const { container } = render(TagInput, { props: { error: "err" } });
    expect(container.querySelector(".cy-ti--error")).toBeInTheDocument();
  });

  it("applies disabled class", () => {
    const { container } = render(TagInput, { props: { disabled: true } });
    expect(container.querySelector(".cy-ti--disabled")).toBeInTheDocument();
  });

  it("renders input with placeholder when no tags", () => {
    render(TagInput, { props: { placeholder: "Add a tag..." } });
    expect(screen.getByPlaceholderText("Add a tag...")).toBeInTheDocument();
  });

  it("renders input with empty placeholder when tags exist", () => {
    const { container } = render(TagInput, { props: { tags: ["foo"], placeholder: "Add..." } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("");
  });

  it("adds tag on Enter key", async () => {
    const { container } = render(TagInput, { props: { tags: [] } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "newTag" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(container.textContent).toContain("newTag");
  });

  it("adds tag on comma key", async () => {
    const { container } = render(TagInput, { props: { tags: [] } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "commaTag" } });
    await fireEvent.keyDown(input, { key: "," });
    expect(container.textContent).toContain("commaTag");
  });

  it("does not add empty tags", async () => {
    const { container } = render(TagInput, { props: { tags: ["existing"] } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "   " } });
    await fireEvent.keyDown(input, { key: "Enter" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(1);
  });

  it("does not add duplicate tags", async () => {
    const { container } = render(TagInput, { props: { tags: ["foo"] } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "foo" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(1);
  });

  it("respects maxTags limit", async () => {
    const { container } = render(TagInput, { props: { tags: ["a", "b"], maxTags: 2 } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "c" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(2);
  });

  it("shows counter when maxTags is set", () => {
    const { container } = render(TagInput, { props: { tags: ["a"], maxTags: 5 } });
    expect(container.querySelector(".cy-ti__counter")?.textContent).toBe("1/5");
  });

  it("does not show counter when maxTags is 0", () => {
    const { container } = render(TagInput, { props: { tags: ["a"], maxTags: 0 } });
    expect(container.querySelector(".cy-ti__counter")).not.toBeInTheDocument();
  });

  it("removes last tag on Backspace with empty input", async () => {
    const { container } = render(TagInput, { props: { tags: ["a", "b", "c"] } });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "Backspace" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(2);
  });

  it("does not remove tag on Backspace when input has text", async () => {
    const { container } = render(TagInput, { props: { tags: ["a", "b"] } });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "x" } });
    await fireEvent.keyDown(input, { key: "Backspace" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(2);
  });

  it("removes specific tag on remove button click", async () => {
    const { container } = render(TagInput, { props: { tags: ["a", "b", "c"] } });
    const removeButtons = container.querySelectorAll(".cy-ti__tag-remove");
    await fireEvent.click(removeButtons[1]); // Remove "b"
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(2);
    expect(container.textContent).not.toContain("×b"); // "b" should be gone
  });

  it("remove button has aria-label", () => {
    const { container } = render(TagInput, { props: { tags: ["hello"] } });
    const btn = container.querySelector(".cy-ti__tag-remove");
    expect(btn?.getAttribute("aria-label")).toBe("Remove hello");
  });

  it("closes suggestions on Escape key", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "banana"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(container.querySelector(".cy-ti__suggestions")).not.toBeInTheDocument();
  });

  it("navigates suggestions with ArrowDown", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const highlighted = container.querySelector(".cy-ti__suggestion--highlighted");
    expect(highlighted).toBeInTheDocument();
  });

  it("navigates suggestions with ArrowUp", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    const highlighted = container.querySelector(".cy-ti__suggestion--highlighted");
    expect(highlighted?.textContent).toBe("apple");
  });

  it("selects suggestion on Enter when highlighted", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(container.textContent).toContain("apple");
  });

  it("selects suggestion on click", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    const suggestion = container.querySelector(".cy-ti__suggestion");
    if (suggestion) await fireEvent.click(suggestion);
    expect(container.textContent).toContain("apple");
  });

  it("filters out already-added tags from suggestions", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: ["apple"] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    const suggestions = container.querySelectorAll(".cy-ti__suggestion");
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].textContent).toBe("apricot");
  });

  it("does not allow custom tags when allowCustom is false", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple"], tags: [], allowCustom: false },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "custom" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    const tags = container.querySelectorAll(".cy-ti__tag");
    expect(tags.length).toBe(0);
  });

  it("allows suggestion tags when allowCustom is false", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple"], tags: [], allowCustom: false },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "apple" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(container.textContent).toContain("apple");
  });

  it("highlights suggestion on mouse enter", async () => {
    const { container } = render(TagInput, {
      props: { suggestions: ["apple", "apricot"], tags: [] },
    });
    const input = container.querySelector("input")!;
    await fireEvent.input(input, { target: { value: "ap" } });
    const suggestions = container.querySelectorAll(".cy-ti__suggestion");
    await fireEvent.mouseEnter(suggestions[1]);
    expect(suggestions[1].classList.contains("cy-ti__suggestion--highlighted")).toBe(true);
  });

  it("clears input after adding tag", async () => {
    const { container } = render(TagInput, { props: { tags: [] } });
    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "newTag" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    // Input should be cleared after adding
    expect(input.value).toBe("");
  });
});
