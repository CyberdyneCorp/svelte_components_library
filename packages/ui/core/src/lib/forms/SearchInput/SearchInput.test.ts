import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import SearchInput from "./SearchInput.svelte";

describe("SearchInput", () => {
  it("renders with default props", () => {
    const { container } = render(SearchInput);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
  });

  it("has combobox role", () => {
    const { container } = render(SearchInput);
    const input = container.querySelector("[role='combobox']");
    expect(input).toBeInTheDocument();
  });

  it("applies placeholder", () => {
    const { container } = render(SearchInput, { props: { placeholder: "Search..." } });
    const input = container.querySelector("input");
    expect(input?.getAttribute("placeholder")).toBe("Search...");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(SearchInput, { props: { disabled: true } });
    const input = container.querySelector("input");
    expect(input).toBeDisabled();
  });
});
