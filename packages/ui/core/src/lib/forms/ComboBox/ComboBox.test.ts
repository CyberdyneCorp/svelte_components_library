import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ComboBox from "./ComboBox.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("ComboBox", () => {
  it("renders with default props", () => {
    const { container } = render(ComboBox);
    const wrapper = container.querySelector(".cy-cb");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders input element", () => {
    const { container } = render(ComboBox, { props: { options } });
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const { container } = render(ComboBox, { props: { label: "Framework" } });
    const label = container.querySelector("label");
    expect(label?.textContent).toContain("Framework");
  });

  it("shows error message", () => {
    const { container } = render(ComboBox, { props: { error: "Invalid" } });
    const error = container.querySelector("[role='alert']");
    expect(error?.textContent).toBe("Invalid");
  });

  it("applies placeholder", () => {
    const { container } = render(ComboBox, { props: { placeholder: "Type..." } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Type...");
  });
});
