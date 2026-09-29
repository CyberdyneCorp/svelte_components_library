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

  describe("role", () => {
    it("defaults to an assertive alert without aria-live", () => {
      render(Alert, { props: { title: "Default" } });
      const alert = screen.getByRole("alert");
      expect(alert).not.toHaveAttribute("aria-live");
    });

    it("renders a polite status live region", () => {
      render(Alert, { props: { role: "status", title: "Saved" } });
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("renders a static note that is not a live region", () => {
      render(Alert, { props: { role: "note", title: "Heads up" } });
      const note = screen.getByRole("note");
      expect(note).not.toHaveAttribute("aria-live");
      expect(screen.queryByRole("alert")).toBeNull();
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("keeps variant styling and dismissal with a non-alert role", async () => {
      const ondismiss = vi.fn();
      render(Alert, { props: { role: "note", variant: "warning", dismissible: true, title: "Note", ondismiss } });
      expect(screen.getByRole("note").className).toContain("warning");
      await fireEvent.click(screen.getByLabelText("Dismiss alert"));
      expect(ondismiss).toHaveBeenCalledOnce();
      expect(screen.queryByRole("note")).toBeNull();
    });
  });
});
