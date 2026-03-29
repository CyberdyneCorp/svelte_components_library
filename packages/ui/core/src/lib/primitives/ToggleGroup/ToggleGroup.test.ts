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
});
