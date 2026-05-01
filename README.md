# git-kit

[![CI](https://github.com/moeller-projects/git-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/moeller-projects/git-kit/actions/workflows/ci.yml)

A modular Git alias distribution toolkit. Installs a curated set of Git aliases via a managed include file — without touching your existing configuration.

## Features

- Installs Git aliases through a managed include file, not by overwriting your config
- Supports profiles (`minimal`, `lazy`, `power`) for different alias sets
- Safe uninstall that only removes the `git-kit`-managed include
- Cross-platform: macOS, Linux, and Windows

## Requirements

- [Git](https://git-scm.com/) 2.x or later
- [Node.js](https://nodejs.org/) 18 or later (for npm install)

## Installation

```bash
npm install -g @lukasmoeller/git-kit
```

## Usage

### Install aliases

Install the default alias profile:

```bash
git-kit install
```

Install a specific profile:

```bash
git-kit install --profile minimal
git-kit install --profile lazy
git-kit install --profile power
```

### List aliases

List all available aliases:

```bash
git-kit list
```

List aliases for a specific profile:

```bash
git-kit list --profile power
```

### List profiles

```bash
git-kit profiles
```

### Update aliases

Update the managed alias file with the latest aliases:

```bash
git-kit update
```

### Check installation

```bash
git-kit doctor
```

### Uninstall

```bash
git-kit uninstall
```

## Configuration

`git-kit` writes a managed alias config file and adds a single `[include]` entry to your global Git config. Your existing aliases are not modified.

Managed files are stored at:

- **macOS/Linux:** `~/.config/git-kit`
- **Windows:** `%APPDATA%/git-kit`

### Profiles

| Profile | Description |
| --- | --- |
| `minimal` | Essential day-to-day aliases only |
| `lazy` | Comfortable aliases for everyday development |
| `power` | Full alias set for power users |

See [docs/aliases.md](docs/aliases.md) for the complete alias reference.

## Development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Generate alias configs and docs:

   ```bash
   bun run generate
   ```

3. Run tests:

   ```bash
   bun test
   ```

4. Build:

   ```bash
   bun run build
   ```

5. Validate generated files are up to date:

   ```bash
   bun run validate
   ```

## License

MIT
