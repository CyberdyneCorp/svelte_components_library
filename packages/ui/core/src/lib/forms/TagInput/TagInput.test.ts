import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import TagInput from "./TagInput.svelte";

describe("TagInput", () => {
  it("renders with default props", () => {
    const { container } = render(TagInput);
    const wrapper = container.querySelector(".cy-ti");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(TagInput, { props: { label: "Tags" } });
    const label = screen.getByText("Tags");
    expect(label).toBeInTheDocument();
  });

  it("renders existing tags", () => {
    const { container } = render(TagInput, { props: { tags: ["foo", "bar"] } });
    expect(container.textContent).toContain("foo");
    expect(container.textContent).toContain("bar");
  });

  it("shows error message", () => {
    const { container } = render(TagInput, { props: { error: "Too many" } });
    const error = container.querySelector("[role='alert']");
    expect(error?.textContent).toBe("Too many");
  });

  it("renders input with placeholder", () => {
    render(TagInput, { props: { placeholder: "Add a tag..." } });
    const input = screen.getByPlaceholderText("Add a tag...");
    expect(input).toBeInTheDocument();
  });
});
