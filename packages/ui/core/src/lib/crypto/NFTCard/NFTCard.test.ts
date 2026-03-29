import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import NFTCard from "./NFTCard.svelte";

describe("NFTCard", () => {
  it("renders with required name prop", () => {
    render(NFTCard, { props: { name: "Cool NFT" } });
    expect(screen.getByText("Cool NFT")).toBeInTheDocument();
  });

  it("displays collection name", () => {
    render(NFTCard, { props: { name: "Cool NFT", collection: "BoredApes" } });
    expect(screen.getByText("BoredApes")).toBeInTheDocument();
  });

  it("displays price with currency", () => {
    render(NFTCard, { props: { name: "Cool NFT", price: "2.5", currency: "ETH" } });
    expect(screen.getByText("2.5 ETH")).toBeInTheDocument();
  });

  it("displays rarity badge when provided", () => {
    render(NFTCard, { props: { name: "Cool NFT", rarity: "Legendary" } });
    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });

  it("calls onclick when clicked", async () => {
    const onclick = vi.fn();
    render(NFTCard, { props: { name: "Cool NFT", onclick } });
    await fireEvent.click(screen.getByRole("button"));
    expect(onclick).toHaveBeenCalledOnce();
  });
});
