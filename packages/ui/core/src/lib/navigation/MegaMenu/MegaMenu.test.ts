import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import MegaMenu from "./MegaMenu.svelte";

const sections = [
  {
    title: "Platform",
    items: [
      { label: "CyberdyneDAO", href: "/dao", description: "Governance" },
      { label: "YieldPath", href: "/yield" },
    ],
  },
  {
    title: "Developer",
    items: [
      { label: "API Docs", href: "/api" },
    ],
  },
];

describe("MegaMenu", () => {
  it("renders the component", () => {
    render(MegaMenu, { props: { sections } });
    expect(screen.getByLabelText("Mega menu")).toBeInTheDocument();
  });

  it("panel is hidden by default", () => {
    render(MegaMenu, { props: { sections } });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows sections when open", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("displays section titles when open", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });

  it("displays items within sections when open", () => {
    render(MegaMenu, { props: { sections, open: true } });
    expect(screen.getByText("CyberdyneDAO")).toBeInTheDocument();
    expect(screen.getByText("YieldPath")).toBeInTheDocument();
    expect(screen.getByText("API Docs")).toBeInTheDocument();
  });
});
