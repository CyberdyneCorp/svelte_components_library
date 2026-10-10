import { fireEvent, render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, it, expect, vi } from "vitest";
import DescriptionList from "./DescriptionList.svelte";
import DescriptionListHarness from "./DescriptionListHarness.test.svelte";
import type { DescriptionListItem } from "./types.js";

const server: DescriptionListItem[] = [
  { id: "location", label: "Localização do servidor", value: "Brazil - São Paulo" },
  { id: "os", label: "SO", value: "Ubuntu 25.04" },
  { id: "hostname", label: "Nome do host", value: "srv-example.cloud" },
];

describe("DescriptionList", () => {
  it("renders one dl with a dt/dd pair per item, in order", () => {
    const { container } = render(DescriptionList, { props: { items: server } });
    const lists = container.querySelectorAll("dl");
    expect(lists).toHaveLength(1);
    const terms = [...lists[0].querySelectorAll("dt")].map((dt) => dt.textContent);
    const details = [...lists[0].querySelectorAll("dd")].map((dd) => dd.textContent?.trim());
    expect(terms).toEqual(["Localização do servidor", "SO", "Nome do host"]);
    expect(details).toEqual(["Brazil - São Paulo", "Ubuntu 25.04", "srv-example.cloud"]);
    expect(lists[0]).toHaveClass("cy-description-list--dividers");
    expect(lists[0]).not.toHaveClass("cy-description-list--two-columns");
  });

  it("renders an edit action per row, named after the row label", async () => {
    const onedit = vi.fn();
    const { container } = render(DescriptionListHarness, {
      props: { items: server, onedit },
    });
    expect(container.querySelectorAll("dl")).toHaveLength(1);
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(container.querySelectorAll("dd")).toHaveLength(3);

    const buttons = [
      screen.getByRole("button", { name: "Editar Localização do servidor" }),
      screen.getByRole("button", { name: "Editar SO" }),
      screen.getByRole("button", { name: "Editar Nome do host" }),
    ];
    expect(screen.getAllByRole("button")).toHaveLength(3);
    for (const button of buttons) {
      expect(button.closest("dd")).toHaveClass("cy-description-list__details");
    }
    await fireEvent.click(buttons[1]);
    expect(onedit).toHaveBeenCalledWith(server[1]);
  });

  it("renders the value snippet and the hint inside the dd", () => {
    const items: DescriptionListItem[] = [
      { id: "domain", label: "Domínio", value: "Ativo", hint: "Renovação automática ativa" },
    ];
    const { container } = render(DescriptionListHarness, {
      props: { items, withBadge: true },
    });
    const dd = container.querySelector("dd") as HTMLElement;
    const badge = dd.querySelector(".cy-status-badge");
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("Ativo");
    expect(dd.querySelector(".cy-description-list__hint")).toHaveTextContent(
      "Renovação automática ativa",
    );
    expect(dd.querySelector(".cy-description-list__action")).toBeNull();
  });

  it("passes the item to the value snippet and omits the plain value", () => {
    const value = createRawSnippet((item: () => DescriptionListItem) => ({
      render: () => `<b data-testid="rich">${item().id}:${item().value}</b>`,
    }));
    const { container } = render(DescriptionList, { props: { items: server.slice(0, 1), value } });
    expect(screen.getByTestId("rich")).toHaveTextContent("location:Brazil - São Paulo");
    expect(container.querySelector(".cy-description-list__value")?.textContent?.trim()).toBe(
      "location:Brazil - São Paulo",
    );
  });

  it("omits hint and action containers when neither is given", () => {
    const { container } = render(DescriptionList, { props: { items: server } });
    expect(container.querySelector(".cy-description-list__hint")).toBeNull();
    expect(container.querySelector(".cy-description-list__action")).toBeNull();
  });

  it("switches to two columns and drops dividers on request", () => {
    const { container } = render(DescriptionList, {
      props: { items: server, columns: 2, dividers: false },
    });
    const dl = container.querySelector("dl");
    expect(dl).toHaveClass("cy-description-list--two-columns");
    expect(dl).not.toHaveClass("cy-description-list--dividers");
  });
});
