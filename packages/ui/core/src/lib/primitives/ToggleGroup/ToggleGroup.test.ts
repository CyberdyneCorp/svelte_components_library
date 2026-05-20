import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ToggleGroup from "./ToggleGroup.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

describe("ToggleGroup", () => {
  it("renders with default props", () => {
    const { container } = render(ToggleGroup);
    const group = container.querySelector("[role='radiogroup']");
    expect(group).toBeInTheDocument();
  });

  it("renders all options as radio buttons", () => {
    render(ToggleGroup, { props: { options } });
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("marks the selected option as checked", () => {
    render(ToggleGroup, { props: { options, value: "b" } });
    const radios = screen.getAllByRole("radio");
    expect(radios[1].getAttribute("aria-checked")).toBe("true");
  });

  it("calls onchange when an option is clicked", async () => {
    const onchange = vi.fn();
    render(ToggleGroup, { props: { options, onchange } });
    const radios = screen.getAllByRole("radio");
    await fireEvent.click(radios[2]);
    expect(onchange).toHaveBeenCalledWith("c");
  });

  it("multiple mode renders checkboxes and uses a group role", () => {
    const { container } = render(ToggleGroup, {
      props: { options, multiple: true, value: ["a"] },
    });
    expect(container.querySelector("[role='group']")).toBeInTheDocument();
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes).toHaveLength(3);
    expect(boxes[0].getAttribute("aria-checked")).toBe("true");
  });

  it("multiple mode toggles values into a string[] via onchange", async () => {
    const onchange = vi.fn();
    render(ToggleGroup, {
      props: { options, multiple: true, value: ["a"], onchange },
    });
    const boxes = screen.getAllByRole("checkbox");
    await fireEvent.click(boxes[1]); // add "b"
    expect(onchange).toHaveBeenCalledWith(["a", "b"]);
  });

  it("multiple mode removes an already-selected value", async () => {
    const onchange = vi.fn();
    render(ToggleGroup, {
      props: { options, multiple: true, value: ["a", "b"], onchange },
    });
    const boxes = screen.getAllByRole("checkbox");
    await fireEvent.click(boxes[0]); // remove "a"
    expect(onchange).toHaveBeenCalledWith(["b"]);
  });
});
