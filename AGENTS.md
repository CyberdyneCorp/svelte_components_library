# Guidance for this repository

These instructions adapt the team's global AI coding guidance to this Svelte 5 component library. Follow them alongside `openspec/`, package scripts, and more specific instructions in child directories.

## Changes and maintainability

- Use OpenSpec for medium or large changes and any work affecting authentication, billing, security, or data models. Review the proposal, design, and tasks with the user before implementing a new medium or large capability.
- Keep designs readable and simple to extend. Prefer TypeScript for new scripts and APIs.
- For frontend functions, use the repository's cognitive-complexity skill when reviewing or refactoring complex logic. Aim for a Cognitive Complexity score of 8–12 per function; flag a genuinely irreducible function rather than distorting its design to meet a number.
- Keep Svelte components composable and themeable through the foundation tokens. Components report application actions through typed props/callbacks; product services and integrations belong to the consuming application.

## Tests and documentation

- A bug fix needs a meaningful regression test in the same change when the active task and tooling permit it. Test the observed behavior and edge case; avoid tests that merely repeat the implementation.
- When behavior or a public API changes, update the relevant OpenSpec capability, Storybook usage examples, and README/package documentation in the same change.
- Use this workspace's `pnpm` scripts and report the exact checks and results. State when a configured test project cannot run and why; do not imply that unexecuted browser, SSR, or visual checks passed.

## Review and verification

- Review all changed files for correctness, accessibility, package exports, security, and coverage. Use the repository's code-review skill when reviewing a substantive code diff; apply only architecture checks that fit this Svelte component-library context.
- Before calling a warning or failure pre-existing, run the same relevant check on `main` and compare the results. Otherwise, report the current result without assigning its origin.
- Keep commits technical and concise. Pull requests need a descriptive title and body that explain the behavior change and its verification.
