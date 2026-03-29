import { render } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import InformationPill from "./InformationPill.svelte";

describe("InformationPill", () => {
  it("renders with default props", () => {
    const { container } = render(InformationPill);
    const pill = container.querySelector(".cy-info-pill");
    expect(pill).toBeInTheDocument();
  });

  it("displays label and value", () => {
    const { container } = render(InformationPill, { props: { label: "Status", value: "Active" } });
    const labelEl = container.querySelector(".cy-info-pill__label");
    const valueEl = container.querySelector(".cy-info-pill__value");
    expect(labelEl?.textContent).toBe("Status");
    expect(valueEl?.textContent).toBe("Active");
  });

  it("applies variant class", () => {
    const { container } = render(InformationPill, { props: { variant: "brand" } });
    const pill = container.querySelector(".cy-info-pill");
    expect(pill?.className).toContain("brand");
  });

  it("renders as inline element", () => {
    const { container } = render(InformationPill);
    const pill = container.querySelector("span.cy-info-pill");
    expect(pill).toBeInTheDocument();
  });
});
