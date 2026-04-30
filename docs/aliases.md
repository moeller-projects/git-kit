# git-kit aliases

Generated from `aliases/`.

## branch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cob` | `checkout -b` | Create and checkout a new branch | safe |
| `br` | `branch` | List local branches | safe |
| `brd` | `branch -d` | Delete a merged branch | medium |
| `brdf` | `branch -D` | Force-delete a branch regardless of merge status | dangerous |
| `recent` | `branch --sort=-committerdate --format=%(refname:short)` | List branches sorted by most recent commit | safe |

## commit

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cm` | `commit -m` | Commit with message | safe |
| `amend` | `commit --amend --no-edit` | Amend last commit without editing the message | medium |
| `fixup` | `commit --fixup` | Create a fixup commit targeting a specific commit | medium |
| `wip` | `!git add -A && git commit -m 'wip'` | Stage all changes and create a WIP commit | medium |

## core

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `s` | `status --short --branch` | Compact status with branch info | safe |
| `co` | `checkout` | Checkout branch or path | safe |
| `unstage` | `restore --staged` | Unstage files from the index | safe |
| `discard` | `restore` | Discard working directory changes | medium |
| `root` | `rev-parse --show-toplevel` | Print the repository root directory | safe |

## diff

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `df` | `diff` | Show unstaged changes | safe |
| `dc` | `diff --cached` | Show staged changes | safe |
| `dw` | `diff --word-diff` | Show word-level diff for unstaged changes | safe |
| `ds` | `diff --stat` | Show a summary of changed files | safe |

## log

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `lg` | `log --oneline --graph --decorate --all` | Graphical oneline log of all branches | safe |
| `ll` | `log --oneline --decorate -20` | Last 20 commits as oneliners | safe |
| `lp` | `log --pretty=format:'%C(yellow)%h%Creset %ad %s %C(green)(%an)%Creset%C(auto)%d' --date=short` | Pretty oneline log with date and author | safe |
| `lf` | `log --oneline --stat` | Oneline log with changed file stats | safe |
| `who` | `shortlog -sn --no-merges` | Show commit count per contributor | safe |
| `today` | `log --since=midnight --oneline` | Show commits made since midnight | safe |

## rebase

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `rb` | `rebase` | Rebase the current branch | medium |
| `rbi` | `rebase -i` | Start an interactive rebase | medium |
| `rbc` | `rebase --continue` | Continue an in-progress rebase | medium |
| `rba` | `rebase --abort` | Abort an in-progress rebase | safe |
| `cp` | `cherry-pick` | Apply a commit from another branch | medium |

## remote

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `pf` | `push --force-with-lease` | Safer force push using force-with-lease | medium |
| `f` | `fetch --all --prune` | Fetch from all remotes and prune deleted branches | safe |
| `pl` | `pull --rebase` | Pull with rebase instead of merge | safe |

## stash

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ss` | `stash push -m` | Stash changes with a descriptive message | safe |
| `sp` | `stash pop` | Apply and remove the latest stash entry | safe |
| `sl` | `stash list` | List all stash entries | safe |
| `sd` | `stash drop` | Drop the latest stash entry | medium |
