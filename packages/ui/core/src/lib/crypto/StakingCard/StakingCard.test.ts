import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import StakingCard from "./StakingCard.svelte";

describe("StakingCard", () => {
  it("renders with default props", () => {
    const { container } = render(StakingCard);
    const card = container.querySelector(".cy-staking");
    expect(card).toBeInTheDocument();
  });

  it("displays staked amount", () => {
    const { container } = render(StakingCard, { props: { stakedAmount: "32.00", token: "ETH" } });
    const amount = container.querySelector(".cy-staking__amount-value");
    expect(amount?.textContent).toBe("32.00");
  });

  it("displays APY", () => {
    const { container } = render(StakingCard, { props: { apy: "4.2%" } });
    const apy = container.querySelector(".cy-staking__apy-badge");
    expect(apy?.textContent).toBe("4.2%");
  });

  it("displays rewards", () => {
    const { container } = render(StakingCard, { props: { rewards: "1.245", token: "ETH" } });
    const rewards = container.querySelector(".cy-staking__rewards-value");
    expect(rewards?.textContent).toBe("1.245 ETH");
  });

  it("displays status badge", () => {
    const { container } = render(StakingCard, { props: { status: "locked" } });
    const status = container.querySelector(".cy-staking__status--locked");
    expect(status).toBeInTheDocument();
  });
});
