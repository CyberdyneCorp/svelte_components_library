## ADDED Requirements

### Requirement: Composable marketing sections
The library SHALL export MarketingSection, HeroSection, FeatureGrid, LogoCloud, TestimonialGrid, PricingTable, FAQSection, CTASection, MarketingFooter and StatsSection as additive Svelte 5 components with typed props and documented snippet extension points.

#### Scenario: Compose a complete landing page
- **WHEN** a consumer combines the sections with existing navigation and provides content and actions
- **THEN** the page renders real headings, links and landmarks without network calls or application-specific business logic
- **AND** centered/split hero and regular/bento feature layouts are available

### Requirement: Content and price ownership
Marketing sections SHALL render caller-provided content and SHALL NOT fabricate customers, testimonials, performance figures, discounts or financial calculations.

#### Scenario: Change a plan presentation
- **WHEN** the consumer replaces the plans with a different billing period and formatted price labels
- **THEN** PricingTable updates prices, periods and action destinations from those props
- **AND** no payment or checkout request is made by the component

#### Scenario: Omit optional collections
- **WHEN** a consumer passes an empty collection to a list-based section
- **THEN** the section does not render an empty landmark or placeholder endorsements

### Requirement: Accessible responsive presentation
Marketing sections SHALL support keyboard use, configurable heading levels, meaningful link names, semantic image descriptions, reduced motion and responsive layouts using foundation tokens.

#### Scenario: Read a landing page on a phone
- **WHEN** the full-page recipe is rendered at 360 px with long pt-BR content
- **THEN** content and actions remain available without horizontal page overflow
- **AND** the same content is readable at 768 and 1440 px

#### Scenario: Navigate FAQ by keyboard
- **WHEN** a keyboard user focuses a question and activates it
- **THEN** its answer is disclosed through native or equivalent accessible semantics
- **AND** automated axe checks for the marketing stories pass in error mode

### Requirement: Server rendering and hydration
Marketing sections SHALL render in SvelteKit on the server and hydrate without random identity changes or browser-only module side effects.

#### Scenario: Consume the packed library
- **WHEN** a SvelteKit fixture imports the published-format package and renders the landing recipe on the server before hydration
- **THEN** the content exists in the server response and hydrates without mismatch warnings
- **AND** the consumer can use marketing sections without installing optional Cesium
