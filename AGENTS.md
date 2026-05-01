# Repository Guidelines

## Project Overview

`git-kit` is a modular Git alias distribution toolkit written in TypeScript and executed with the [Bun](https://bun.sh) runtime. It distributes Git aliases via managed include files without overwriting user configuration.

## Project Structure

```
aliases/          # YAML alias definitions (one file per category)
profiles/         # JSON profile definitions (curated alias subsets)
generated/        # Auto-generated gitconfig files — do not edit by hand
docs/             # Auto-generated documentation — do not edit by hand
src/
  cli.ts          # CLI entry point (Commander)
  commands/       # One file per CLI sub-command
  core/           # Shared library modules (aliases, gitconfig, installer, …)
test/             # Bun test files (*.test.ts)
```

> **`generated/` and `docs/` are derived from `aliases/` and `profiles/`.** Always run `bun run generate` after modifying those source directories and commit the updated output.

## Build, Test, and Development Commands

Install dependencies before first use:

```bash
bun install
```

| Task | Command |
|------|---------|
| Generate gitconfig and docs | `bun run generate` |
| Run all tests | `bun test` |
| Build distributable CLI | `bun run build` |
| Validate generated files are up-to-date | `bun run validate` |
| Run installation/config checks | `bun run doctor` |

**CI sequence** (must all pass before merging):

```bash
bun install
bun run generate
bun test
bun run build
git diff --exit-code   # fails if generated files are stale
```

There is no dedicated lint script. TypeScript type-checking is performed implicitly by Bun during test and build.

## Coding Style & Naming Conventions

- Language: **TypeScript** (strict mode, `ES2022` target, ESM modules).
- All source files live under `src/`; test files live under `test/` with the suffix `.test.ts`.
- Module resolution uses Bun's bundler mode — import paths must include the `.js` extension (e.g., `'./core/aliases.js'`).
- Keep functions small and single-purpose. Shared logic belongs in `src/core/`; CLI wiring belongs in `src/commands/`.
- No linter is configured — follow the style of the surrounding code.

## Alias Authoring Conventions

Aliases are defined in `aliases/<category>.yml`. Each entry must include all four required fields:

```yaml
aliases:
  <alias-name>:
    command: <git sub-command or shell expression>
    description: <single-sentence description>
    category: <category string>
    risk: safe | medium | dangerous
```

**Risk rules:**
- `safe` — read-only or non-destructive commands.
- `medium` — rewrites history, amends commits, or has side effects.
- `dangerous` — discards or permanently deletes data.
- Shell aliases (command starts with `!`) **must** have risk `medium` or `dangerous`.

After editing any alias YAML file, run `bun run generate` and commit the updated `generated/` and `docs/` output.

## Profile Authoring Conventions

Profiles are defined in `profiles/<name>.json` and include a curated list of generated gitconfig file names:

```json
{
  "name": "<profile-name>",
  "description": "<short description>",
  "includes": ["core.gitconfig", "shortcuts.gitconfig"]
}
```

Available gitconfig filenames match the alias category files in `generated/`.

## Testing Guidelines

- Tests live in `test/*.test.ts` and use the native Bun test runner.
- Run tests with `bun test`.
- Cover new core logic in `src/core/` with unit tests. CLI command wiring (`src/commands/`) does not require separate tests if the underlying logic is covered.
- Do not remove or skip existing tests.

## Commit & Pull Request Guidelines

- Keep commits focused on a single concern.
- Always regenerate and commit `generated/` and `docs/` when alias or profile source files change.
- CI enforces `git diff --exit-code` — stale generated files will fail the build.
- PR descriptions should summarize what changed and why.

## Safety Constraints

- **Do not hand-edit `generated/` or `docs/`.** These files are fully managed by `bun run generate`.
- **Do not commit secrets or credentials.** The installer reads the user's global Git config — never log or expose config values.
- `bun run doctor` is read-only and safe to run at any time.
- Commands that modify the user's global Git config (`install`, `uninstall`, `update`) are destructive to the user's environment — test them carefully before release.
