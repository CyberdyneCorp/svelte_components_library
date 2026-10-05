import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import HeroSection from "./HeroSection.svelte";
import FeatureGrid from "./FeatureGrid.svelte";
import PricingTable from "./PricingTable.svelte";
import FAQSection from "./FAQSection.svelte";
import TestimonialGrid from "./TestimonialGrid.svelte";
import MarketingFooter from "./MarketingFooter.svelte";
import StatsSection from "./StatsSection.svelte";

describe("marketing sections", () => {
  it("renders an h1 hero and real action destinations", () => {
    render(HeroSection, {
      props: {
        id: "start",
        title: "Build with clarity",
        actions: [{ label: "Explore features", href: "#features" }],
      },
    });

    expect(screen.getByRole("heading", { level: 1, name: "Build with clarity" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore features" })).toHaveAttribute("href", "#features");
  });

  it("omits empty collections instead of showing invented content", () => {
    const { container } = render(FeatureGrid, {
      props: { heading: "Capabilities", features: [] },
    });
    expect(container.querySelector(".cy-marketing-features")).not.toBeInTheDocument();
    expect(container.textContent).not.toContain("feature goes here");
  });

  it("keeps metric descriptions inside valid definition-list descriptions", () => {
    const { container } = render(StatsSection, {
      props: {
        metrics: [{ id: "uptime", label: "Availability", value: "99.9%", description: "Measured over the stated period." }],
      },
    });

    expect(container.querySelector("dl > div > dt")?.textContent).toBe("Availability");
    expect(container.querySelector("dl > div > dd > p")?.textContent).toBe("Measured over the stated period.");
  });

  it("uses native FAQ disclosure with keyboard-operable summaries", async () => {
    render(FAQSection, {
      props: {
        heading: "Questions",
        items: [{ id: "billing", question: "How does billing work?", answer: "The product team sets the terms." }],
      },
    });

    const question = screen.getByText("How does billing work?");
    expect(question.tagName).toBe("SUMMARY");
    const details = question.closest("details");
    expect(details).not.toHaveAttribute("open");
    await fireEvent.click(question);
    expect(details).toHaveAttribute("open");
    expect(screen.getByText("The product team sets the terms.")).toBeInTheDocument();
  });

  it("renders the caller-formatted plan and provided link", async () => {
    const plan = {
      id: "starter",
      name: "Starter",
      price: "US$ 19",
      period: "per month",
      features: ["Email support"],
      action: { label: "Choose Starter", href: "/signup?plan=starter" },
    };
    const { rerender } = render(PricingTable, { props: { plans: [plan] } });
    expect(screen.getByText("US$ 19")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Choose Starter" })).toHaveAttribute("href", "/signup?plan=starter");

    await rerender({ plans: [{ ...plan, price: "US$ 15" }] });
    expect(screen.getByText("US$ 15")).toBeInTheDocument();
    expect(screen.queryByText("US$ 19")).not.toBeInTheDocument();
  });

  it("accepts placeholder copy without presenting a fabricated endorsement", () => {
    render(TestimonialGrid, {
      props: {
        heading: "Customer stories",
        testimonials: [{ id: "placeholder", quote: "Approved testimonial copy goes here.", author: "Customer name", role: "Role and organization" }],
      },
    });
    expect(screen.getByText("Approved testimonial copy goes here.")).toBeInTheDocument();
    expect(screen.getByText("Customer name")).toBeInTheDocument();
  });

  it("renders footer destinations supplied by the consumer", () => {
    render(MarketingFooter, {
      props: {
        brand: "Cyberdyne",
        groups: [{ id: "company", label: "Company", links: [{ label: "About", href: "/about" }] }],
        legalLinks: [{ label: "Privacy", href: "/privacy" }],
        copyright: "© Cyberdyne",
      },
    });
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });
});
