## ADDED Requirements

### Requirement: Design-style preset exports

The foundation package SHALL expose the design-style presets through a `./themes/styles/*.css` subpath pattern that points to `./src/lib/themes/styles/*.css`. (src: packages/ui/foundation/package.json)

#### Scenario: Consumer imports a preset

- **WHEN** an app imports `@cyberdynecorp/svelte-ui-foundation/themes/styles/glass.css`
- **THEN** it SHALL resolve through the package `exports` map
