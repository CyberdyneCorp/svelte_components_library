import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect, vi } from "vitest";
import SettingsRow from "./SettingsRow.svelte";
import SettingsRowHarness from "./SettingsRowHarness.test.svelte";

describe("SettingsRow", () => {
  it("renders title, description, badge and two keyboard-reachable Buttons", async () => {
    const onreset = vi.fn();
    const onadd = vi.fn();
    const { container } = render(SettingsRowHarness, { props: { onreset, onadd } });
    expect(screen.getByText("Resolvedores DNS")).toBeVisible();
    expect(screen.getByText("Use os padrões ou adicione o seu.")).toBeVisible();
    expect(screen.getByText("Personalizado")).toBeVisible();
    expect(screen.getByText("Personalizado")).toHaveClass("cy-badge", "cy-badge--info");

    const reset = screen.getByRole("button", { name: "Restaurar padrões" });
    const add = screen.getByRole("button", { name: "Adicionar" });
    expect(screen.getAllByRole("button")).toEqual([reset, add]);
    expect(container.querySelector(".cy-settings-row__actions")).toContainElement(reset);

    for (const button of [reset, add]) {
      expect(button).toBeEnabled();
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      button.focus();
      expect(button).toHaveFocus();
    }
    await fireEvent.click(add);
    expect(onadd).toHaveBeenCalledTimes(1);
    expect(onreset).not.toHaveBeenCalled();
  });

  it("renders a div by default and a listitem with as='li' inside a <ul>", () => {
    const div = render(SettingsRowHarness);
    const root = div.container.querySelector(".cy-settings-row") as HTMLElement;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-setting", "dns");
    expect(screen.queryByRole("listitem")).toBeNull();

    const list = document.createElement("ul");
    document.body.appendChild(list);
    render(SettingsRowHarness, { target: list, props: { as: "li" } });
    const item = screen.getByRole("listitem");
    expect(item).toBe(list.querySelector(":scope > li.cy-settings-row"));
    expect(item).toHaveAttribute("data-setting", "dns");
    list.remove();
  });

  it("forwards data-* attributes to the root element", () => {
    const { container } = render(SettingsRow, {
      props: { title: "Resolvedores DNS", "data-setting": "dns", "data-testid": "row" },
    });
    const root = container.querySelector(".cy-settings-row") as HTMLElement;
    expect(root).toHaveAttribute("data-setting", "dns");
    expect(screen.getByTestId("row")).toBe(root);
  });

  it("renders nothing but the title for a minimal row", () => {
    const { container } = render(SettingsRow, { props: { title: "Firewall" } });
    expect(screen.getByText("Firewall")).toBeInTheDocument();
    expect(container.querySelector(".cy-settings-row__icon")).toBeNull();
    expect(container.querySelector(".cy-settings-row__description")).toBeNull();
    expect(container.querySelector(".cy-badge")).toBeNull();
    expect(container.querySelector(".cy-settings-row__actions")).toBeNull();
  });

  it("renders the icon snippet inside a round aria-hidden container", () => {
    const { container } = render(SettingsRowHarness);
    const wrapper = container.querySelector(".cy-settings-row__icon") as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper.querySelector("svg.cy-icon")).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("applies the badge variant", () => {
    render(SettingsRow, { props: { title: "SSH", badge: "Beta", badgeVariant: "info" } });
    expect(screen.getByText("Beta")).toHaveClass("cy-badge--info");
  });

  it("renders children as the description instead of the plain string", () => {
    const children = createRawSnippet(() => ({
      render: () => "<span>Rich <a href='/docs'>docs</a></span>",
    }));
    const { container } = render(SettingsRow, {
      props: { title: "SSH", description: "Plain text", children },
    });
    expect(container.querySelectorAll(".cy-settings-row__description")).toHaveLength(1);
    expect(screen.queryByText("Plain text")).toBeNull();
    expect(screen.getByRole("link", { name: "docs" })).toBeInTheDocument();
  });
});
