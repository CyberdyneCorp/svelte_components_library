# Marketing sections for Cyberdyne landing pages

## Why

The current public library has 260 components but no dedicated marketing section layer. Cyberdyne landing pages must repeatedly compose heroes, feature grids, social proof, pricing, FAQs and conversion sections. Existing primitives and themes provide a suitable foundation.

See `documentation/FRONTEND_COVERAGE.md` for the broader product assessment. This proposal addresses one bounded gap; it does not claim that implementing it completes the financial products.

## What Changes

Add `marketing/` with ten composable public components:

- `MarketingSection`: spacing, width, surface and heading conventions.
- `HeroSection`: centered and split layouts, action and media snippets.
- `FeatureGrid`: regular and bento presentation of caller-provided features.
- `LogoCloud`: static responsive customer/partner logos with accessible names.
- `TestimonialGrid`: caller-provided quotes and attribution.
- `PricingTable`: caller-provided plans, formatted prices and action links.
- `FAQSection`: native disclosure behavior with caller-provided content.
- `CTASection`: heading, description and caller-provided actions.
- `MarketingFooter`: grouped links and legal/copyright content.
- `StatsSection`: caller-provided metrics, with no fabricated proof or growth counters.

Add a complete fictional Cyberdyne landing recipe in Storybook using existing NavBar/Button/theme capabilities. Include bento, calm and dark examples, responsive checks, keyboard interactions and failing axe checks. No new dependencies are expected.

## Capabilities

### New Capabilities

- `marketing-sections`: reusable accessible marketing sections and a full-page composition.

### Modified Capabilities

None. Reuse public primitives without breaking their existing APIs.

## Non-goals

Product backends, authentication, checkout, payment collection, financial calculations, deployment, CMS integration, tracking, invented customer endorsements or performance claims. Market4Me domain components are excluded until its workflows are known.

## Impact

`packages/ui/core/src/lib/marketing/`, core exports, stories/fixtures, tests, README and a minor core changeset. Foundation tokens are reused; add tokens only if an existing semantic token cannot express the needed role. Do not copy or replace existing navigation and financial components.

## Status

Draft for scope review. No marketing components are implemented by this proposal. The suggested component names and acceptance criteria are concrete enough to review; confirm the first delivery scope before implementation under the OpenSpec workflow.
