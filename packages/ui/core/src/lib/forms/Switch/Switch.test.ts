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

  it("does not toggle when disabled", async () => {
    render(Switch, { props: { disabled: true } });
    const sw = screen.getByRole("switch");
    await fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles on Space key", async () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    await fireEvent.keyDown(sw, { key: " " });
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("toggles on Enter key", async () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    await fireEvent.keyDown(sw, { key: "Enter" });
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("does not toggle on other keys", async () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    await fireEvent.keyDown(sw, { key: "a" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
  });

  it("does not toggle on keyboard when disabled", async () => {
    render(Switch, { props: { disabled: true } });
    const sw = screen.getByRole("switch");
    await fireEvent.keyDown(sw, { key: " " });
    expect(sw.getAttribute("aria-checked")).toBe("false");
  });

  it("toggles back to false on second click", async () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    await fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
    await fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("false");
  });

  it("applies aria-label from label prop", () => {
    render(Switch, { props: { label: "Dark mode" } });
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-label")).toBe("Dark mode");
  });

  it("has no aria-label when label is empty", () => {
    render(Switch);
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-label")).toBeNull();
  });

  it("applies disabled class to container", () => {
    const { container } = render(Switch, { props: { disabled: true } });
    expect(container.querySelector(".cy-switch--disabled")).toBeInTheDocument();
  });

  it("applies track--on class when checked", async () => {
    const { container } = render(Switch);
    const sw = screen.getByRole("switch");
    await fireEvent.click(sw);
    expect(container.querySelector(".cy-switch__track--on")).toBeInTheDocument();
  });

  it("renders with checked=true initially", () => {
    render(Switch, { props: { checked: true } });
    const sw = screen.getByRole("switch");
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });
});
