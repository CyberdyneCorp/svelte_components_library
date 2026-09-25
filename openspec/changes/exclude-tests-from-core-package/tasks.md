## 1. Packaging

- [x] 1.1 Exclude tests, stories and `_testdata` from core `files`
- [x] 1.2 Add `scripts/check-package-contents.mjs` + `pnpm check:package`, and confirm it fails with main's config (1335 problems)
- [x] 1.3 Run it in `.github/workflows/test.yaml` after `pnpm build`
- [x] 1.4 Changeset (patch, core)
