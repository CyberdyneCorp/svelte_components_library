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
    const { container } = render(NetworkBadge, {
      props: { network: "Ethereum", chainId: 1, connected: false },
    });
    const badge = container.querySelector(".cy-network-badge--disconnected");
    expect(badge).toBeInTheDocument();
  });

  it("does not show connected dot when disconnected", () => {
    const { container } = render(NetworkBadge, {
      props: { network: "Ethereum", chainId: 1, connected: false },
    });
    const dot = container.querySelector(".cy-network-badge__dot--connected");
    expect(dot).not.toBeInTheDocument();
  });

  it("renders by name only when chainId is omitted", () => {
    const { container } = render(NetworkBadge, { props: { network: "Base" } });
    expect(screen.getByText("Base")).toBeInTheDocument();
    expect(container.querySelector(".cy-network-badge__chain-id")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("#");
  });

  it("renders chain id 0 when explicitly given", () => {
    render(NetworkBadge, { props: { network: "Local", chainId: 0 } });
    expect(screen.getByText("#0")).toBeInTheDocument();
  });

  it("hides the status dot and disconnected dimming when showStatus is false", () => {
    const { container } = render(NetworkBadge, {
      props: { network: "Ethereum", showStatus: false, connected: false },
    });
    expect(container.querySelector(".cy-network-badge__dot")).not.toBeInTheDocument();
    expect(container.querySelector(".cy-network-badge--disconnected")).not.toBeInTheDocument();
    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });
});
