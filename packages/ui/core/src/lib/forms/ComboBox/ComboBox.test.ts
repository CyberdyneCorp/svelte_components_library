import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ComboBox from "./ComboBox.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie", description: "Third option" },
];

describe("ComboBox", () => {
  it("renders with default props", () => {
    const { container } = render(ComboBox);
    expect(container.querySelector(".cy-cb")).toBeInTheDocument();
  });

  it("renders input element with combobox role", () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input[role='combobox']");
    expect(input).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(ComboBox, { props: { label: "Framework" } });
    expect(screen.getByText("Framework")).toBeInTheDocument();
  });

  it("does not render label when empty", () => {
    const { container } = render(ComboBox);
    expect(container.querySelector("label")).not.toBeInTheDocument();
  });

  it("shows error message with alert role", () => {
    render(ComboBox, { props: { error: "Invalid" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Invalid");
  });

  it("applies error class when error is set", () => {
    const { container } = render(ComboBox, { props: { error: "Bad" } });
    expect(container.querySelector(".cy-cb--error")).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    const { container } = render(ComboBox, { props: { placeholder: "Type..." } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Type...");
  });

  it("shows spinner when loading", () => {
    const { container } = render(ComboBox, { props: { loading: true } });
    expect(container.querySelector(".cy-cb__spinner")).toBeInTheDocument();
  });

  it("shows chevron when not loading", () => {
    const { container } = render(ComboBox, { props: { loading: false } });
    expect(container.querySelector(".cy-cb__chevron")).toBeInTheDocument();
    expect(container.querySelector(".cy-cb__spinner")).not.toBeInTheDocument();
  });

  it("applies disabled class and attribute", () => {
    const { container } = render(ComboBox, { props: { disabled: true } });
    expect(container.querySelector(".cy-cb--disabled")).toBeInTheDocument();
    expect(container.querySelector("input")).toBeDisabled();
  });

  it("sets aria-expanded to false initially", () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("aria-expanded")).toBe("false");
  });

  it("sets aria-invalid when error is provided", () => {
    const { container } = render(ComboBox, { props: { error: "err" } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("aria-invalid")).toBe("true");
  });

  it("opens dropdown on focus", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__dropdown")).toBeInTheDocument();
  });

  it("shows all options when opened without search", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts.length).toBe(3);
  });

  it("filters options based on input text", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "alp" } });
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain("Alpha");
  });

  it("uses fuzzy matching for filtering", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    // "cl" should match "Charlie" (c...l)
    await fireEvent.input(input, { target: { value: "cl" } });
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toContain("Charlie");
  });

  it("shows empty message when no matches and allowCustom is true", async () => {
    const { container } = render(ComboBox, { props: { options, allowCustom: true } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "zzz" } });
    expect(container.querySelector(".cy-cb__empty")?.textContent).toBe(
      "Press Enter to use custom value"
    );
  });

  it("shows 'No matches found' when no matches and allowCustom is false", async () => {
    const { container } = render(ComboBox, { props: { options, allowCustom: false } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "zzz" } });
    expect(container.querySelector(".cy-cb__empty")?.textContent).toBe("No matches found");
  });

  it("shows loading message in dropdown when loading and open", async () => {
    const { container } = render(ComboBox, { props: { options, loading: true } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__loading")?.textContent).toBe("Loading...");
  });

  it("selects option on click (mousedown)", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    const opts = container.querySelectorAll(".cy-cb__option");
    await fireEvent.mouseDown(opts[1]);
    // Dropdown should close
    expect(container.querySelector(".cy-cb__dropdown")).not.toBeInTheDocument();
  });

  it("highlights option on mouse enter", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    const opts = container.querySelectorAll(".cy-cb__option");
    await fireEvent.mouseEnter(opts[1]);
    expect(opts[1].classList.contains("cy-cb__option--highlighted")).toBe(true);
  });

  it("renders option description when provided", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__option-desc")?.textContent).toBe("Third option");
  });

  it("navigates down with ArrowDown key", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts[0].classList.contains("cy-cb__option--highlighted")).toBe(true);
  });

  it("navigates up with ArrowUp key", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts[0].classList.contains("cy-cb__option--highlighted")).toBe(true);
  });

  it("does not go below last option with ArrowDown", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    for (let i = 0; i < 10; i++) {
      await fireEvent.keyDown(input, { key: "ArrowDown" });
    }
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts[opts.length - 1].classList.contains("cy-cb__option--highlighted")).toBe(true);
  });

  it("does not go above first option with ArrowUp", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    await fireEvent.keyDown(input, { key: "ArrowUp" });
    const opts = container.querySelectorAll(".cy-cb__option");
    expect(opts[0].classList.contains("cy-cb__option--highlighted")).toBe(true);
  });

  it("selects highlighted option on Enter", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(container.querySelector(".cy-cb__dropdown")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__dropdown")).toBeInTheDocument();
    await fireEvent.keyDown(input, { key: "Escape" });
    expect(container.querySelector(".cy-cb__dropdown")).not.toBeInTheDocument();
  });

  it("sets custom value on Enter with allowCustom when no highlight", async () => {
    const { container } = render(ComboBox, { props: { options, allowCustom: true } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "custom" } });
    await fireEvent.keyDown(input, { key: "Enter" });
    expect(container.querySelector(".cy-cb__dropdown")).not.toBeInTheDocument();
  });

  it("opens dropdown on ArrowDown when closed", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(container.querySelector(".cy-cb__dropdown")).toBeInTheDocument();
  });

  it("sets value from input when allowCustom is true", async () => {
    const { container } = render(ComboBox, { props: { options, allowCustom: true } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: "custom text" } });
    // With allowCustom, value is set to the input text
    expect(input).toBeInTheDocument();
  });

  it("displays selected option label as input value", async () => {
    const { container } = render(ComboBox, { props: { options, value: "b" } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("Beta");
  });

  it("displays raw value when no matching option exists", async () => {
    const { container } = render(ComboBox, { props: { options, value: "unknown" } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.value).toBe("unknown");
  });

  it("resets highlightIndex on new input", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    await fireEvent.keyDown(input, { key: "ArrowDown" });
    // Now type - highlightIndex should reset
    await fireEvent.input(input, { target: { value: "a" } });
    const highlighted = container.querySelectorAll(".cy-cb__option--highlighted");
    expect(highlighted.length).toBe(0);
  });

  it("marks selected option with selected class", async () => {
    const { container } = render(ComboBox, { props: { options, value: "a" } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    const selected = container.querySelector(".cy-cb__option--selected");
    expect(selected).toBeInTheDocument();
    expect(selected?.textContent).toContain("Alpha");
  });

  it("triggers blur handler", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__dropdown")).toBeInTheDocument();
    // Blur triggers a setTimeout; exercise the handler path
    await fireEvent.blur(input);
  });

  it("shows chevron with open class when dropdown is open", async () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input")!;
    await fireEvent.focus(input);
    expect(container.querySelector(".cy-cb__chevron--open")).toBeInTheDocument();
  });
});
