# git-kit aliases

Generated from `aliases/`.

## add

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `aa` | `add --all` | Add all files including untracked | medium |
| `ap` | `add --patch` | Add files interactively by patch | medium |
| `au` | `add --update` | Add only updated (already tracked) files | medium |
| `edit-unmerged` | `!f() { files=$(git ls-files --unmerged | cut -f2 | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all unmerged files in the editor during a merge conflict | medium |

## analytics

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `log-of-format-and-count` | `!f() { format="$1"; shift; git log "$@" --format=oneline --format="$format" | awk '{a[$0]++}END{for(i in a){print i, a[i], int((a[i]/NR)*100) "%"}}' | sort; }; f` | Count log entries grouped by a format string (ascending) | medium |
| `log-of-count-and-format` | `!f() { format="$1"; shift; git log "$@" --format=oneline --format="$format" | awk '{a[$0]++}END{for(i in a){print a[i], int((a[i]/NR)*100) "%", i}}' | sort -nr; }; f` | Count log entries grouped by a format string (descending) | medium |
| `log-of-format-and-count-with-date` | `!f() { format="$1"; shift; date_format="$1"; shift; git log "$@" --format=oneline --format="$format" --date=format:"$date_format" | awk '{a[$0]++}END{for(i in a){print i, a[i], int((a[i]/NR)*100) "%"}}' | sort -r; }; f` | Count log entries by format string and date (ascending) | medium |
| `log-of-count-and-format-with-date` | `!f() { format="$1"; shift; date_format="$1"; shift; git log "$@" --format=oneline --format="$format" --date=format:"$date_format" | awk '{a[$0]++}END{for(i in a){print a[i], int((a[i]/NR)*100) "%", i}}' | sort -nr; }; f` | Count log entries by format string and date (descending) | medium |
| `log-of-email-and-count` | `!f() { git log-of-format-and-count "%aE" "$@"; }; f` | Count commits per author email (ascending) | medium |
| `log-of-count-and-email` | `!f() { git log-of-count-and-format "%aE" "$@"; }; f` | Count commits per author email (descending) | medium |
| `log-of-day-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m-%d" "$@" ; }; f` | Count commits per calendar day (ascending) | medium |
| `log-of-count-and-day` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m-%d" "$@" ; }; f` | Count commits per calendar day (descending) | medium |
| `log-of-week-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y#%V" "$@"; }; f` | Count commits per ISO week (ascending) | medium |
| `log-of-count-and-week` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y#%V" "$@"; }; f` | Count commits per ISO week (descending) | medium |
| `log-of-hour-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m-%dT%H" "$@" ; }; f` | Count commits per hour (ascending); niche — prefer day/week granularity for daily use | medium |
| `log-of-count-and-hour` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m-%dT%H" "$@" ; }; f` | Count commits per hour (descending); niche — prefer day/week granularity for daily use | medium |
| `log-of-month-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m" "$@" ; }; f` | Count commits per calendar month (ascending) | medium |
| `log-of-count-and-month` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m" "$@" ; }; f` | Count commits per calendar month (descending) | medium |
| `chart` | `!f() { git log --format=oneline --format="%aE %at" --since=6-weeks-ago "$*" | awk ' function time_to_slot(t) { return strftime("%Y-%m-%d", t, true) } function count_to_char(i) { return (i > 0) ? ((i < 10) ? i : "X") : "." } BEGIN { time_min = systime(); time_max = 0; SECONDS_PER_DAY=86400; } { item = $1; time = 0 + $2; if (time > time_max){ time_max = time } else if (time < time_min){ time_min = time }; slot = time_to_slot(time); items[item]++; slots[slot]++; views[item, slot]++; } END{ printf("Chart time range %s to %s.\\n", time_to_slot(time_min), time_to_slot(time_max)); time_max_add = time_max += SECONDS_PER_DAY; for(item in items){ row = ""; for(time = time_min; time < time_max_add; time += SECONDS_PER_DAY) { slot = time_to_slot(time); count = views[item, slot]; row = row count_to_char(count); } print row, item; } }'; }; f` | Show a per-author activity chart for the past 6 weeks | medium |
| `churn` | `!f() { git log --all --find-copies --find-renames --name-only --format='format:' "$@" | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn;};f` | Show files sorted by how frequently they change (most-churned first) | medium |
| `summary` | `!f() { printf "Summary of this branch...\n"; printf "%s\n" "$(git current-branch)"; printf "%s first commit timestamp\n" "$(git log --date-order --format=%cI | tail -1)"; printf "%s last commit timestamp\n" "$(git log -1 --date-order --format=%cI)"; printf "\nSummary of counts...\n"; printf "%d commit count\n" "$(git rev-list --count HEAD)"; printf "%d date count\n" "$(git log --format=oneline --format="%ad" --date=format:"%Y-%m-%d" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d tag count\n" "$(git tag | wc -l)"; printf "%d author count\n" "$(git log --format=oneline --format="%aE" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d committer count\n" "$(git log --format=oneline --format="%cE" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d local branch count\n" "$(git branch | grep -vc " -> ")"; printf "%d remote branch count\n" "$(git branch --remotes | grep -vc " -> ")"; printf "\nSummary of this directory...\n"; printf "%s\n" "$(pwd)"; printf "%d file count via git ls-files\n" "$(git ls-files | wc -l)"; printf "%d file count via find command\n" "$(find . | wc -l)"; printf "%d disk usage\n" "$(du -s | awk '{print $1}')"; printf "\nMost-active authors, with commit count and %%...\n"; if out=$(git log-of-count-and-email 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; printf "\nMost-active dates, with commit count and %%...\n"; if out=$(git log-of-count-and-day 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; printf "\nMost-active files, with churn count\n"; if out=$(git churn 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; }; f` | Print a summary dashboard of repository metrics | medium |
| `whois` | `!sh -c 'git log --regexp-ignore-case -1 --pretty="format:%an <%ae>\n" --author="$1"' -` | Look up a contributor by name or email substring | medium |
| `who` | `shortlog --summary --numbered --no-merges` | Show commit counts per contributor (contributor leaderboard) | safe |

## branch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `heads` | `!git log "origin/$(git default-branch)".. --format='%Cred%h%Creset;%C(yellow)%an%Creset;%H;%Cblue%f%Creset' | git name-rev --stdin --always --name-only | column -t -s';'` | Show local commits not yet on origin/main | medium |
| `hew` | `!git hew-local "$@" && git hew-remote "$@" #` | Delete all merged branches locally and remotely | dangerous |
| `hew-dry-run` | `!git hew-local-dry-run "$@" && git hew-remote-dry-run "$@" #` | Preview branches that would be deleted by hew | medium |
| `hew-local` | `!f() { git hew-local-dry-run "$@" | xargs git branch --delete ; }; f` | Delete all locally merged branches | dangerous |
| `hew-local-dry-run` | `!f() { commit=${1:-$(git current-branch)}; git branch --merged "$commit" | grep -v "^[[:space:]]*\\*[[:space:]]*$commit$" ; }; f` | Preview locally merged branches to be deleted | medium |
| `hew-remote` | `!f() { git hew-remote-dry-run "$@" | xargs -I% git push origin :% 2>&1 ; }; f` | Delete all remotely merged branches | dangerous |
| `hew-remote-dry-run` | `!f() { commit=${1:-$(git upstream-branch)}; git branch --remotes --merged "$commit" | grep -v "^[[:space:]]*origin/$commit$" | sed 's#[[:space:]]*origin/##' ; }; f` | Preview remotely merged branches to be deleted | medium |
| `recent` | `branch --sort=-committerdate` | List branches sorted by most recent commit date | safe |

## checkout

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `co` | `checkout` | Checkout a branch or path | medium |
| `swb` | `switch --create` | Create and switch to a new branch (modern alternative to checkout -b, requires git >= 2.23) | medium |
| `swi` | `!f() { branch=$(git branch --format='%(refname:short)' | fzf); [ -z "$branch" ] && return; if git switch "$branch"; then echo "Switched to '$branch'."; fi; }; f` | Interactively switch branches using fzf (requires fzf) | medium |

## cherry-pick

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cp` | `cherry-pick` | Apply a commit from another branch | medium |
| `cpa` | `cherry-pick --abort` | Abort a cherry-pick in progress | medium |
| `cpc` | `cherry-pick --continue` | Continue a cherry-pick in progress | medium |

## commit

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ca` | `commit --amend` | Amend the tip of the current branch | medium |
| `cam` | `commit --amend --message` | Amend the tip of the current branch with a new message | medium |
| `cane` | `commit --amend --no-edit` | Amend the tip of the current branch without editing the message | medium |
| `cm` | `commit --message` | Commit with a message | medium |
| `wip` | `!git add --all && git commit --message=wip` | Stage all changes and commit with message "wip" | medium |
| `unwip` | `!f() { msg="$(git log -1 --pretty=%s)"; test "$msg" = "wip" || { echo "last commit message is not 'wip' (found: '${msg}')"; return 1; }; git reset HEAD~1; }; f` | Undo the last commit only if its message is exactly "wip" | medium |
| `save` | `!f() { msg="${1:-wip}"; git add --all && git commit --message "$msg"; }; f` | Stage all changes and commit with a message defaulting to wip | medium |
| `savep` | `!f() { msg="${1:-wip}"; git add --patch && git commit --message "$msg"; }; f` | Patch-stage changes and commit with a message defaulting to wip | medium |

## core

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `unstage` | `restore --staged` | Unstage changes from the index (restore --staged) | medium |
| `root` | `rev-parse --show-toplevel` | Show the top-level directory of the repository | safe |

## diff

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `dc` | `diff --cached` | Show staged changes (alias for diff --cached) | safe |
| `dw` | `diff --word-diff` | Show changes but by word, not line | safe |
| `diff-deep` | `diff --check --dirstat --find-copies --find-renames --histogram --color` | Diff with extra checks, stats, and rename detection | safe |
| `staged` | `diff --staged --stat` | Show a stat summary of staged changes | safe |
| `unstaged` | `diff --stat` | Show a stat summary of unstaged changes | safe |
| `changed` | `diff --name-status` | Show names and status of changed files | safe |
| `conflicts` | `diff --name-only --diff-filter=U` | List files with unresolved merge conflicts | safe |
| `what-changed` | `diff --name-only HEAD` | List files changed since last commit | safe |
| `what-staged` | `diff --cached --name-only` | List staged files only | safe |
| `difftooli` | `!f() { file=$(git diff --name-only | fzf); [ -n "$file" ] && git difftool -- "$file"; }; f` | Interactively open difftool for a changed file | medium |

## experimental

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `add-unmerged` | `!f() { files=$(git ls-files --unmerged | cut -f2 | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all unmerged files to the index (useful during conflict resolution) | medium |
| `edit-modified` | `!f() { files=$(git ls-files --modified | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all modified files in the editor | medium |
| `branch-commit-first` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --reverse --pretty=%H "$branch" | head -"$count"; }; f` | Show a branch's first commit hash | medium |
| `branch-commit-last` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --pretty=%H "$branch" | head -"$count"; }; f` | Show a branch's last commit hash | medium |
| `branch-clean` | `!f() { git branch | grep -v "^\*" | fzf -m --prompt="delete branches> " | xargs -r git branch -d; }; f` | Interactively select and safely delete local branches using fzf (requires fzf) | dangerous |
| `track-all-remote-branches` | `!f() { for x in $(git for-each-ref --format="%(refname:short)" --no-merged=origin/HEAD refs/remotes/origin); do git switch --track "$x"; done; }; f` | Track all remote branches as local branches (use with caution in large repos) | medium |
| `cob` | `checkout -b` | Create and checkout a new branch (legacy; prefer swb with git >= 2.23) | medium |
| `cpn` | `cherry-pick --no-commit` | Cherry-pick without committing — stages changes only | medium |
| `cherry-pick-merge` | `!sh -c 'git cherry-pick --no-commit --mainline 1 $0 && git log -1 --pretty=%P $0 | cut -b 42- > .git/MERGE_HEAD && git commit --verbose'` | Cherry-pick a merge commit by manually constructing MERGE_HEAD | medium |
| `diff-all` | `!f() { for name in $(git diff --name-only "$1"); do git difftool "$1" "$name"; done; }; f` | Open difftool for every changed file (requires a configured difftool) | medium |
| `diff-range` | `!f() { git diff "$1".."$2"; }; f` | Diff between two refs; usage git diff-range <from> <to> | medium |
| `grep-ack` | `-c color.grep.linenumber="bold yellow" -c color.grep.filename="bold green" -c color.grep.match="reverse yellow" grep --break --heading --line-number` | Find text with ack-style color formatting | safe |
| `lor` | `log --oneline --reverse` | Log with one line per commit in chronological (reverse) order | safe |
| `lfp` | `log --first-parent` | Log following only the first parent (useful in merge-heavy repos) | safe |
| `log-list-long` | `log --graph --topo-order --date=iso8601-strict --no-abbrev-commit --decorate --all --boundary --pretty=format:'%Cblue%ad %C(auto)%h%Creset -%C(auto)%d%Creset %s %Cblue[%aN <%aE>]%Creset %Cblue%G?%Creset'` | Full-detail log list with ISO-8601 dates, full SHAs, and email addresses | safe |
| `lll` | `log-list-long` | Short alias for log-list-long | safe |
| `log-1-hour` | `log --since=1-hour-ago` | Show commits from the past hour | safe |
| `log-1-month` | `log --since=1-month-ago` | Show commits from the past month | safe |
| `log-my-month` | `!git log --author "$(git config user.email)" --since=1-month-ago` | Show my commits from the past month | medium |
| `issues` | `!sh -c "git log $1 --oneline | grep -o \"ISSUE-[0-9]\+\" | sort -u"` | List ISSUE-NNN ticket IDs mentioned in commits in a range (requires consistent commit discipline) | medium |
| `mncnf` | `merge --no-commit --no-ff` | Merge without auto-commit and without fast-forward (inspect before committing) | medium |
| `merge-span` | `!f() { echo "$(git log -1 "$2" --merges --pretty=format:%P | cut -d' ' -f1)$1$(git log -1 "$2" --merges --pretty=format:%P | cut -d' ' -f2)"; }; f` | Compute the commit range introduced by a merge commit (primitive for merge-span-log/diff) | medium |
| `merge-span-log` | `!git log "$(git merge-span .. "$1")"` | Show commits introduced by a merge commit | medium |
| `merge-span-diff` | `!git diff "$(git merge-span ... "$1")"` | Show the diff introduced by a merge commit | medium |
| `prp` | `pull --rebase=merges` | Pull with rebase preserving merge commits (requires git >= 2.18) | medium |
| `remotes-push-dry-run` | `!git remote | xargs -I% -n1 git push % --dry-run` | Dry-run push to every configured remote | medium |
| `show-unreachable` | `!git fsck --unreachable | grep commit | cut -d" " -f3 | xargs git log` | Show log of unreachable (orphaned) commits for recovery archaeology | medium |
| `undo-commit-hard` | `reset --hard HEAD~1` | Hard-reset HEAD back one commit, discarding the commit and its changes permanently | dangerous |
| `undo-to-upstream` | `!git reset --hard "$(git upstream-branch)"` | Hard-reset to match the upstream tracking branch (destructive — requires upstream set) | dangerous |
| `clean-force` | `clean -dff` | Remove untracked files and directories with double-force; use clean-dry first to preview | dangerous |
| `add-alias` | `!f() { if [ $# != 3 ]; then echo "Usage: git add-alias ( --local | --global ) <alias> <command>"; echo "Error: this command needs 3 arguments."; return 2; fi; if [ -n "$(git config "$1" --get alias."$2")" ]; then echo "Alias '$2' already exists, thus no change happened."; return 3; fi; git config "$1" alias."$2" "$3" && return 0; echo "Usage: git add-alias ( --local | --global ) <alias> <command>"; echo "Error: unknown failure."; return 1; }; f` | Add a git alias to local or global config | medium |
| `move-alias` | `!f() { if [ $# != 3 ]; then echo "Usage: git move-alias ( --local | --global ) <alias existing name> <new alias name>"; echo "Error: this command needs 3 arguments."; return 2; fi; if [ "$2" = "$3" ]; then echo "The alias names are identical, thus no change happened."; return 3; fi; if [ -z "$(git config "$1" --get alias."$2")" ]; then echo "Alias '$2' does not exist, thus no change happened."; return 4; fi; if [ -n "$(git config "$1" --get alias."$3")" ]; then echo "Alias '$3' already exists, thus no change happened."; return 5; fi; git config "$1" alias."$3" "$(git config "$1" --get alias."$2")" && git config "$1" --unset alias."$2" && return 0; echo "Usage: git move-alias ( --local | --global ) <alias existing name> <alias new name>"; echo "Error: unknown failure."; return 1; };f` | Rename a git alias in local or global config | medium |
| `rev-list-all-objects-by-size` | `!git rev-list --all --objects  | awk '{print $1}'| git cat-file --batch-check | grep -F blob | sort -k3nr` | List all blobs in history sorted by size (without filenames; prefer rev-list-all-objects-by-size-and-name) | medium |
| `assume-all` | `!git status --short | awk '{ print $2 }' | xargs -r git assume` | Mark all currently dirty files as assume-unchanged (silences all dirty-file warnings — use with care) | medium |
| `serve` | `-c daemon.receivepack=true daemon --base-path=. --export-all --reuseaddr --verbose` | Start a local git daemon for LAN repository sharing | medium |
| `archive` | `!f() { top="$(git rev-parse --show-toplevel)"; cd "$top" || exit 1 ; tar cvf "$top.tar" "$top" ; }; f` | Create a tar archive of the entire repository root | medium |
| `put-dry-run` | `!git diff --cached --stat && git push --dry-run` | Preview staged changes and a push dry-run before committing and pushing | medium |
| `reincarnate` | `!f() { [ $# -gt 0 ] && git checkout "$1" && git unpublish && git checkout "$(git default-branch)" && git branch --delete --force "$1" && git checkout -b "$1" && git publish; }; f` | Delete and recreate a branch on origin (destructive — useful for resetting a PR branch) | dangerous |

## fetch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `fa` | `fetch --all` | Fetch from all remotes | safe |
| `fap` | `fetch --all --prune` | Fetch from all remotes and prune deleted branches | safe |

## grep

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `grep-all` | `!f() { git rev-list --all | xargs git grep "$@"; }; f` | Find text in any commit ever | medium |
| `grep-group` | `grep --break --heading --line-number --color` | Find text and group the output lines | safe |

## log

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `lg` | `log --graph` | Log with a graphical representation of history | safe |
| `lo` | `log --oneline` | Log with one line per commit | safe |
| `lp` | `log --patch` | Log with patch generation | safe |
| `ll` | `log-list` | Log list with preferred options (a.k.a. log-list) | safe |
| `log-fresh` | `log ORIG_HEAD.. --stat --no-merges` | Show new commits since the last fetch | safe |
| `log-list` | `log --graph --topo-order --date=short --abbrev-commit --decorate --all --boundary --pretty=format:'%Cblue%ad %C(auto)%h%Creset -%C(auto)%d%Creset %s %Cblue[%aN]%Creset %Cblue%G?%Creset'` | Preferred log list with graph, dates, and authors | safe |
| `log-my` | `!git log --author "$(git config user.email)"` | Show only commits by the current user email | medium |
| `log-1-day` | `log --since=1-day-ago` | Show commits from the past day | safe |
| `log-1-week` | `log --since=1-week-ago` | Show commits from the past week | safe |
| `log-my-day` | `!git log --author "$(git config user.email)" --since=1-day-ago` | Show my commits from the past day | medium |
| `log-my-week` | `!git log --author "$(git config user.email)" --since=1-week-ago` | Show my commits from the past week | medium |
| `log-refs` | `log --all --graph --decorate --oneline --simplify-by-decoration --no-merges` | Show decorated simplified graph of all refs | safe |
| `log-local` | `log --oneline @{upstream}..HEAD` | Show local commits not yet pushed upstream | safe |
| `log-fetched` | `log --oneline HEAD..@{upstream}` | Show fetched commits not yet merged | safe |
| `whatis` | `show --no-patch --pretty='tformat:%h (%s, %ad)' --date=short` | Briefly describe any git object | safe |
| `last` | `log -1 --oneline` | Show last commit | safe |
| `commit-search` | `!f() { git log --all --grep="$1" --oneline; }; f` | Search commits by message | medium |
| `commit-files` | `show --name-only --pretty=format:` | Show files affected by a commit | safe |
| `ahead` | `rev-list --count @{upstream}..HEAD` | Number of commits ahead of upstream | safe |
| `behind` | `rev-list --count HEAD..@{upstream}` | Number of commits behind upstream | safe |
| `diverged` | `!echo "ahead: $(git ahead) | behind: $(git behind)"` | Show divergence from upstream | medium |
| `showi` | `!f() { commit=$(git log --oneline | fzf | cut -d" " -f1); [ -n "$commit" ] && git show "$commit"; }; f` | Interactively select and show a commit | medium |
| `log-changed` | `log --follow -p --` | Show full history of a single file including renames; usage git log-changed <path> | safe |

## ls

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `untracked` | `ls-files --others --exclude-standard` | List untracked files not ignored by git | safe |
| `tracked` | `ls-files` | List all tracked files in the index | safe |
| `ignored` | `status --ignored --short` | List ignored files with short status format | safe |

## merge

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ma` | `merge --abort` | Abort an in-progress merge | medium |
| `mc` | `merge --continue` | Continue an in-progress merge | medium |
| `rebase-branch` | `!f() { git rebase --interactive "$(git merge-base "$(git default-branch)" HEAD)"; }; f` | Interactively rebase all commits on the current branch | medium |
| `ours` | `!f() { git checkout --ours   "$@" && git add "$@"; }; f` | During a merge conflict, take our version of a file | medium |
| `theirs` | `!f() { git checkout --theirs "$@" && git add "$@"; }; f` | During a merge conflict, take their version of a file | medium |

## pull

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `pf` | `pull --ff-only` | Pull only if it can fast-forward, else fail | safe |
| `pr` | `pull --rebase` | Pull with rebase for a cleaner linear history | medium |

## rebase

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `rb` | `rebase` | Rebase the current branch | medium |
| `rba` | `rebase --abort` | Abort an in-progress rebase | medium |
| `rbc` | `rebase --continue` | Continue an in-progress rebase | medium |
| `rbs` | `rebase --skip` | Skip the current patch during rebase | medium |
| `rbi` | `rebase --interactive` | Rebase interactively | medium |
| `rbiu` | `rebase --interactive @{upstream}` | Rebase interactively on unpushed commits | medium |
| `fixup` | `!f() { TARGET="$(git rev-parse "$1")"; git commit --fixup="$TARGET" && GIT_EDITOR=true git rebase --interactive --autosquash "$TARGET"~; }; f` | Create a fixup commit and immediately rebase-autosquash it | medium |
| `remote-ref` | `!local_ref="$(git symbolic-ref HEAD)"; local_name="${local_ref##refs/heads/}"; remote="$(git config branch."$local_name".remote || echo origin)"; remote_ref="$(git config branch."$local_name".merge)"; remote_name="${remote_ref##refs/heads/}"; echo "remotes/$remote/$remote_name" #` | Print the remote-tracking ref for the current branch | medium |
| `rebase-recent` | `!git rebase --interactive "$(git remote-ref)"` | Interactively rebase commits not yet pushed | medium |

## reflog

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `rl` | `reflog` | Show the reference log | safe |

## remote

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `remotes-prune` | `!git remote | xargs -r -n 1 git remote prune` | Prune all stale references for every remote | medium |

## reset

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `uncommit` | `reset --soft HEAD~1` | Undo the last commit, keeping changes staged | medium |
| `unadd` | `!f() { git restore --staged -- "${@:-.}"; }; f` | Unstage changes from the index; unstages all staged files when called with no arguments (uses git restore --staged, requires git >= 2.23) | medium |
| `unstage-all` | `restore --staged .` | Unstage all staged changes | medium |
| `discard-all` | `restore .` | Discard all unstaged changes in the working tree | medium |
| `discard-file` | `restore --` | Discard unstaged changes in a specific file; usage: git discard-file <filename> | medium |
| `restore-file` | `restore --source HEAD --` | Restore a specific file to its HEAD state; usage: git restore-file <path> | medium |
| `expunge` | `!f() { printf "WARNING: This permanently rewrites all history to remove '%s'. This cannot be undone.\nContinue? [y/N] " "$1"; read -r ans </dev/tty; case "$ans" in [yY]*) git filter-repo --path "$1" --invert-paths --force ;; *) echo "Aborted." ;; esac; }; f` | Permanently remove a file from all history with confirmation prompt (requires git-filter-repo) | dangerous |
| `clean-dry` | `clean -dffn` | Preview what would be deleted by clean | safe |
| `reset-hard-safe` | `!f() { printf "Reset HARD to %s? [y/N] " "${1:-HEAD}"; read -r ans </dev/tty; case "$ans" in [yY]*) git reset --hard "${1:-HEAD}" ;; *) echo "Aborted." ;; esac; }; f` | Confirmed hard reset | dangerous |

## revert

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `rv` | `revert` | Undo changes from a commit by creating a new commit | medium |
| `rvnc` | `revert --no-commit` | Revert without auto-committing | medium |

## shortcuts

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `sw` | `switch` | Shortcut for git switch (modern checkout alternative, requires git >= 2.23) | medium |

## stash

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `snapshot` | `!git stash push --include-untracked --message "snapshot: $(date)" && git stash apply "stash@{0}" --index` | Snapshot working tree to stash without removing changes | medium |
| `sp` | `stash push` | Push current changes onto the stash stack | medium |
| `sl` | `stash list` | List all stash entries | safe |
| `sd` | `stash drop` | Drop the most recent stash entry | medium |
| `spo` | `stash pop` | Pop and apply the most recent stash entry | medium |
| `ssa` | `stash show --patch` | Show the most recent stash entry as a full patch diff | safe |
| `spu` | `stash push --include-untracked` | Stash including untracked files | medium |
| `spp` | `stash push --patch` | Interactively stash changes | medium |
| `sli` | `!git stash list | fzf` | Interactively browse stash entries | medium |

## status

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `st` | `status --short --branch` | Status with short format and branch info | safe |

## submodule

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `smi` | `submodule init` | Initialize submodules | medium |
| `smu` | `submodule update` | Update submodules | medium |
| `smui` | `submodule update --init` | Update and initialize submodules | medium |
| `smuir` | `submodule update --init --recursive` | Update, initialize, and recurse into nested submodules | medium |

## tag

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `last-tag` | `describe --tags --abbrev=0` | Show the last tag on the current branch | safe |
| `last-tagged` | `!git describe --tags "$(git rev-list --tags --max-count=1)"` | Show the last annotated tag across all branches | medium |
| `tags` | `tag -n1 --list` | List all tags with their messages | safe |

## topic

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `topic-base-branch` | `!git config --get init.topicBaseBranchName || git default-branch` | Show the base branch for topic branches | medium |
| `topic-start` | `!f(){ new_branch="$1"; old_branch="$(git topic-base-branch)"; git checkout "$old_branch"; git pull --ff-only; git checkout -b "$new_branch" "$old_branch"; git push --set-upstream origin "$new_branch"; };f` | Start a new topic branch from the base branch | medium |
| `topic-end` | `!f(){ new_branch="$(git current-branch)"; old_branch="$(git topic-base-branch)"; if [ "$new_branch" = "$old_branch" ]; then printf "You are asking to do git topic-end,\n"; printf "but you are not on a new topic branch;\n"; printf "you are on the base topic branch: %s.\n" "$old_branch"; printf "Please checkout the topic branch that you want,\n"; printf "then retry the git topic-end command.\n"; else git push; git checkout "$old_branch"; git branch --delete "$new_branch"; git push origin ":$new_branch"; fi; };f` | Finish a topic branch by pushing and deleting it | medium |
| `topic-sync` | `!f(){ new_branch="$(git current-branch)"; old_branch="$(git topic-base-branch)"; if [ "$new_branch" = "$old_branch" ]; then printf "You are asking to do git topic-sync,\n"; printf "but you are not on a new topic branch;\n"; printf "you are on the base topic branch: %s.\n" "$old_branch"; printf "Please checkout the topic branch that you want,\n"; printf "then retry the git topic-sync command.\n"; else git pull; git push; fi; };f` | Sync the current topic branch by pulling and pushing | medium |
| `topic-move` | `!f(){ new_branch="$1"; old_branch="$(git current-branch)"; git branch --move "$old_branch" "$new_branch"; git push --set-upstream origin ":$old_branch" "$new_branch"; };f` | Rename the current topic branch | medium |

## util

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `init-empty` | `!f() { git init && git commit --allow-empty --allow-empty-message --message ''; }; f` | Create an empty initial commit for a cleaner rebasing history | medium |
| `assume` | `update-index --assume-unchanged` | Tell git to ignore changes to a file | medium |
| `unassume` | `update-index --no-assume-unchanged` | Restore git tracking of changes to a file | medium |
| `unassume-all` | `!git assumed | xargs -r git update-index --no-assume-unchanged` | Restore tracking for all assumed-unchanged files | medium |
| `assumed` | `!git ls-files -v | grep ^h | cut -c 3-` | List all files marked as assume-unchanged | medium |
| `aliases` | `!git config --get-regexp '^alias\.' | cut -c 7- | sed 's/ / = /'` | List all git aliases | medium |
| `default-branch` | `config init.defaultBranch` | Show the configured default branch name | safe |
| `current-branch` | `rev-parse --abbrev-ref HEAD` | Show the current branch name | safe |
| `upstream-branch` | `!git for-each-ref --format='%(upstream:short)' "$(git symbolic-ref -q HEAD)"` | Show the upstream tracking branch for the current branch | medium |
| `rev-list-all-objects-by-size-and-name` | `!git rev-list --all --objects | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2` | List all blobs in history sorted by size with filename | medium |
| `large-files` | `!git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {size=$3; sub(/^[^ ]+ [^ ]+ [^ ]+ /,""); print size, $0}' | sort -nr | head -50` | Show the 50 largest blobs in the repository | medium |
| `bl` | `blame` | Show what revision and author last modified each line of a file | safe |
| `bli` | `!f() { file=$(git ls-files | fzf); [ -n "$file" ] && git blame -- "$file"; }; f` | Interactively select a file and blame it | medium |
| `verify` | `fsck --full` | Verify the connectivity and validity of objects in the database | safe |

## workflow

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cloner` | `clone --recursive` | Clone a repository including all submodules | medium |
| `clone-lean` | `clone --depth 1 --filter=combine:blob:none+tree:0 --no-checkout` | Minimal clone skipping unneeded blobs and trees | medium |
| `pushy` | `push --force-with-lease` | Force-push using --force-with-lease for safety | dangerous |
| `push-safe` | `push --force-with-lease --force-if-includes` | Force-push with --force-with-lease and --force-if-includes for maximum safety (requires git >= 2.30) | dangerous |
| `pushy-check` | `!git log @{upstream}.. && git push --force-with-lease` | Show unreviewed commits ahead of upstream, then force-push with --force-with-lease | dangerous |
| `get` | `!git fetch --prune && git pull --rebase && git submodule update --init --recursive` | Fetch, rebase pull, and update all submodules | medium |
| `mainly` | `!f() { branch="$(git default-branch)"; printf "WARNING: This will hard-reset '%s' to 'origin/%s'. Continue? [y/N] " "$branch" "$branch"; read -r ans </dev/tty; case "$ans" in [yY]*) git checkout "$branch" && git fetch origin --prune && git reset --hard "origin/$branch" ;; *) echo "Aborted." ;; esac; }; f` | Reset local default branch to match its origin counterpart (prompts for confirmation before hard-reset) | dangerous |
| `track` | `!f(){ branch="$(git current-branch)"; cmd="git branch $branch --set-upstream-to=${1:-origin}/${2:-$branch}"; echo "$cmd"; $cmd; }; f` | Set the upstream tracking branch | medium |
| `untrack` | `!f(){ branch="$(git current-branch)"; cmd="git branch --unset-upstream ${1:-$branch}"; echo "$cmd"; $cmd; }; f` | Remove the upstream tracking branch | medium |
| `publish` | `!f() { git push --set-upstream "${1:-origin}" "$(git current-branch)"; }; f` | Push current branch and set upstream | medium |
| `unpublish` | `!f() { git push "${1:-origin}" :"$(git current-branch)"; }; f` | Delete the remote version of the current branch | dangerous |
| `inbound` | `!git remote update --prune; git log ..@{upstream}` | Show incoming commits from upstream | medium |
| `outbound` | `log @{upstream}..` | Show outgoing commits not yet pushed | safe |
| `pruner` | `!git prune --expire=now; git reflog expire --expire-unreachable=now --rewrite --all` | Prune all unreachable objects immediately | medium |
| `repacker` | `repack -a -d -f --depth=300 --window=300 --window-memory=1g` | Repack the repository for optimal storage | medium |
| `optimizer` | `!git pruner; git repacker; git prune-packed` | Run pruner, repacker, and prune-packed to optimize the repo | medium |
| `sparse-init` | `sparse-checkout init` | Enable sparse-checkout and initialize it for the repository (requires git >= 2.25) | medium |
| `sparse-set` | `sparse-checkout set` | Set the sparse-checkout path patterns (requires git >= 2.25) | medium |
| `sync` | `!f() { branch="${1:-$(git default-branch)}"; git switch "$branch" && git pull --ff-only; }; f` | Switch to a branch and fast-forward it; defaults to the configured default branch | medium |
| `pr-ready` | `!git rebase-recent && git task-ready` | Interactively rebase unpushed commits then run pre-PR status checks | medium |
| `task-ready` | `!git status --short --branch && git diff --check && git log --oneline @{upstream}..HEAD` | Show status, whitespace issues, and outgoing commits before creating a PR | medium |

## worktree

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `wt-path` | `!f() { branch="$1"; test -n "$branch" || { echo "usage: git wt-path <branch>"; return 2; }; root="$(git rev-parse --show-toplevel)" || return; repo="$(basename "$root")"; clean="$(printf "%s" "$branch" | tr "/" "-")"; printf "%s\n" "../${repo}-${clean}"; }; f` | Print worktree path using ../<repo>-<branch> | medium |
| `wt-new` | `!f() { branch="$1"; base="${2:-origin/$(git default-branch)}"; test -n "$branch" || { echo "usage: git wt-new <branch> [base]"; return 2; }; target="$(git wt-path "$branch")" || return; git worktree add -b "$branch" "$target" "$base"; }; f` | Create a new worktree branch from a base | medium |
| `wt-open` | `!f() { branch="$1"; if test -z "$branch"; then command -v fzf >/dev/null 2>&1 || { echo "usage: git wt-open <branch> # or install fzf for interactive mode"; return 2; }; branch="$(git branch --all --format="%(refname:short)" | sed "s#^origin/##" | grep -v "^HEAD$" | sort -u | fzf --prompt="open worktree branch> ")"; fi; test -n "$branch" || return 1; target="$(git wt-path "$branch")" || return; git worktree add "$target" "$branch"; }; f` | Open an existing branch in a new worktree; uses fzf when no branch is given | medium |
| `wt-open-cd` | `!f() { branch="$1"; if test -z "$branch"; then command -v fzf >/dev/null 2>&1 || { echo "usage: git wt-open-cd <branch> # or install fzf"; return 2; }; branch="$(git branch --all --format="%(refname:short)" | sed "s#^origin/##" | grep -v "^HEAD$" | sort -u | fzf --prompt="open+cd branch> ")"; fi; test -n "$branch" || return 1; target="$(git wt-path "$branch")" || return; git worktree add "$target" "$branch" && printf "%s\n" "$target"; }; f` | Open a branch in a new worktree and print the worktree path; uses fzf when no branch is given | medium |
| `wt-rm` | `!f() { branch="$1"; test -n "$branch" || { echo "usage: git wt-rm <branch>"; return 2; }; target="$(git wt-path "$branch")" || return; git worktree remove "$target"; }; f` | Remove a worktree by branch name | medium |
| `wt-done` | `!f() { branch="$1"; if test -z "$branch"; then command -v fzf >/dev/null 2>&1 || { echo "usage: git wt-done <branch> # or install fzf for interactive mode"; return 2; }; path="$(git worktree list --porcelain | awk "/^worktree /{print substr($0,10)}" | fzf --prompt="done worktree> ")"; test -n "$path" || return 1; branch="$(git -C "$path" rev-parse --abbrev-ref HEAD)" || return; else path="$(git wt-path "$branch")" || return; fi; git worktree remove "$path" && git branch --delete "$branch"; }; f` | Remove a worktree and delete its local branch; uses fzf when no branch is given | medium |
| `wt-done-force` | `!f() { branch="$1"; test -n "$branch" || { echo "usage: git wt-done-force <branch>"; return 2; }; git worktree remove --force "$(git wt-path "$branch")" && git branch --delete --force "$branch"; }; f` | Force-remove a worktree and force-delete its local branch | dangerous |
| `wt-list` | `worktree list` | List all worktrees for this repository | safe |
| `wt-prune` | `worktree prune` | Prune stale worktree references | medium |
| `wt-sync` | `!f() { branch="$1"; test -n "$branch" || { echo "usage: git wt-sync <branch>"; return 2; }; target="$(git wt-path "$branch")" || return; git -C "$target" pull --ff-only; }; f` | Fast-forward sync a named worktree from outside it by branch name | medium |
| `wt-feature` | `!f() { name="$1"; base="${2:-origin/$(git default-branch)}"; test -n "$name" || { echo "usage: git wt-feature <ado-id-short-title> [base]"; return 2; }; branch="feature/$name"; git wt-new "$branch" "$base" && git wt-path "$branch"; }; f` | Create a Git-flow feature worktree for an Azure DevOps task | medium |
| `wt-bugfix` | `!f() { name="$1"; base="${2:-origin/$(git default-branch)}"; test -n "$name" || { echo "usage: git wt-bugfix <ado-id-short-title> [base]"; return 2; }; branch="bugfix/$name"; git wt-new "$branch" "$base" && git wt-path "$branch"; }; f` | Create a Git-flow bugfix worktree for an Azure DevOps task | medium |
| `wt-hotfix` | `!f() { name="$1"; base="${2:-origin/$(git default-branch)}"; test -n "$name" || { echo "usage: git wt-hotfix <ado-id-short-title> [base]"; return 2; }; branch="hotfix/$name"; git wt-new "$branch" "$base" && git wt-path "$branch"; }; f` | Create a Git-flow hotfix worktree for urgent production work | medium |
| `wt-release` | `!f() { name="$1"; base="${2:-origin/$(git default-branch)}"; test -n "$name" || { echo "usage: git wt-release <version-or-name> [base]"; return 2; }; branch="release/$name"; git wt-new "$branch" "$base" && git wt-path "$branch"; }; f` | Create a Git-flow release worktree | medium |
