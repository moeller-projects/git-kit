# git-kit

`git-kit` is a modular Git alias distribution toolkit.

The first version only distributes aliases. It installs a managed Git include file instead of overwriting your existing aliases.

## Installation

```bash
npm install -g git-kit
```

## Usage

```bash
git-kit install
git-kit list
git-kit doctor
git-kit uninstall
```

`git-kit` uses Git include files. It generates a managed alias config file and adds a single include reference to your global Git config.

It does not overwrite user aliases, and it only removes the `git-kit` managed include during uninstall.

Managed files are stored here:

- Windows: `%APPDATA%/git-kit`
- macOS/Linux: `~/.config/git-kit`

## Development

```bash
bun install
bun run generate
bun test
bun run build
```
