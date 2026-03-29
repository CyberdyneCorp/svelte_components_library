import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MultiSelect from "./MultiSelect.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

describe("MultiSelect", () => {
  it("renders with default props", () => {
    const { container } = render(MultiSelect);
    const wrapper = container.querySelector(".cy-ms");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    const { container } = render(MultiSelect, { props: { options, label: "Tags" } });
    const label = container.querySelector("label");
    expect(label?.textContent).toContain("Tags");
  });

  it("shows error message", () => {
    const { container } = render(MultiSelect, { props: { error: "Pick at least one" } });
    const error = container.querySelector("[role='alert']");
    expect(error?.textContent).toBe("Pick at least one");
  });

  it("renders with options provided", () => {
    const { container } = render(MultiSelect, { props: { options } });
    const wrapper = container.querySelector(".cy-ms");
    expect(wrapper).toBeInTheDocument();
  });
});
