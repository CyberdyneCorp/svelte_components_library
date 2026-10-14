import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect, vi } from "vitest";
import OptionCard from "./OptionCard.svelte";
import OptionCardHarness from "./OptionCardHarness.test.svelte";

describe("OptionCard radio group", () => {
  it("names each radio by its title and describes it by its description", () => {
    render(OptionCardHarness);
    const pro = screen.getByRole("radio", { name: "Pro" });
    expect(pro).toHaveAccessibleDescription("Unlimited projects");
    expect(pro).toHaveAttribute("name", "plan");
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
  });

  it("sets the bound group when a card is clicked", async () => {
    const onchange = vi.fn();
    render(OptionCardHarness, { props: { onchange } });
    await fireEvent.click(screen.getByText("Unlimited projects"));
    expect(screen.getByTestId("plan")).toHaveTextContent("pro");
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
    expect(onchange).toHaveBeenCalledWith(true);
  });

  it("follows the group when it changes from outside", async () => {
    const { rerender } = render(OptionCardHarness, { props: { plan: "free" } });
    await rerender({ plan: "pro" });
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
  });

  it("renders disabled cards with a disabled input", () => {
    render(OptionCardHarness);
    const team = screen.getByRole("radio", { name: "Team" });
    expect(team).toBeDisabled();
    expect(team.closest("label")).toHaveClass("cy-option-card--disabled");
  });

  it("renders the meta snippet", () => {
    render(OptionCardHarness);
    expect(screen.getByText("$12/mo")).toBeInTheDocument();
  });
});

describe("OptionCard checkbox", () => {
  it("toggles checked and reports the new state", async () => {
    const onchange = vi.fn();
    render(OptionCard, {
      props: { type: "checkbox", title: "Daily backups", description: "Kept for 7 days", onchange },
    });
    const box = screen.getByRole("checkbox", { name: "Daily backups" });
    expect(box).toHaveAccessibleDescription("Kept for 7 days");
    expect(box).not.toBeChecked();
    await fireEvent.click(box);
    expect(box).toBeChecked();
    expect(onchange).toHaveBeenLastCalledWith(true);
    await fireEvent.click(box);
    expect(onchange).toHaveBeenLastCalledWith(false);
  });

  it("hides the icon from assistive tech and omits empty parts", () => {
    const icon = createRawSnippet(() => ({ render: () => `<svg width="16" height="16"></svg>` }));
    const { container } = render(OptionCard, { props: { type: "checkbox", title: "Alerts", icon } });
    expect(container.querySelector(".cy-option-card__icon")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".cy-option-card__description")).toBeNull();
    expect(container.querySelector(".cy-option-card__meta")).toBeNull();
    expect(screen.getByRole("checkbox", { name: "Alerts" })).not.toHaveAttribute("aria-describedby");
  });
});
