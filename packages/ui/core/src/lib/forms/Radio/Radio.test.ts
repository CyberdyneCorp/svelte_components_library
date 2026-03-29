import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Radio from "./Radio.svelte";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
];

describe("Radio", () => {
  it("renders with default props", () => {
    const { container } = render(Radio);
    const fieldset = container.querySelector("fieldset");
    expect(fieldset).toBeInTheDocument();
  });

  it("renders all radio options", () => {
    render(Radio, { props: { options } });
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("renders legend when label is provided", () => {
    render(Radio, { props: { options, label: "Choose one" } });
    const legend = screen.getByText("Choose one");
    expect(legend).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(Radio, { props: { options, error: "Required" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Required");
  });
});
