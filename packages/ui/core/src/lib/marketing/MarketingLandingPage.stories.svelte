<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import HeroSection from "./HeroSection.svelte";
  import FeatureGrid from "./FeatureGrid.svelte";
  import LogoCloud from "./LogoCloud.svelte";
  import TestimonialGrid from "./TestimonialGrid.svelte";
  import PricingTable from "./PricingTable.svelte";
  import FAQSection from "./FAQSection.svelte";
  import CTASection from "./CTASection.svelte";
  import MarketingFooter from "./MarketingFooter.svelte";
  import StatsSection from "./StatsSection.svelte";
  import NavBar from "../navigation/NavBar/NavBar.svelte";

  const { Story } = defineMeta({
    title: "Marketing/Landing Page",
    parameters: {
      layout: "fullscreen",
      a11y: { test: "error" },
      docs: {
        description: {
          component: "Componha landing pages responsivas com seções independentes. Valores, prova social, preços e destinos são sempre fornecidos pelo produto consumidor.",
        },
      },
    },
  });

  const features = [
    { id: "overview", icon: "◈", title: "Visão unificada", description: "A concise product benefit, with copy supplied by the product team.", href: "#plans", linkLabel: "Explore plans" },
    { id: "control", icon: "⌘", title: "Controles claros", description: "Explain how the product gives people control over their workflow." },
    { id: "flexible", icon: "✳", title: "Feito para crescer", description: "Describe a capability without making a performance claim." },
    { id: "support", icon: "◎", title: "Suporte humano", description: "Use approved support details and response commitments here." },
  ];
  const logos = ["Atlas", "Northstar", "Helix", "Meridian"].map((name) => ({ id: name.toLowerCase(), name }));
  const metrics = [
    { id: "availability", label: "Availability", value: "Your metric", description: "Replace with an approved, measured value." },
    { id: "teams", label: "Teams served", value: "Your metric", description: "Use verified product data." },
    { id: "support", label: "Support hours", value: "Your metric", description: "Publish only a confirmed commitment." },
  ];
  const testimonials = [
    { id: "approved-quote", quote: "Approved testimonial copy goes here. Replace this placeholder before publishing.", author: "Customer name", role: "Role and organization" },
  ];
  const plans = ["Starter", "Professional", "Enterprise"].map((name, index) => ({
    id: name.toLowerCase(),
    name,
    description: "Illustrative plan description. Confirm the offer with the product team.",
    price: "Your price",
    period: "as configured by the product",
    features: ["Approved plan feature", "Confirmed service detail", "Plan limits supplied by the app"],
    action: { label: "View plan details", href: "#contact", variant: index === 1 ? "primary" as const : "secondary" as const },
    badge: index === 1 ? "Example highlight" : undefined,
    highlighted: index === 1,
  }));
  const questions = [
    { id: "security", question: "Where do product answers come from?", answer: "Supply accurate, approved answers from the product team." },
    { id: "contact", question: "How can I learn more?", answer: "Replace this sample response with the supported contact route." },
  ];
  const footerGroups = [
    { id: "product", label: "Product", links: [{ label: "Features", href: "#features" }, { label: "Plans", href: "#plans" }] },
    { id: "company", label: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
  ];
</script>

{#snippet landingPage()}
  <div class="cy-marketing-demo">
    <NavBar
      sticky={false}
      brand={{ label: "Cyberdyne", href: "#top" }}
      items={[
        { label: "Features", href: "#features" },
        { label: "Plans", href: "#plans" },
        { label: "FAQ", href: "#faq" },
      ]}
    />
    <HeroSection
      id="top"
      eyebrow="Landing page component example"
      title="A clearer way to move your work forward."
      description="A flexible hero section for product messaging, with calls to action and a media area owned by your application."
      actions={[
        { label: "Explore features", href: "#features" },
        { label: "View plans", href: "#plans", variant: "secondary" },
      ]}
    >
      {#snippet media()}
        <div class="cy-marketing-demo__preview" role="img" aria-label="Illustrative product dashboard preview">
          <span>PRODUCT OVERVIEW · EXAMPLE</span>
          <div aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
      {/snippet}
    </HeroSection>
    <LogoCloud id="about" heading="Logos supplied by your product team" description="Only add organizations that have approved their logo and attribution." logos={logos} />
    <FeatureGrid id="features" eyebrow="Product features" heading="The details that make a difference" description="Use short, specific copy for the benefits your product can substantiate." features={features} variant="bento" columns={3} />
    <StatsSection heading="Metrics section example" description="Placeholder values below are not product claims. Replace with verified data or omit this section." metrics={metrics} columns={3} />
    <TestimonialGrid heading="Customer stories" description="This is placeholder copy. Publish only customer statements and names approved for use." testimonials={testimonials} columns={2} tone="muted" />
    <PricingTable id="plans" heading="Plans shaped around your needs" description="Prices and plan terms are illustrative placeholders supplied by this story." plans={plans} footnote="Replace plan details, billing terms, and destinations before publishing." />
    <FAQSection id="faq" heading="Frequently asked questions" description="Use this section for clear answers to common product questions." items={questions} tone="muted" />
    <CTASection id="contact" heading="Ready to take the next step?" description="Describe the next step and link it to an action supported by your product." actions={[{ label: "Talk with our team", href: "mailto:hello@example.com" }]} />
    <MarketingFooter brand="Cyberdyne" description="A shared design system for Cyberdyne products." groups={footerGroups} legalLinks={[{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }]} copyright="© Cyberdyne · Example page" />
  </div>
{/snippet}

<Story name="Complete page">{@render landingPage()}</Story>

<!-- Keep viewport variants on the same data and content as the desktop recipe. -->
<Story name="Mobile layout" globals={{ viewport: { value: "mobile1", isRotated: false } }}>
  {@render landingPage()}
</Story>

<Story name="Centered hero">
  <HeroSection
    id="centered-hero"
    layout="centered"
    align="center"
    eyebrow="Centered variant"
    title="Tell your product story."
    description="A centered hero also supports an application-provided media snippet."
    actions={[{ label: "Explore", href: "#features" }]}
  />
</Story>

<style>
  .cy-marketing-demo { color: var(--color-text-primary); background: var(--color-bg-primary); }
  .cy-marketing-demo__preview { display: grid; aspect-ratio: 1.35; align-content: space-between; overflow: hidden; border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); padding: clamp(1rem, 4vw, 2rem); background: linear-gradient(145deg, var(--color-surface-raised), var(--color-bg-primary)); box-shadow: var(--shadow-raised); }
  .cy-marketing-demo__preview > span { color: var(--color-text-secondary); font: 600 .72rem/1.4 var(--font-mono); letter-spacing: .08em; }
  .cy-marketing-demo__preview > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: .7rem; align-items: end; height: 55%; }
  .cy-marketing-demo__preview i { display: block; min-height: 2rem; border-radius: .3rem .3rem 0 0; background: var(--color-action-brand-default); opacity: .68; }
  .cy-marketing-demo__preview i:nth-child(1) { height: 48%; }
  .cy-marketing-demo__preview i:nth-child(2) { height: 76%; }
  .cy-marketing-demo__preview i:nth-child(3) { height: 100%; }
</style>
