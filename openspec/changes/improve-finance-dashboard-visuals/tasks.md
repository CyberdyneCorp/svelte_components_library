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

## Cash flow presentation follow-up

- [x] Use existing KpiCard value snippets and theme tokens for blue income and red outflows.
- [x] Add synthetic decreasing-balance controls with zero warning, negative Alert and reset.
- [x] Verify the transition and reset in Chromium; all 7 finance E2E checks pass.
- Application balance calculations, persistence and external notifications remain outside this synthetic presentation example.

## Review adjustments

- [x] Keep simulated table rows and summary totals consistent, including reset and filtering.
- [x] Add a labelled local warning threshold selector; zero and negative alerts take precedence.
- [x] Add exact blue/red color assertions for calm light and dark, plus table and threshold regressions.

- Verification: 9 Chromium finance regressions and 3 Finance Dashboard Storybook checks passed. `pnpm check` completed with zero errors (core: 30 warnings). Individual OpenSpec strict validation and diff whitespace checks passed.
- Removed the finance story's fixed dark global so URL/toolbar theme selection is respected; exact color regressions now confirm both calm themes.

## Repository validation repair

- [x] Compare global strict validation on the branch and origin/main: both failed on the same 14 entries before repair.
- [x] Move 67 long normative bodies into explicit contract scenarios while retaining short requirement summaries. All original contract text is preserved verbatim; no validator options or thresholds are relaxed.
- [x] Verify full strict validation: 18 passed, zero failed. Check full-text preservation and diff whitespace.
- The application test job for commit 89d1794 passed in CI; final documentation repair triggers a fresh CI run.
