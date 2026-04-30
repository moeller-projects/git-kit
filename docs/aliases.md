# git-kit aliases

Generated from `aliases/aliases.yml`.

## branch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cob` | `checkout -b` | Create and checkout a new branch | safe |

## commit

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cm` | `commit -m` | Commit with message | safe |
| `amend` | `commit --amend --no-edit` | Amend last commit without editing message | medium |

## core

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `s` | `status --short --branch` | Compact status with branch info | safe |
| `co` | `checkout` | Checkout branch or path | safe |

## push

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `pf` | `push --force-with-lease` | Safer force push | medium |
