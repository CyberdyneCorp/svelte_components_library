import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import WalletConnect from "./WalletConnect.svelte";

describe("WalletConnect", () => {
  it("renders with default wallets", () => {
    render(WalletConnect);
    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
    expect(screen.getByText("MetaMask")).toBeInTheDocument();
  });

  it("renders custom wallets", () => {
    const wallets = [
      { id: "test", name: "Test Wallet", icon: "custom" as const, description: "A test wallet" },
    ];
    render(WalletConnect, { props: { wallets } });
    expect(screen.getByText("Test Wallet")).toBeInTheDocument();
  });

  it("calls onconnect when wallet is clicked", async () => {
    const onconnect = vi.fn();
    render(WalletConnect, { props: { onconnect } });
    const metamaskBtn = screen.getByText("MetaMask").closest("button")!;
    await fireEvent.click(metamaskBtn);
    expect(onconnect).toHaveBeenCalledWith("metamask");
  });

  it("disables other wallets while connecting", () => {
    render(WalletConnect, { props: { connecting: "metamask" } });
    const walletConnectBtn = screen.getByText("WalletConnect").closest("button");
    expect(walletConnectBtn).toBeDisabled();
  });

  it("shows spinner for connecting wallet", () => {
    const { container } = render(WalletConnect, { props: { connecting: "metamask" } });
    const spinner = container.querySelector(".cy-wallet-connect__spinner");
    expect(spinner).toBeInTheDocument();
  });
});
