import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import ConnectWalletModal from "./ConnectWalletModal.svelte";

const providers = [
  { id: "wc", name: "WalletConnect", description: "50+ wallets", icon: "📱" },
  { id: "google", name: "Continue with Google", description: "OAuth", icon: "G" },
  { id: "off", name: "Disabled", disabled: true },
];

describe("ConnectWalletModal", () => {
  it("does not render when open=false", () => {
    const { container } = render(ConnectWalletModal, { props: { open: false, providers } });
    expect(container.querySelector(".cy-cw")).not.toBeInTheDocument();
  });

  it("renders when open=true", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("uses default title", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    expect(screen.getByText("CONNECT WALLET")).toBeInTheDocument();
  });

  it("uses custom title", () => {
    render(ConnectWalletModal, { props: { open: true, providers, title: "LOG IN" } });
    expect(screen.getByText("LOG IN")).toBeInTheDocument();
  });

  it("is aria-modal", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("aria-labelledby targets title id", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "cy-cw-title");
    expect(document.getElementById("cy-cw-title")).toBeInTheDocument();
  });

  it("renders all providers", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    expect(screen.getByText("WalletConnect")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("renders descriptions when present", () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    expect(screen.getByText("50+ wallets")).toBeInTheDocument();
  });

  it("fires onSelect with id", async () => {
    const onSelect = vi.fn();
    render(ConnectWalletModal, { props: { open: true, providers, onSelect } });
    await fireEvent.click(screen.getByText("WalletConnect"));
    expect(onSelect).toHaveBeenCalledWith("wc");
  });

  it("does not select disabled provider", async () => {
    const onSelect = vi.fn();
    render(ConnectWalletModal, { props: { open: true, providers, onSelect } });
    const btn = screen.getByText("Disabled").closest("button")!;
    expect(btn).toBeDisabled();
    await fireEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("close button fires onClose", async () => {
    const onClose = vi.fn();
    const { container } = render(ConnectWalletModal, { props: { open: true, providers, onClose } });
    await fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
    expect(container.querySelector(".cy-cw")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const { container } = render(ConnectWalletModal, { props: { open: true, providers } });
    await fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(container.querySelector(".cy-cw")).not.toBeInTheDocument();
  });

  it("closes on backdrop click", async () => {
    const { container } = render(ConnectWalletModal, { props: { open: true, providers } });
    await fireEvent.click(screen.getByRole("dialog"));
    expect(container.querySelector(".cy-cw")).not.toBeInTheDocument();
  });

  it("does not close on inside click", async () => {
    render(ConnectWalletModal, { props: { open: true, providers } });
    await fireEvent.click(screen.getByText("WalletConnect"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders iconSrc as image", () => {
    const { container } = render(ConnectWalletModal, {
      props: { open: true, providers: [{ id: "a", name: "A", iconSrc: "/x.png" }] },
    });
    expect(container.querySelector("img")).toBeInTheDocument();
  });
});
