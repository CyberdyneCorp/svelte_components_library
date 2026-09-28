## 1. Packaging

- [x] 1.1 Change foundation `files` to `"src", "!src/**/*.test.ts", "!src/stories"`
- [x] 1.2 Make `scripts/check-package-contents.mjs` pack with `pnpm pack` and check core and foundation (forbidden files, `exports` targets, relative imports)
- [x] 1.3 Confirm `pnpm check:package` fails with the old foundation `files` and passes with the new one
- [x] 1.4 Add a patch changeset for foundation
