import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddressDisplay from "./AddressDisplay.svelte";

const fullAddress = "0x1234567890abcdef1234567890abcdef12345678";

describe("AddressDisplay", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders the address", () => {
    render(AddressDisplay, { props: { address: fullAddress } });
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
  });

  it("truncates long address by default", () => {
    render(AddressDisplay, { props: { address: fullAddress } });
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
  });

  it("shows full address when truncate is false", () => {
    render(AddressDisplay, { props: { address: fullAddress, truncate: false } });
    expect(screen.getByText(fullAddress)).toBeInTheDocument();
  });

  it("does not truncate short addresses", () => {
    render(AddressDisplay, { props: { address: "0x1234" } });
    expect(screen.getByText("0x1234")).toBeInTheDocument();
  });

  it("handles empty address", () => {
    const { container } = render(AddressDisplay, { props: { address: "" } });
    const value = container.querySelector(".cy-address__value");
    expect(value?.textContent).toBe("");
  });

  it("shows label when provided", () => {
    render(AddressDisplay, { props: { address: fullAddress, label: "Wallet" } });
    expect(screen.getByText("Wallet")).toBeInTheDocument();
  });

  it("does not show label when not provided", () => {
    const { container } = render(AddressDisplay, { props: { address: fullAddress } });
    expect(container.querySelector(".cy-address__label")).not.toBeInTheDocument();
  });

  it("applies md size by default", () => {
    const { container } = render(AddressDisplay, { props: { address: fullAddress } });
    expect(container.querySelector(".cy-address--md")).toBeInTheDocument();
  });

  it("applies sm size", () => {
    const { container } = render(AddressDisplay, { props: { address: fullAddress, size: "sm" } });
    expect(container.querySelector(".cy-address--sm")).toBeInTheDocument();
  });

  it("renders copy button", () => {
    render(AddressDisplay, { props: { address: fullAddress } });
    expect(screen.getByLabelText("Copy address")).toBeInTheDocument();
  });

  it("copies full address to clipboard on click", async () => {
    render(AddressDisplay, { props: { address: fullAddress } });
    await fireEvent.click(screen.getByLabelText("Copy address"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fullAddress);
  });

  it("shows check icon after copy", async () => {
    const { container } = render(AddressDisplay, { props: { address: fullAddress } });
    await fireEvent.click(screen.getByLabelText("Copy address"));
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
  });

  it("reverts copy state after timeout", async () => {
    vi.useFakeTimers();
    const { container } = render(AddressDisplay, { props: { address: fullAddress } });
    await fireEvent.click(screen.getByLabelText("Copy address"));
    await vi.advanceTimersByTimeAsync(2000);
    const rect = container.querySelector("rect");
    expect(rect).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("falls back when clipboard API fails", async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("fail"));
    document.execCommand = vi.fn().mockReturnValue(true);
    render(AddressDisplay, { props: { address: fullAddress } });
    await fireEvent.click(screen.getByLabelText("Copy address"));
    expect(document.execCommand).toHaveBeenCalledWith("copy");
  });

  it("has address row with value and copy button", () => {
    const { container } = render(AddressDisplay, { props: { address: fullAddress } });
    const row = container.querySelector(".cy-address__row");
    expect(row).toBeInTheDocument();
    expect(row?.querySelector(".cy-address__value")).toBeInTheDocument();
    expect(row?.querySelector(".cy-address__copy")).toBeInTheDocument();
  });

  it("does not truncate 12-char address", () => {
    render(AddressDisplay, { props: { address: "123456789012" } });
    expect(screen.getByText("123456789012")).toBeInTheDocument();
  });

  it("truncates 13-char address", () => {
    render(AddressDisplay, { props: { address: "1234567890123" } });
    expect(screen.getByText("123456...0123")).toBeInTheDocument();
  });
});
