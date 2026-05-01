# AGENTS.md — git-kit

Agent instructions for working in the `git-kit` repository.

---

## Project Overview

`git-kit` is a modular Git alias distribution toolkit written in TypeScript and
run with [Bun](https://bun.sh). It installs a managed Git include file rather
than overwriting a user's existing aliases.

---

## Project Structure

```
aliases/      # YAML alias definitions, one file per Git category
profiles/     # JSON profiles (lazy, minimal, power) that select alias subsets
src/
  cli.ts      # CLI entry point (Commander)
  commands/   # One file per CLI sub-command (install, uninstall, list, …)
  core/       # Shared utilities: alias loading, gitconfig I/O, paths, logger
test/         # Bun test files (*.test.ts)
generated/    # Auto-generated gitconfig alias file — DO NOT hand-edit
docs/         # Auto-generated alias documentation — DO NOT hand-edit
dist/         # Build output — DO NOT commit
```

> `generated/` and `docs/` are produced by `bun run generate`. Never edit them
> manually; changes will be overwritten and will cause CI to fail.

---

## Build, Test, and Development Commands

Install dependencies first (required before any other command):

```bash
bun install
```

| Purpose | Command |
|---------|---------|
| Generate alias config & docs | `bun run generate` |
| Run all tests | `bun test` |
| Build CLI to `dist/` | `bun run build` |
| Validate generated files are up-to-date | `bun run validate` |
| Run installation/config health checks | `bun run doctor` |

### CI sequence (mirrors `.github/workflows/ci.yml`)

```bash
bun install
bun run generate
bun test
bun run build
git diff --exit-code   # fails if generated files are stale
```

Always run `bun run generate` before committing when you modify files under
`aliases/` or `profiles/`, otherwise CI will fail on the `git diff` check.

---

## Coding Style & Naming Conventions

- **Language**: TypeScript with strict mode (`"strict": true` in `tsconfig.json`).
- **Module format**: ESNext modules (`"type": "module"` in `package.json`); use `.js` extensions in import paths (even when importing `.ts` sources).
- **Runtime**: Bun — do not add Node-specific APIs that Bun does not support.
- **Formatting**: Match the existing indentation (2-space) and quote style in
  each file.
- **File names**: kebab-case for source files; match Git category names for
  alias YAML files (e.g., `commit.yml`, `rebase.yml`).

---

## Alias Definitions

Aliases live in `aliases/*.yml`. Each file corresponds to a Git topic. When
adding or changing aliases:

1. Edit the relevant YAML file under `aliases/`.
2. Run `bun run generate` to regenerate `generated/` and `docs/`.
3. Run `bun test` to ensure nothing is broken.
4. Commit both the YAML change and the regenerated files together.

Profiles (`profiles/*.json`) list alias names to include per profile tier
(`lazy`, `minimal`, `power`). Update the appropriate profile file if a new
alias should be opt-in by default.

---

## Testing Guidelines

- Test files live in `test/` and must follow the `*.test.ts` naming pattern.
- Use Bun's built-in test runner (`bun test`) — no external test framework.
- Each `core/` module has a corresponding test file; maintain this 1-to-1
  relationship when adding new modules.
- Do not delete or disable existing tests.

---

## Commit & Pull Request Guidelines

- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Keep commits focused; do not bundle alias changes with CLI refactors in a
  single commit.
- Every PR that touches `aliases/` or `profiles/` must include the regenerated
  `generated/` and `docs/` files.
- Run `bun run validate` locally before opening a PR to confirm generated files
  are current.

---

## Security & Configuration Tips

- **Do not commit** anything under `dist/` or `node_modules/`.
- **Do not commit** secrets, tokens, or machine-specific paths.
- The `uninstall` command removes the managed include from the user's global
  Git config — treat it as a destructive operation; call it only when
  explicitly requested.
- `bun run validate` runs `bun run generate` internally and then diffs — it
  mutates `generated/` and `docs/` as a side effect. Do not run it if you
  have uncommitted manual edits to those directories.
- Elevated permissions are not required; git-kit operates only on user-level
  Git config (`~/.gitconfig` or `%USERPROFILE%\.gitconfig`).
