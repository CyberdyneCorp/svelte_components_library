import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import Switch from "./Switch.svelte";

describe("Switch", () => {
  it("renders with default props", () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    expect(sw).toBeInTheDocument();
  });

  it("has aria-checked false by default", () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-checked")).toBe("false");
  });

  it("renders label when provided", () => {
    render(Switch, { props: { label: "Notifications" } });
    const label = screen.getByText("Notifications");
    expect(label).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-checked")).toBe("false");
    await fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("is disabled when disabled prop is true", () => {
    render(Switch, { props: { disabled: true } });
    const sw = screen.getByRole("switch");
    expect(sw).toBeDisabled();
  });
});
