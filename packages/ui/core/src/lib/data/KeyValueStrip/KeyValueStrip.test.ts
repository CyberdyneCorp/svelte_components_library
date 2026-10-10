import { render, screen, within } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import KeyValueStrip from "./KeyValueStrip.svelte";

const sshItems = [
  { id: "user", label: "Nome de usuário SSH", value: "root", copy: true },
  { id: "ipv4", label: "IPv4", value: "203.0.113.10", copy: true },
  {
    id: "reset",
    label: "Esqueceu a senha root?",
    value: "Redefinir",
    href: "/reset",
    linkLabel: "Redefinir senha",
  },
];

describe("KeyValueStrip", () => {
  it("renders the SSH facts strip with copy buttons, a link and three list items", () => {
    render(KeyValueStrip, {
      props: { items: sshItems, copyLabel: "Copiar", ariaLabel: "Acesso SSH" },
    });

    const list = screen.getByRole("list", { name: "Acesso SSH" });
    expect(list.tagName).toBe("UL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);

    expect(screen.getByRole("button", { name: "Copiar Nome de usuário SSH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar IPv4" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);

    const link = screen.getByRole("link", { name: "Redefinir senha" });
    expect(link).toHaveAttribute("href", "/reset");
  });

  it("shows each item as '{label}: {value}'", () => {
    render(KeyValueStrip, { props: { items: [sshItems[1]] } });
    const item = screen.getByRole("listitem");
    expect(item.textContent?.replace(/\s+/g, " ").trim()).toContain("IPv4: 203.0.113.10");
  });

  it("copies the item value and defaults copyLabel to 'Copy'", () => {
    render(KeyValueStrip, { props: { items: [sshItems[1]] } });
    const btn = screen.getByRole("button", { name: "Copy IPv4" });
    expect(btn).toBeInTheDocument();
    // CopyButton receives the value, not the label.
    expect(btn.closest("li")).toHaveTextContent("203.0.113.10");
  });

  it("renders no copy button and no link for a plain fact", () => {
    render(KeyValueStrip, { props: { items: [{ id: "os", label: "SO", value: "Ubuntu 25.04" }] } });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Ubuntu 25.04")).toBeInTheDocument();
  });

  it("falls back to the value as link text when linkLabel is omitted", () => {
    render(KeyValueStrip, {
      props: {
        items: [
          {
            id: "host",
            label: "Host",
            value: "srv-example.cloud",
            href: "https://srv-example.cloud",
          },
        ],
      },
    });
    const link = screen.getByRole("link", { name: "srv-example.cloud" });
    expect(link).toHaveAttribute("href", "https://srv-example.cloud");
  });

  it("renders an unnamed list when ariaLabel is omitted", () => {
    render(KeyValueStrip, { props: { items: [sshItems[0]] } });
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-label");
  });
});
