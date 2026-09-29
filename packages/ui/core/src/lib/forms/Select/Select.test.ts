import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Select from "./Select.svelte";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("Select", () => {
  it("renders with default props", () => {
    const { container } = render(Select);
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
  });

  it("renders options", () => {
    const { container } = render(Select, { props: { options } });
    const opts = container.querySelectorAll("option");
    // includes placeholder option + 2 options
    expect(opts.length).toBeGreaterThanOrEqual(2);
  });

  it("renders label when provided", () => {
    render(Select, { props: { label: "Country" } });
    const label = screen.getByText("Country");
    expect(label).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(Select, { props: { error: "Please select" } });
    const error = screen.getByRole("alert");
    expect(error.textContent).toBe("Please select");
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(Select, { props: { disabled: true } });
    const select = container.querySelector("select");
    expect(select).toBeDisabled();
  });

  describe("placeholder", () => {
    it("renders the default hidden placeholder, selected while value is empty", () => {
      const { container } = render(Select, { props: { options } });
      const select = container.querySelector("select") as HTMLSelectElement;
      const first = select.options[0];
      expect(select.options).toHaveLength(3);
      expect(first.textContent).toBe("Select an option...");
      expect(first.value).toBe("");
      expect(first.hidden).toBe(true);
      expect(first.disabled).toBe(true);
      expect(select.selectedIndex).toBe(0);
    });

    it("renders a custom placeholder", () => {
      const { container } = render(Select, { props: { options, placeholder: "Pick one" } });
      expect(container.querySelector("option")?.textContent).toBe("Pick one");
    });

    it("renders only the options with placeholder={null}", () => {
      const { container } = render(Select, { props: { options, placeholder: null, value: "b" } });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect([...select.options].map((o) => o.value)).toEqual(["a", "b"]);
      expect(select.value).toBe("b");
      expect(container.querySelector("option[hidden]")).toBeNull();
    });

    it("selects the matching option, not the placeholder, when value is set", () => {
      const { container } = render(Select, { props: { options, value: "b" } });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("b");
      expect(select.querySelector("option:checked")?.textContent).toBe("Beta");
    });

    it("skips the placeholder when options already contain an empty value", () => {
      const withAll = [{ value: "", label: "All" }, ...options];
      const { container } = render(Select, { props: { options: withAll } });
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.options).toHaveLength(3);
      expect(select.querySelector("option:checked")?.textContent).toBe("All");
      expect(container.querySelector("option[hidden]")).toBeNull();
    });
  });

  describe("attributes", () => {
    it("forwards id and links the label to it", () => {
      render(Select, { props: { options, id: "country", label: "Country" } });
      const select = screen.getByLabelText("Country");
      expect(select).toHaveAttribute("id", "country");
    });

    it("uses ariaLabel as the accessible name without a visible label", () => {
      render(Select, { props: { options, ariaLabel: "Category" } });
      expect(screen.getByRole("combobox", { name: "Category" })).toBeInTheDocument();
    });

    it("prefers the visible label over ariaLabel", () => {
      render(Select, { props: { options, label: "Country", ariaLabel: "Ignored" } });
      expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-label");
    });

    it("forwards data-* attributes to the native select", () => {
      render(Select, { props: { options, "data-testid": "row-category" } });
      expect(screen.getByTestId("row-category").tagName).toBe("SELECT");
    });
  });
});
