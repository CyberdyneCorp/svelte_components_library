import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import NetworkBadge from "./NetworkBadge.svelte";

describe("NetworkBadge", () => {
  it("renders with required props", () => {
    render(NetworkBadge, { props: { network: "Ethereum", chainId: 1 } });
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("displays chain ID", () => {
    render(NetworkBadge, { props: { network: "Ethereum", chainId: 1 } });
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows connected status dot by default", () => {
    const { container } = render(NetworkBadge, { props: { network: "Ethereum", chainId: 1 } });
    const dot = container.querySelector(".cy-network-badge__dot--connected");
    expect(dot).toBeInTheDocument();
  });

  it("applies disconnected class when not connected", () => {
    const { container } = render(NetworkBadge, { props: { network: "Ethereum", chainId: 1, connected: false } });
    const badge = container.querySelector(".cy-network-badge--disconnected");
    expect(badge).toBeInTheDocument();
  });

  it("does not show connected dot when disconnected", () => {
    const { container } = render(NetworkBadge, { props: { network: "Ethereum", chainId: 1, connected: false } });
    const dot = container.querySelector(".cy-network-badge__dot--connected");
    expect(dot).not.toBeInTheDocument();
  });
});
