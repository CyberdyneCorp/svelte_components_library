# Design

## Composition

Use Svelte 5 typed props and snippets, semantic HTML and foundation CSS variables. Each section is independently importable through the existing core entrypoint. MarketingSection establishes layout conventions; other sections reuse it when this preserves semantics. Avoid a page-builder schema or a monolithic LandingPage component.

A consumer owns the h1/page structure, link destinations, content, pricing and business actions. Section heading levels are configurable and have sensible h2 defaults; HeroSection defaults to h1. IDs supplied by the consumer enable anchor navigation. No random IDs, browser globals at module scope or network calls.

## Visual behavior

Provide centered/split heroes, regular/bento feature grids, optional background/media snippets and token-based surfaces. Use content-first responsive grids and avoid animation as a prerequisite for readability. Default social-proof sections are static; no auto-scrolling marquee or automatic testimonial rotation. Respect prefers-reduced-motion for any optional transitions.

## Data and contracts

Use stable caller-provided item IDs. Action links require href and label; custom actions can be supplied as snippets. Plan prices are consumer-formatted text with explicit period/tax notes, not floating-point calculations. A consumer may replace the entire plans array when billing period changes; the initial component does not infer discounts or manage payment state. Empty collections render no empty landmark. Feature media has explicit alt text or is marked decorative.

FAQ uses native details/summary unless evidence requires existing Accordion. Any departure must retain keyboard support and server-rendered content. Footer links remain real anchors. Snippet content remains the consumer's accessibility responsibility, documented in examples.

## Verification

Behavior tests cover links, empty/optional content, FAQ keyboard interaction and pricing updates. Browser stories fail on axe violations. A complete page is tested at 360/768/1440 px and in calm/light/dark plus bento styling. Verify reduced motion and long pt-BR copy. SSR and hydration tests must use a real SvelteKit consumer and the packed package, not only the Storybook source alias.

## Compatibility and release

All changes are additive. No dependency upgrades or existing API migrations. A minor core changeset is appropriate after implementation and verification. Keep this draft active until implementation is reviewed and merged; archive only afterward.
