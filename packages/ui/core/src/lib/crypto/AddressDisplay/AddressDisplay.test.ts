import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import AddressDisplay from "./AddressDisplay.svelte";

describe("AddressDisplay", () => {
  const address = "0x1234567890abcdef1234567890abcdef12345678";

  it("renders the component", () => {
    const { container } = render(AddressDisplay, { props: { address } });
    const el = container.querySelector(".cy-address");
    expect(el).toBeInTheDocument();
  });

  it("truncates address by default", () => {
    render(AddressDisplay, { props: { address } });
    expect(screen.getByText("0x1234...5678")).toBeInTheDocument();
  });

  it("shows full address when truncate is false", () => {
    render(AddressDisplay, { props: { address, truncate: false } });
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it("displays label when provided", () => {
    render(AddressDisplay, { props: { address, label: "Wallet" } });
    expect(screen.getByText("Wallet")).toBeInTheDocument();
  });

  it("has accessible copy button", () => {
    render(AddressDisplay, { props: { address } });
    expect(screen.getByLabelText("Copy address")).toBeInTheDocument();
  });
});
