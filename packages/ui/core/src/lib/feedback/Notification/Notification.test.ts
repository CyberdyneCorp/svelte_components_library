import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Notification from "./Notification.svelte";

describe("Notification", () => {
  it("renders with message", () => {
    render(Notification, { props: { message: "Hello world", duration: 0 } });
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("has status role for accessibility", () => {
    render(Notification, { props: { message: "Info", duration: 0 } });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(Notification, { props: { variant: "error", message: "Err", duration: 0 } });
    const el = screen.getByRole("status");
    expect(el.className).toContain("error");
  });

  it("shows close button with accessible label", () => {
    render(Notification, { props: { message: "Close me", duration: 0 } });
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });

  it("calls onclose when close button clicked", async () => {
    const onclose = vi.fn();
    render(Notification, { props: { message: "Bye", duration: 0, onclose } });
    await fireEvent.click(screen.getByLabelText("Close notification"));
    // onclose is called after a timeout for animation
    await vi.waitFor(() => expect(onclose).toHaveBeenCalledOnce());
  });
});
