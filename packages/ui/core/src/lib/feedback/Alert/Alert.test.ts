import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Alert from "./Alert.svelte";

describe("Alert", () => {
  it("renders with default variant", () => {
    render(Alert, { props: { title: "Test alert" } });
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert.className).toContain("info");
  });

  it("displays the title", () => {
    render(Alert, { props: { title: "Important notice" } });
    expect(screen.getByText("Important notice")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(Alert, { props: { variant: "error", title: "Error" } });
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("error");
  });

  it("shows dismiss button when dismissible", () => {
    render(Alert, { props: { dismissible: true, title: "Dismissible" } });
    expect(screen.getByLabelText("Dismiss alert")).toBeInTheDocument();
  });

  it("calls ondismiss and hides when dismissed", async () => {
    const ondismiss = vi.fn();
    render(Alert, { props: { dismissible: true, title: "Bye", ondismiss } });
    await fireEvent.click(screen.getByLabelText("Dismiss alert"));
    expect(ondismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
