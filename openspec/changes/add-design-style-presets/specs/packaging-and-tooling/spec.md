## ADDED Requirements

### Requirement: Design-style preset exports

The foundation package SHALL expose each design-style preset as an explicit `./themes/<name>.css` subpath export that points to `./src/lib/themes/<name>.css`, alongside `./themes/calm.css`. (src: packages/ui/foundation/package.json)

#### Scenario: Consumer imports a preset

- **WHEN** an app imports `@cyberdynecorp/svelte-ui-foundation/themes/glass.css`
- **THEN** it SHALL resolve through the package `exports` map
