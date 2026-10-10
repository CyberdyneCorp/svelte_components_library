import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar.svelte";
import type { SidebarGroup, SidebarItem } from "./Sidebar.svelte";

const items: SidebarItem[] = [
  { id: "home", label: "Home", href: "/" },
  {
    id: "settings",
    label: "Settings",
    children: [{ id: "general", label: "General", href: "/settings/general" }],
  },
];

const groups: SidebarGroup[] = [
  {
    id: "apps",
    label: "Aplicativos",
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: "docker", label: "Docker", href: "/docker" },
      { id: "nodejs", label: "Node.js", href: "/node" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    collapsible: true,
    defaultOpen: false,
    items: [{ id: "seo", label: "SEO", href: "/seo" }],
  },
];

const nested: SidebarItem[] = [
  {
    id: "config",
    label: "Configurações",
    children: [
      { id: "main", label: "Principais", href: "/config/main" },
      { id: "ip", label: "Endereço IP", href: "/config/ip" },
    ],
  },
];

describe("Sidebar", () => {
  it("renders a nav element", () => {
    render(Sidebar, { props: { items } });
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders top-level items", () => {
    render(Sidebar, { props: { items } });
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("hides children by default", () => {
    render(Sidebar, { props: { items } });
    expect(screen.queryByText("General")).not.toBeInTheDocument();
  });

  it("expands children on click", async () => {
    render(Sidebar, { props: { items } });
    await fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("applies collapsed class", () => {
    const { container } = render(Sidebar, { props: { items, collapsed: true } });
    expect(container.querySelector(".cy-sidebar--collapsed")).toBeInTheDocument();
  });

  it("leaves the nav unlabelled by default", () => {
    render(Sidebar, { props: { items } });
    expect(screen.getByRole("navigation")).not.toHaveAttribute("aria-label");
  });

  it("labels the nav landmark with ariaLabel", () => {
    render(Sidebar, { props: { items, ariaLabel: "Main navigation" } });
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
  });

  it("marks the active link with aria-current and highlights the parent of an active child", async () => {
    render(Sidebar, { props: { items, activeId: "general" } });
    const parent = screen.getByRole("button", { name: "Settings" });
    expect(parent).toHaveClass("cy-sidebar__link--active");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    await fireEvent.click(parent);
    expect(screen.getByRole("link", { name: "General" })).toHaveAttribute("aria-current", "page");
  });

  it("names icon-only rail links and buttons by their label while collapsed", () => {
    const iconItems: SidebarItem[] = [
      { id: "home", label: "Home", icon: ">", href: "/" },
      { id: "settings", label: "Settings", icon: "S", children: items[1].children },
    ];
    render(Sidebar, { props: { items: iconItems, collapsed: true } });
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("title", "Home");
    expect(link.querySelector(".cy-sidebar__label")).toBeNull();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });
});

describe("Sidebar groups", () => {
  it("renders open groups and hides closed collapsible groups until toggled", async () => {
    render(Sidebar, { props: { groups } });
    expect(screen.getByRole("link", { name: "Docker" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Node.js" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "SEO" })).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Marketing" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "SEO" })).toBeVisible();
  });

  it("uses groups instead of items when both are provided", () => {
    render(Sidebar, { props: { groups, items } });
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Aplicativos" })).toBeInTheDocument();
  });

  it("renders a non-collapsible group heading as plain text", () => {
    const plain: SidebarGroup[] = [
      { id: "g", label: "Geral", items: [{ id: "a", label: "A", href: "/a" }] },
    ];
    render(Sidebar, { props: { groups: plain } });
    expect(screen.getByText("Geral")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Geral" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "A" })).toBeVisible();
  });
});

describe("Sidebar badges, external links and navigation callback", () => {
  const decorated: SidebarItem[] = [
    { id: "gpu", label: "GPU", href: "/gpu", badge: "Beta" },
    { id: "api", label: "API", href: "https://example.test", external: true },
    { id: "off", label: "Legacy", href: "/legacy", disabled: true },
  ];

  it("renders the badge next to the label", () => {
    render(Sidebar, { props: { items: decorated } });
    const link = screen.getByRole("link", { name: /GPU/ });
    expect(link).toHaveTextContent("GPU");
    expect(link.querySelector(".cy-badge")).toHaveTextContent("Beta");
  });

  it("renders external items with a new-tab target and hidden label", () => {
    render(Sidebar, { props: { items: decorated } });
    const link = screen.getByRole("link", { name: "API opens in a new tab" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a custom externalLabel", () => {
    render(Sidebar, { props: { items: decorated, externalLabel: "abre em nova aba" } });
    expect(screen.getByRole("link", { name: "API abre em nova aba" })).toBeInTheDocument();
  });

  it("marks disabled items and does not report navigation for them", async () => {
    const onnavigate = vi.fn();
    render(Sidebar, { props: { items: decorated, onnavigate } });
    const link = screen.getByRole("link", { name: "Legacy" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    await fireEvent.click(link);
    expect(onnavigate).not.toHaveBeenCalled();
  });

  it("calls onnavigate with href and item without preventing default", async () => {
    const onnavigate = vi.fn();
    render(Sidebar, { props: { items: decorated, onnavigate } });
    const link = screen.getByRole("link", { name: /GPU/ });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(onnavigate).toHaveBeenCalledWith("/gpu", decorated[0]);
    expect(event.defaultPrevented).toBe(false);
  });

  it("calls onnavigate for expanded child links", async () => {
    const onnavigate = vi.fn();
    render(Sidebar, { props: { items, onnavigate } });
    await fireEvent.click(screen.getByText("Settings"));
    await fireEvent.click(screen.getByRole("link", { name: "General" }));
    expect(onnavigate).toHaveBeenCalledWith("/settings/general", items[1].children![0]);
  });
});

describe("Sidebar collapsed flyout", () => {
  it("shows children in a flyout on focus and hides them on Escape", async () => {
    render(Sidebar, { props: { items: nested, collapsed: true } });
    expect(screen.queryByText("Principais")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Configurações" });
    trigger.focus();
    await fireEvent.focusIn(trigger);
    const flyout = screen.getByRole("list", { name: "Configurações" });
    expect(flyout).toHaveClass("cy-sidebar__flyout");
    expect(screen.getByText("Principais")).toBeVisible();
    expect(screen.getByText("Endereço IP")).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByText("Principais")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("returns focus to the trigger when Escape is pressed inside the flyout", async () => {
    render(Sidebar, { props: { items: nested, collapsed: true } });
    const trigger = screen.getByRole("button", { name: "Configurações" });
    await fireEvent.focusIn(trigger);
    const child = screen.getByRole("link", { name: "Principais" });
    child.focus();
    expect(child).toHaveFocus();

    await fireEvent.keyDown(child, { key: "Escape" });
    expect(screen.queryByText("Principais")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("shows the flyout on hover and hides it when the pointer leaves", async () => {
    const { container } = render(Sidebar, { props: { items: nested, collapsed: true } });
    const li = container.querySelector(".cy-sidebar__item--parent") as HTMLElement;
    await fireEvent.mouseEnter(li);
    expect(screen.getByText("Principais")).toBeVisible();
    await fireEvent.mouseLeave(li);
    expect(screen.queryByText("Principais")).not.toBeInTheDocument();
  });

  it("hides the flyout when focus moves outside the item", async () => {
    const { container } = render(Sidebar, { props: { items: nested, collapsed: true } });
    const trigger = screen.getByRole("button", { name: "Configurações" });
    await fireEvent.focusIn(trigger);
    const child = screen.getByRole("link", { name: "Principais" });
    const li = container.querySelector(".cy-sidebar__item--parent") as HTMLElement;

    await fireEvent.focusOut(li, { relatedTarget: child });
    expect(screen.getByText("Principais")).toBeVisible();

    await fireEvent.focusOut(li, { relatedTarget: document.body });
    expect(screen.queryByText("Principais")).not.toBeInTheDocument();
  });

  it("does not render a flyout while expanded", async () => {
    render(Sidebar, { props: { items: nested, collapsed: false } });
    await fireEvent.click(screen.getByText("Configurações"));
    expect(screen.getByText("Principais").closest("ul")).toHaveClass("cy-sidebar__sublist");
    expect(document.querySelector(".cy-sidebar__flyout")).toBeNull();
  });
});
