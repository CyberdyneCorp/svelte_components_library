## 1. Review

- [x] Inspect deployed overview, portfolio, bills and transactions at desktop/mobile widths.
- [x] Compare observed patterns with current shared components and prepare synthetic visual prototype.
- [x] Review proposal, design, tasks and prototype with the user before implementation.

## 2. Implement

- [x] Add responsive PageHeader layout with regression coverage.
- [x] Extend KpiCard with backward-compatible emphasis/valueTone options and tests.
- [x] Extend existing FilterBar with backwards-compatible snippet mode, stories and semantic tests.
- [x] Add AllocationBreakdown component, exports, stories and numeric-edge-case tests.
- [x] Add synthetic finance dashboard/transactions compositions, integration guide and changeset.

## 3. Verify and deliver

- [x] Run OpenSpec strict validation and relevant unit/type/lint/build/package checks.
- [x] Verify desktop/mobile rendering and accessibility using configured browser checks.
- [x] Perform substantive review with code-review skill and resolve findings.
- [x] Show implemented visual results locally and report application adoption steps.

## Verification notes

- 61 focused unit tests, 23 Storybook tests and 6 Chromium E2E tests passed. Finance and allocation stories enforce accessibility failures.
- `pnpm check`, build and package-content validation passed. Lint reports 292 warnings, and core svelte-check reports 30 warnings; the same checks on origin/main report the same counts.
- The new OpenSpec change passes strict validation. Global strict validation reports the same 14 failed entries on origin/main (3 passed) and this branch (4 passed). No unrelated specifications were changed.
- Local implementation was visually inspected and captured at desktop/mobile widths. The deployed CyberWealth was inspected read-only; adopting these components requires application-source changes.

## CI follow-up

- CI exposed use of `$props.id()`, introduced after the supported Svelte 5.0 peer minimum. Removed that API and kept the explanatory paragraph within the labelled allocation region; the existing peer-compatibility guard and allocation tests pass (7 tests).
- Allocation accessibility stories pass after the correction (3 tests). Check, build and package contents pass again. MarkdownEditor stories pass in isolation (8 tests); its full-suite runner failure is not classified as pre-existing or resolved until CI confirms.
