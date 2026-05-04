# git-kit aliases

Generated from `aliases/`.

## add

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `aa` | `add --all` | Add all files including untracked | medium |
| `ap` | `add --patch` | Add files interactively by patch | medium |
| `au` | `add --update` | Add only updated (already tracked) files | medium |
| `add-cached` | `!f() { files=$(git ls-files --cached | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all cached files to the index | medium |
| `add-deleted` | `!f() { files=$(git ls-files --deleted | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all deleted files to the index | medium |
| `add-others` | `!f() { files=$(git ls-files --others | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all untracked files to the index | medium |
| `add-ignored` | `!f() { files=$(git ls-files --ignored --others --exclude-standard | sort -u); [ -z "$files" ] || git add --force -- $files; }; f` | WARNING: stages files that are explicitly gitignored — almost never intentional. Force-add gitignored files to the index. | dangerous |
| `add-force-ignored` | `!f() { files=$(git ls-files --ignored --others --exclude-standard | sort -u); [ -z "$files" ] || git add --force -- $files; }; f` | WARNING: stages files that are explicitly gitignored — almost never intentional. Force-add gitignored files to the index (alias for add-ignored). | dangerous |
| `add-killed` | `!f() { files=$(git ls-files --killed | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all killed files to the index | medium |
| `add-modified` | `!f() { files=$(git ls-files --modified | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all modified files to the index | medium |
| `add-stage` | `!f() { files=$(git ls-files --stage | cut -f2 | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all staged files to the index | medium |
| `add-unmerged` | `!f() { files=$(git ls-files --unmerged | cut -f2 | sort -u); [ -z "$files" ] || git add -- $files; }; f` | Add all unmerged files to the index | medium |
| `edit-cached` | `!f() { files=$(git ls-files --cached | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all cached files in the editor | medium |
| `edit-deleted` | `!f() { files=$(git ls-files --deleted | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all deleted files in the editor | medium |
| `edit-others` | `!f() { files=$(git ls-files --others | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all untracked files in the editor | medium |
| `edit-ignored` | `!f() { files=$(git ls-files --ignored | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all ignored files in the editor | medium |
| `edit-killed` | `!f() { files=$(git ls-files --killed | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all killed files in the editor | medium |
| `edit-modified` | `!f() { files=$(git ls-files --modified | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all modified files in the editor | medium |
| `edit-stage` | `!f() { files=$(git ls-files --stage | cut -f2 | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all staged files in the editor | medium |
| `edit-unmerged` | `!f() { files=$(git ls-files --unmerged | cut -f2 | sort -u); [ -z "$files" ] || $(git var GIT_EDITOR) $files; }; f` | Open all unmerged files in the editor | medium |

## branch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `bm` | `branch --merged` | branch and only list branches whose tips are reachable from the specified commit (HEAD if not spe... | safe |
| `bnm` | `branch --no-merged` | branch and only list branches whose tips are not reachable from the specified commit (HEAD if not... | safe |
| `bed` | `branch --edit-description` | branch with edit description | medium |
| `bsd` | `!f(){ branch="${1:-$(git current-branch)}";  git config "branch.$branch.description"; };f` | branch with show description; ideally git will add this feature in the future as `git --show-desc... | medium |
| `bv` | `branch --verbose` | branch verbose: When in list mode, show the hash, the commit subject line, etc | safe |
| `bvv` | `branch --verbose --verbose` | branch verbose verbose: When in list mode, show the hash the commit subject line, the upstream br... | safe |
| `heads` | `!git log "origin/$(git default-branch)".. --format='%Cred%h%Creset;%C(yellow)%an%Creset;%H;%Cblue%f%Creset' | git name-rev --stdin --always --name-only | column -t -s';'` | Show local commits not yet on origin/main | medium |
| `branch-commit-first` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --reverse --pretty=%H "$branch" | head -"$count"; }; f` | Show a branch's first commit hash | medium |
| `branch-commit-last` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --pretty=%H "$branch" | head -"$count"; }; f` | Show a branch's last commit hash | medium |
| `branch-commit-prev` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --pretty=%H "$branch" | grep -A "$count" "$(git rev-parse HEAD)" | tail +2; }; f` | Show a branch's previous commit hash | medium |
| `branch-commit-next` | `!f() { branch="${1:-$(git current-branch)}"; count="${2:-1}"; git log --reverse --pretty=%H "$branch" | grep -A "$count" "$(git rev-parse HEAD)" | tail +2; }; f` | Show a branch's next commit hash | medium |
| `refs-by-date` | `for-each-ref --sort=-committerdate --format='%(committerdate:short) %(refname:short) (objectname:short) %(contents:subject)'` | List all refs sorted by most recent committer date | safe |
| `track-all-remote-branches` | `!f() { for x in $(git for-each-ref --format="%(refname:short)" --no-merged=origin/HEAD refs/remotes/origin); do git switch --track "$x"; done; }; f` | Track all remote branches as local branches | medium |
| `hew` | `!git hew-local "$@" && git hew-remote "$@" #` | Delete all merged branches locally and remotely | dangerous |
| `hew-dry-run` | `!git hew-local-dry-run "$@" && git hew-remote-dry-run "$@" #` | Preview branches that would be deleted by hew | medium |
| `hew-local` | `!f() { git hew-local-dry-run "$@" | xargs git branch --delete ; }; f "$@"` | Delete all locally merged branches | dangerous |
| `hew-local-dry-run` | `!f() { commit=${1:-$(git current-branch)}; git branch --merged "$commit" | grep -v "^[[:space:]]*\\*[[:space:]]*$commit$" ; }; f "$@"` | Preview locally merged branches to be deleted | medium |
| `hew-remote` | `!f() { git hew-remote-dry-run "$@" | xargs -I% git push origin :% 2>&1 ; }; f "$@"` | Delete all remotely merged branches | dangerous |
| `hew-remote-dry-run` | `!f() { commit=${1:-$(git upstream-branch)}; git branch --remotes --merged "$commit" | grep -v "^[[:space:]]*origin/$commit$" | sed 's#[[:space:]]*origin/##' ; }; f "$@"` | Preview remotely merged branches to be deleted | medium |
| `branches` | `branch -a` | List all local and remote branches | safe |
| `recent` | `branch --sort=-committerdate` | List branches sorted by most recent commit date | safe |

## checkout

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `co` | `checkout` | Checkout a branch or path | medium |
| `cong` | `checkout --no-guess` | Checkout without guessing branch names | medium |
| `cob` | `checkout -b` | Create and checkout a new branch | medium |
| `swb` | `switch --create` | Create and switch to a new branch (modern alternative to checkout -b, requires git >= 2.23) | medium |
| `swi` | `!f() { branch=$(git branch --format='%(refname:short)' | fzf); [ -z "$branch" ] && return; if git switch "$branch"; then echo "Switched to '$branch'."; fi; }; f` | Interactively switch branches using fzf (requires fzf) | medium |

## cherry-pick

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cp` | `cherry-pick` | Apply a commit from another branch | medium |
| `cpa` | `cherry-pick --abort` | Abort a cherry-pick in progress | medium |
| `cpc` | `cherry-pick --continue` | Continue a cherry-pick in progress | medium |
| `cpn` | `cherry-pick --no-commit` | Cherry-pick without committing | medium |
| `cpnx` | `cherry-pick --no-commit -x` | Cherry-pick without committing, appending origin info | medium |
| `cherry-pick-merge` | `!sh -c 'git cherry-pick --no-commit --mainline 1 $0 && git log -1 --pretty=%P $0 | cut -b 42- > .git/MERGE_HEAD && git commit --verbose'` | Cherry-pick a merge commit | medium |

## commit

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ca` | `commit --amend` | Amend the tip of the current branch | medium |
| `cam` | `commit --amend --message` | Amend the tip of the current branch with a new message | medium |
| `cane` | `commit --amend --no-edit` | Amend the tip of the current branch without editing the message | medium |
| `caa` | `commit --amend --all` | Amend the tip, staging all modified and deleted files | medium |
| `caam` | `commit --amend --all --message` | Amend the tip, staging all files, with a new message | medium |
| `caane` | `commit --amend --all --no-edit` | Amend the tip, staging all files, without editing the message | medium |
| `ci` | `commit --interactive` | Commit using the interactive interface | medium |
| `cm` | `commit --message` | Commit with a message | medium |
| `commit-parents` | `!f(){ git cat-file -p "${*:-HEAD}" | sed -n '/0/,/^ *$/{/^parent /p}'; };f` | Show a commit's parent hashes | medium |
| `commit-is-merge` | `!f(){ [ -n "$(git commit-parents "$*" | sed '0,/^parent /d')" ];};f` | Exit 0 if the commit is a merge, else exit 1 | medium |
| `commit-message-key-lines` | `!f(){ echo "Commit: $1"; git log "$1" --format=fuller | grep "^[[:blank:]]*[[:alnum:]][-[:alnum:]]*:" | sed "s/^[[:blank:]]*//; s/:[[:blank:]]*/: /"; }; f` | Show keyword-tagged lines from a commit message | medium |
| `wip` | `!git add --all; git ls-files --deleted -z | xargs -r -0 git rm; git commit --message=wip` | Stage all changes and commit with message "wip" | medium |
| `unwip` | `!git log --max-count=1 | grep -q -c wip && git reset HEAD~1` | Undo the last commit if its message is "wip" | medium |

## core

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `unstage` | `restore --staged` | Unstage changes from the index (restore --staged) | medium |
| `discard` | `restore` | Discard working directory changes to a file | medium |
| `root` | `rev-parse --show-toplevel` | Show the top-level directory of the repository | safe |

## diff

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `dc` | `diff --cached` | Show staged changes (alias for diff --cached) | safe |
| `ds` | `diff --staged` | Show changes about to be committed | safe |
| `dw` | `diff --word-diff` | Show changes but by word, not line | safe |
| `dd` | `diff-deep` | Show changes with our preferred options; a.k.a | safe |
| `diff-all` | `!for name in $(git diff --name-only "$1"); do git difftool "$1" "$name" & done` | Open difftool for all changed files | medium |
| `diff-changes` | `diff --name-status -r` | Show changed file names and status | safe |
| `diff-stat` | `diff --stat --ignore-space-change -r` | Show a stat summary ignoring whitespace | safe |
| `diff-deep` | `diff --check --dirstat --find-copies --find-renames --histogram --color` | Diff with extra checks, stats, and rename detection | safe |
| `diff-chunk` | `!f() { git show "$1:$3" | sed -n "/^[^ \t].*$4(/,/^}/p" > .tmp1 ; git show "$2:$3" | sed -n "/^[^ \t].*$4(/,/^}/p" > .tmp2 ; git diff --no-index .tmp1 .tmp2 ; }; f` | Diff a single function or chunk between two commits | medium |

## fetch

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `fa` | `fetch --all` | Fetch from all remotes | safe |
| `fav` | `fetch --all --verbose` | Fetch from all remotes with verbose output | safe |
| `fap` | `fetch --all --prune` | Fetch from all remotes and prune deleted branches | safe |

## grep

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `gn` | `grep --line-number` | Grep with line numbers | safe |
| `gg` | `grep-group` | Grep with grouped output (a.k.a. grep-group) | safe |
| `grep-all` | `!f() { git rev-list --all | xargs git grep "$@"; }; f` | Find text in any commit ever | medium |
| `grep-group` | `grep --break --heading --line-number --color` | Find text and group the output lines | safe |
| `grep-ack` | `-c color.grep.linenumber="bold yellow" -c color.grep.filename="bold green" -c color.grep.match="reverse yellow" grep --break --heading --line-number` | Find text with ack-like formatting | safe |

## log

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `lg` | `log --graph` | Log with a graphical representation of history | safe |
| `lo` | `log --oneline` | Log with one line per commit | safe |
| `lor` | `log --oneline --reverse` | Log with one line per commit in reverse order | safe |
| `lp` | `log --patch` | Log with patch generation | safe |
| `lfp` | `log --first-parent` | Log following only the first parent | safe |
| `lto` | `log --topo-order` | Log in topological order | safe |
| `ll` | `log-list` | Log list with preferred options (a.k.a. log-list) | safe |
| `lll` | `log-list-long` | Log list with long format (a.k.a. log-list-long) | safe |
| `log-fresh` | `log ORIG_HEAD.. --stat --no-merges` | Show new commits since the last fetch | safe |
| `log-list` | `log --graph --topo-order --date=short --abbrev-commit --decorate --all --boundary --pretty=format:'%Cblue%ad %C(auto)%h%Creset -%C(auto)%d%Creset %s %Cblue[%aN]%Creset %Cblue%G?%Creset'` | Preferred log list with graph, dates, and authors | safe |
| `log-list-long` | `log --graph --topo-order --date=iso8601-strict --no-abbrev-commit --decorate --all --boundary --pretty=format:'%Cblue%ad %C(auto)%h%Creset -%C(auto)%d%Creset %s %Cblue[%aN <%aE>]%Creset %Cblue%G?%Creset'` | Preferred log list with full ISO dates and emails | safe |
| `log-my` | `!git log --author "$(git config user.email)"` | Show only commits by the current user email | medium |
| `log-graph` | `log --graph --all --oneline --decorate` | Show log as a decorated graph | safe |
| `log-date-first` | `!git log --date-order --format=%cI | tail -1` | Show the date of the earliest commit | medium |
| `log-date-last` | `log -1 --date-order --format=%cI` | Show the date of the most recent commit | safe |
| `log-1-hour` | `log --since=1-hour-ago` | Show commits from the past hour | safe |
| `log-1-day` | `log --since=1-day-ago` | Show commits from the past day | safe |
| `log-1-week` | `log --since=1-week-ago` | Show commits from the past week | safe |
| `log-1-month` | `log --since=1-month-ago` | Show commits from the past month | safe |
| `log-1-year` | `log --since=1-year-ago` | Show commits from the past year | safe |
| `log-my-hour` | `!git log --author "$(git config user.email)" --since=1-hour-ago` | Show my commits from the past hour | medium |
| `log-my-day` | `!git log --author "$(git config user.email)" --since=1-day-ago` | Show my commits from the past day | medium |
| `log-my-week` | `!git log --author "$(git config user.email)" --since=1-week-ago` | Show my commits from the past week | medium |
| `log-my-month` | `!git log --author "$(git config user.email)" --since=1-month-ago` | Show my commits from the past month | medium |
| `log-my-year` | `!git log --author "$(git config user.email)" --since=1-year-ago` | Show my commits from the past year | medium |
| `log-of-format-and-count` | `!f() { format="$1"; shift; git log "$@" --format=oneline --format="$format" | awk '{a[$0]++}END{for(i in a){print i, a[i], int((a[i]/NR)*100) "%"}}' | sort; }; f` | Count log entries grouped by a format string | medium |
| `log-of-count-and-format` | `!f() { format="$1"; shift; git log "$@" --format=oneline --format="$format" | awk '{a[$0]++}END{for(i in a){print a[i], int((a[i]/NR)*100) "%", i}}' | sort -nr; }; f` | Count log entries grouped by a format string (descending) | medium |
| `log-of-format-and-count-with-date` | `!f() { format="$1"; shift; date_format="$1"; shift; git log "$@" --format=oneline --format="$format" --date=format:"$date_format" | awk '{a[$0]++}END{for(i in a){print i, a[i], int((a[i]/NR)*100) "%"}}' | sort -r; }; f` | Count log entries by format and date | medium |
| `log-of-count-and-format-with-date` | `!f() { format="$1"; shift; date_format="$1"; shift; git log "$@" --format=oneline --format="$format" --date=format:"$date_format" | awk '{a[$0]++}END{for(i in a){print a[i], int((a[i]/NR)*100) "%", i}}' | sort -nr; }; f` | Count log entries by format and date (descending) | medium |
| `log-of-email-and-count` | `!f() { git log-of-format-and-count "%aE" "$@"; }; f` | Count commits per author email; thin wrapper around log-of-format-and-count | medium |
| `log-of-count-and-email` | `!f() { git log-of-count-and-format "%aE" "$@"; }; f` | Count commits per author email (descending); thin wrapper around log-of-count-and-format | medium |
| `log-of-hour-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m-%dT%H" "$@" ; }; f` | Count commits per hour; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-hour` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m-%dT%H" "$@" ; }; f` | Count commits per hour (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-day-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m-%d" "$@" ; }; f` | Count commits per day; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-day` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m-%d" "$@" ; }; f` | Count commits per day (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-week-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y#%V" "$@"; }; f` | Count commits per week; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-week` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y#%V" "$@"; }; f` | Count commits per week (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-month-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y-%m" "$@" ; }; f` | Count commits per month; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-month` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y-%m" "$@" ; }; f` | Count commits per month (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-year-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%Y" "$@" ; }; f` | Count commits per year; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-year` | `!f() { git log-of-count-and-format-with-date "%ad" "%Y" "$@" ; }; f` | Count commits per year (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-hour-of-day-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%H" "$@"; }; f` | Count commits by hour of day; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-hour-of-day` | `!f() { git log-of-count-and-format-with-date "%ad" "%H" "$@"; }; f` | Count commits by hour of day (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-day-of-week-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%u" "$@"; }; f` | Count commits by day of week; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-day-of-week` | `!f() { git log-of-count-and-format-with-date "%ad" "%u" "$@"; }; f` | Count commits by day of week (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-of-week-of-year-and-count` | `!f() { git log-of-format-and-count-with-date "%ad" "%V" "$@"; }; f` | Count commits by week of year; thin wrapper around log-of-format-and-count-with-date | medium |
| `log-of-count-and-week-of-year` | `!f() { git log-of-count-and-format-with-date "%ad" "%V" "$@"; }; f` | Count commits by week of year (descending); thin wrapper around log-of-count-and-format-with-date | medium |
| `log-refs` | `log --all --graph --decorate --oneline --simplify-by-decoration --no-merges` | Show decorated simplified graph of all refs | safe |
| `log-timeline` | `log --format='%h %an %ar - %s'` | Show log with author and relative age | safe |
| `log-local` | `log --oneline @{upstream}..HEAD` | Show local commits not yet pushed upstream | safe |
| `log-fetched` | `log --oneline HEAD..@{upstream}` | Show fetched commits not yet merged | safe |
| `chart` | `!f() { git log --format=oneline --format="%aE %at" --since=6-weeks-ago "$*" | awk ' function time_to_slot(t) { return strftime("%Y-%m-%d", t, true) } function count_to_char(i) { return (i > 0) ? ((i < 10) ? i : "X") : "." } BEGIN { time_min = systime(); time_max = 0; SECONDS_PER_DAY=86400; } { item = $1; time = 0 + $2; if (time > time_max){ time_max = time } else if (time < time_min){ time_min = time }; slot = time_to_slot(time); items[item]++; slots[slot]++; views[item, slot]++; } END{ printf("Chart time range %s to %s.\\n", time_to_slot(time_min), time_to_slot(time_max)); time_max_add = time_max += SECONDS_PER_DAY; for(item in items){ row = ""; for(time = time_min; time < time_max_add; time += SECONDS_PER_DAY) { slot = time_to_slot(time); count = views[item, slot]; row = row count_to_char(count); } print row, item; } }'; }; f` | Show a per-author activity chart for the past 6 weeks | medium |
| `churn` | `!f() { git log --all --find-copies --find-renames --name-only --format='format:' "$@" | awk 'NF{a[$0]++}END{for(i in a){print a[i], i}}' | sort -rn;};f` | Show files sorted by how frequently they change | medium |
| `summary` | `!f() { printf "Summary of this branch...\n"; printf "%s\n" "$(git current-branch)"; printf "%s first commit timestamp\n" "$(git log --date-order --format=%cI | tail -1)"; printf "%s last commit timestamp\n" "$(git log -1 --date-order --format=%cI)"; printf "\nSummary of counts...\n"; printf "%d commit count\n" "$(git rev-list --count HEAD)"; printf "%d date count\n" "$(git log --format=oneline --format="%ad" --date=format:"%Y-%m-%d" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d tag count\n" "$(git tag | wc -l)"; printf "%d author count\n" "$(git log --format=oneline --format="%aE" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d committer count\n" "$(git log --format=oneline --format="%cE" | awk '{a[$0]=1}END{for(i in a){n++;} print n}')"; printf "%d local branch count\n" "$(git branch | grep -vc " -> ")"; printf "%d remote branch count\n" "$(git branch --remotes | grep -vc " -> ")"; printf "\nSummary of this directory...\n"; printf "%s\n" "$(pwd)"; printf "%d file count via git ls-files\n" "$(git ls-files | wc -l)"; printf "%d file count via find command\n" "$(find . | wc -l)"; printf "%d disk usage\n" "$(du -s | awk '{print $1}')"; printf "\nMost-active authors, with commit count and %%...\n"; if out=$(git log-of-count-and-email 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; printf "\nMost-active dates, with commit count and %%...\n"; if out=$(git log-of-count-and-day 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; printf "\nMost-active files, with churn count\n"; if out=$(git churn 2>/dev/null); then echo "$out" | head -7; else echo "[unavailable]"; fi; }; f` | Print a helpful summary of repo metrics | medium |
| `whois` | `!sh -c 'git log --regexp-ignore-case -1 --pretty="format:%an <%ae>\n" --author="$1"' -` | Look up a contributor by name or email substring | medium |
| `whatis` | `show --no-patch --pretty='tformat:%h (%s, %ad)' --date=short` | Briefly describe any git object | safe |
| `who` | `shortlog --summary --numbered --no-merges` | Show commit counts per contributor | safe |
| `issues` | `!sh -c "git log $1 --oneline | grep -o \\"ISSUE-[0-9]\\+\\" | sort -u"` | List issue IDs mentioned in commits between a range | medium |

## ls

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ls` | `ls-files` | List files in the index (like Unix ls) | safe |
| `lsd` | `ls-files --debug` | List files with debug information | safe |
| `lsfn` | `ls-files --full-name` | List files with full name | safe |
| `lsio` | `ls-files --ignored --others --exclude-standard` | List files ignored by git | safe |

## merge

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ma` | `merge --abort` | Abort an in-progress merge | medium |
| `mc` | `merge --continue` | Continue an in-progress merge | medium |
| `mncnf` | `merge --no-commit --no-ff` | Merge without auto-commit and without fast-forward | medium |
| `merge-span` | `!f() { echo "$(git log -1 "$2" --merges --pretty=format:%P | cut -d' ' -f1)$1$(git log -1 "$2" --merges --pretty=format:%P | cut -d' ' -f2)"; }; f` | Find the span of commits introduced by a merge | medium |
| `merge-span-log` | `!git log "$(git merge-span .. "$1")"` | Show commits introduced by a merge | medium |
| `merge-span-diff` | `!git diff "$(git merge-span ... "$1")"` | Show changes introduced by a merge | medium |
| `merge-span-difftool` | `!git difftool "$(git merge-span ... "$1")"` | Show merge changes in the configured difftool | medium |
| `rebase-branch` | `!f() { git rebase --interactive "$(git merge-base "$(git default-branch)" HEAD)"; }; f` | Interactively rebase all commits on the current branch | medium |
| `ours` | `!f() { git checkout --ours   "$@" && git add "$@"; }; f` | During a merge conflict, take our version of a file | medium |
| `theirs` | `!f() { git checkout --theirs "$@" && git add "$@"; }; f` | During a merge conflict, take their version of a file | medium |

## pull

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `pf` | `pull --ff-only` | Pull only if it can fast-forward, else fail | safe |
| `pr` | `pull --rebase` | Pull with rebase for a cleaner linear history | medium |
| `prp` | `pull --rebase=merges` | Pull with rebase preserving merge commits (replaces deprecated --rebase=preserve, requires git >= 2.18) | medium |

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
| `rr` | `remote` | Manage the set of tracked remote repositories | safe |
| `rrs` | `remote show` | Show information about a named remote | safe |
| `rru` | `remote update` | Fetch updates for all configured remotes | safe |
| `rrp` | `remote prune` | Prune stale remote-tracking branches for a remote | medium |
| `remotes-push` | `!git remote | xargs -I% -n1 git push %` | Push to every configured remote | dangerous |
| `remotes-push-dry-run` | `!git remote | xargs -I% -n1 git push % --dry-run` | Preview what remotes-push would push to every remote without making any changes | medium |
| `remotes-prune` | `!git remote | xargs -n 1 git remote prune` | Prune all stale references for every remote | medium |

## reset

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `reset-commit` | `reset --soft HEAD~1` | Reset commits | medium |
| `reset-commit-hard` | `reset --hard HEAD~1` | Git reset-commit-hard alias | dangerous |
| `reset-commit-hard-clean` | `!git reset --hard HEAD~1 && git clean -fd` | Git reset-commit-hard-clean alias | dangerous |
| `reset-to-pristine` | `!git reset --hard && git clean -ffdx` | Git reset-to-pristine alias | dangerous |
| `reset-to-upstream` | `!git reset --hard "$(git upstream-branch)"` | Git reset-to-upstream alias | dangerous |
| `undo-commit` | `reset --soft HEAD~1` | Undo commits | medium |
| `undo-commit-hard` | `reset --hard HEAD~1` | Git undo-commit-hard alias | dangerous |
| `undo-commit-hard-clean` | `!git reset --hard HEAD~1 && git clean -fd` | Git undo-commit-hard-clean alias | dangerous |
| `undo-to-pristine` | `!git reset --hard && git clean -ffdx` | Git undo-to-pristine alias | dangerous |
| `undo-to-upstream` | `!git reset --hard "$(git upstream-branch)"` | Git undo-to-upstream alias | dangerous |
| `uncommit` | `reset --soft HEAD~1` | Undo the last commit, keeping changes staged | medium |
| `unadd` | `!f() { git restore --staged -- "${@:-.}"; }; f` | Unstage changes from the index; unstages all staged files when called with no arguments (uses git restore --staged, requires git >= 2.23) | medium |
| `cleaner` | `clean -dff` | Clean working tree with force options | dangerous |
| `cleanest` | `clean -dffx` | Clean working tree with the most aggressive options | dangerous |
| `cleanout` | `!git clean -df && git checkout -- .` | Clean and checkout to restore working tree | dangerous |
| `expunge` | `!f() { printf "WARNING: This permanently rewrites all history to remove '%s'. This cannot be undone.\nContinue? [y/N] " "$1"; read -r ans </dev/tty; case "$ans" in [yY]*) git filter-repo --path "$1" --invert-paths --force ;; *) echo "Aborted." ;; esac; }; f` | Permanently remove a file from all history with confirmation prompt (requires git-filter-repo) | dangerous |
| `show-unreachable` | `!git fsck --unreachable | grep commit | cut -d" " -f3 | xargs git log` | Show log of unreachable commits | medium |

## revert

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `rv` | `revert` | Undo changes from a commit by creating a new commit | medium |
| `rvnc` | `revert --no-commit` | Revert without auto-committing | medium |

## shortcuts

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `a` | `add` | Shortcut for git add | medium |
| `b` | `branch` | Shortcut for git branch | safe |
| `c` | `commit` | Shortcut for git commit | medium |
| `d` | `diff` | Shortcut for git diff | safe |
| `f` | `fetch` | Shortcut for git fetch | safe |
| `g` | `grep` | Shortcut for git grep | safe |
| `l` | `log` | Shortcut for git log | safe |
| `m` | `merge` | Shortcut for git merge | medium |
| `o` | `checkout` | Shortcut for git checkout | medium |
| `p` | `pull` | Shortcut for git pull | medium |
| `s` | `status` | Shortcut for git status | safe |
| `w` | `log --name-status` | Show commit history with file status (modern equivalent of deprecated git whatchanged) | safe |
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

## status

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `ss` | `status --short` | Status with short format | safe |
| `ssb` | `status --short --branch` | Status with short format and branch info | safe |

## submodule

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `sm` | `submodule` | Manage submodules | safe |
| `smi` | `submodule init` | Initialize submodules | medium |
| `sma` | `submodule add` | Add a submodule | medium |
| `sms` | `submodule sync` | Sync submodule URLs | medium |
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
| `topic-begin` | `topic-start` | Alias for topic-start | medium |
| `topic-end` | `!f(){ new_branch="$(git current-branch)"; old_branch="$(git topic-base-branch)"; if [ "$new_branch" = "$old_branch" ]; then printf "You are asking to do git topic-end,\n"; printf "but you are not on a new topic branch;\n"; printf "you are on the base topic branch: %s.\n" "$old_branch"; printf "Please checkout the topic branch that you want,\n"; printf "then retry the git topic-end command.\n"; else git push; git checkout "$old_branch"; git branch --delete "$new_branch"; git push origin ":$new_branch"; fi; };f` | Finish a topic branch by pushing and deleting it | medium |
| `topic-finish` | `topic-end` | Alias for topic-end | medium |
| `topic-sync` | `!f(){ new_branch="$(git current-branch)"; old_branch="$(git topic-base-branch)"; if [ "$new_branch" = "$old_branch" ]; then printf "You are asking to do git topic-sync,\n"; printf "but you are not on a new topic branch;\n"; printf "you are on the base topic branch: %s.\n" "$old_branch"; printf "Please checkout the topic branch that you want,\n"; printf "then retry the git topic-sync command.\n"; else git pull; git push; fi; };f` | Sync the current topic branch by pulling and pushing | medium |
| `topic-move` | `!f(){ new_branch="$1"; old_branch="$(git current-branch)"; git branch --move "$old_branch" "$new_branch"; git push --set-upstream origin ":$old_branch" "$new_branch"; };f` | Rename the current topic branch | medium |

## util

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `sb` | `show-branch` | Print a list of branches and their commits | safe |
| `alias` | `!f(){ echo "Git Alias is project that has a collection of git alias commands."; echo "The purpose is to help make git easier, faster, and more capable."; echo "Free open source repository <https://github.com/gitalias/gitalias>."; echo ""; echo "To see your existing git aliases:"; echo "    git aliases"; echo ""; echo "To see your existing git aliases by using git directly:"; echo "    git config --get-regexp ^alias\\."; };f` | Show help for the git-alias project | medium |
| `add-alias` | `!f() { if [ $# != 3 ]; then echo "Usage: git add-alias ( --local | --global ) <alias> <command>"; echo "Error: this command needs 3 arguments."; return 2; fi; if [ -n "$(git config "$1" --get alias."$2")" ]; then echo "Alias '$2' already exists, thus no change happened."; return 3; fi; git config "$1" alias."$2" "$3" && return 0; echo "Usage: git add-alias ( --local | --global ) <alias> <command>"; echo "Error: unknown failure."; return 1; }; f` | Add a new git alias to local or global config | medium |
| `move-alias` | `!f() { if [ $# != 3 ]; then echo "Usage: git move-alias ( --local | --global ) <alias existing name> <new alias name>"; echo "Error: this command needs 3 arguments."; return 2; fi; if [ "$2" = "$3" ]; then echo "The alias names are identical, thus no change happened."; return 3; fi; if [ -z "$(git config "$1" --get alias."$2")" ]; then echo "Alias '$2' does not exist, thus no change happened."; return 4; fi; if [ -n "$(git config "$1" --get alias."$3")" ]; then echo "Alias '$3' already exists, thus no change happened."; return 5; fi; git config "$1" alias."$3" "$(git config "$1" --get alias."$2")" && git config "$1" --unset alias."$2" && return 0; echo "Usage: git move-alias ( --local | --global ) <alias existing name> <alias new name>"; echo "Error: unknown failure."; return 1; };f` | Rename an existing git alias | medium |
| `init-empty` | `!f() { git init && git commit --allow-empty --allow-empty-message --message ''; }; f` | Init a repo with an empty rebaseable first commit | medium |
| `orphans` | `fsck --full` | Find all objects not referenced by any other object | safe |
| `rev-list-all-objects-by-size` | `!git rev-list --all --objects  | awk '{print $1}'| git cat-file --batch-check | grep -F blob | sort -k3nr` | List all repo objects sorted by size in bytes | medium |
| `rev-list-all-objects-by-size-and-name` | `!git rev-list --all --objects | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2` | List all repo objects by size and filename | medium |
| `initer` | `init-empty` | Initialize a repo with an empty rebaseable first commit | medium |
| `assume` | `update-index --assume-unchanged` | Tell git to assume a file is unchanged | medium |
| `unassume` | `update-index --no-assume-unchanged` | Tell git to stop assuming a file is unchanged | medium |
| `assume-all` | `!git status --short | awk '{ print $2 }' | xargs -r git assume` | Assume all modified files are unchanged | medium |
| `unassume-all` | `!git assumed | xargs -r git update-index --no-assume-unchanged` | Unassume all assumed-unchanged files | medium |
| `assumed` | `!git ls-files -v | grep ^h | cut -c 3-` | List all files assumed to be unchanged | medium |
| `aliases` | `!git config --get-regexp '^alias\\.' | cut -c 7- | sed 's/ / = /'` | List all configured git aliases | medium |
| `stashes` | `stash list` | List all stash entries | safe |
| `top` | `rev-parse --show-toplevel` | Print the repository root directory | safe |
| `default-branch` | `config init.defaultBranch` | Show the configured default branch name | safe |
| `current-branch` | `rev-parse --abbrev-ref HEAD` | Show the current branch name | safe |
| `upstream-branch` | `!git for-each-ref --format='%(upstream:short)' "$(git symbolic-ref -q HEAD)"` | Show the upstream branch for the current branch | medium |
| `upb` | `rev-parse --abbrev-ref "@{upstream}"` | Show the upstream branch (short form) | medium |
| `exec` | `! exec` | Execute a shell command from the repository root | medium |
| `search-commits` | `!f() { query="$1"; shift; git log -S"$query" "$@"; }; f "$@"` | Search commit history for a given string | medium |
| `debug` | `!GIT_PAGER='' gdb --args git` | Debug a git builtin command using gdb | medium |
| `intercommit` | `!sh -c 'git show "$1" > .git/commit1 && git show "$2" > .git/commit2 && interdiff .git/commit[12] | less -FRS' -` | Show the diff between two commits using interdiff | medium |
| `graphviz` | `!f() { echo 'digraph git {' ; git log --pretty='format:  %h -> { %p }' "$@" | sed 's/[0-9a-f][0-9a-f]*/"&"/g' ; echo '}'; }; f` | Output a digraph of commit history for use with dotty | medium |
| `serve` | `-c daemon.receivepack=true daemon --base-path=. --export-all --reuseaddr --verbose` | Serve the local repo over the git protocol | medium |

## workflow

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `cloner` | `clone --recursive` | Clone a repository including all submodules | medium |
| `clone-lean` | `clone --depth 1 --filter=combine:blob:none+tree:0 --no-checkout` | Minimal clone skipping unneeded blobs and trees | medium |
| `panic` | `!tar cvf ../panic.tar -- *` | Archive working tree as a tar file for emergency backup | medium |
| `archive` | `!f() { top="$(git rev-parse --show-toplevel)"; cd "$top" || exit 1 ; tar cvf "$top.tar" "$top" ; }; f` | Create a tar archive of the entire repository | medium |
| `pushy` | `push --force-with-lease` | Force-push using --force-with-lease for safety | dangerous |
| `pushy-check` | `!git log @{upstream}.. && git push --force-with-lease` | Show unreviewed commits ahead of upstream, then force-push with --force-with-lease | dangerous |
| `get` | `!git fetch --prune && git pull --rebase && git submodule update --init --recursive` | Fetch, rebase pull, and update all submodules | medium |
| `put` | `!git commit --all && git push` | Commit all changes and push | medium |
| `put-dry-run` | `!git diff --cached --stat && git push --dry-run` | Show staged changes that put would commit (via diff --cached --stat) and a push dry-run against current HEAD; note the push dry-run reflects the pre-commit state, not the post-commit push | medium |
| `mainly` | `!f() { branch="$(git default-branch)"; printf "WARNING: This will hard-reset '%s' to 'origin/%s'. Continue? [y/N] " "$branch" "$branch"; read -r ans </dev/tty; case "$ans" in [yY]*) git checkout "$branch" && git fetch origin --prune && git reset --hard "origin/$branch" ;; *) echo "Aborted." ;; esac; }; f` | Reset local default branch to match its origin counterpart (prompts for confirmation before hard-reset) | dangerous |
| `ignore` | `!git status | grep -P "^\\t" | grep -vF .gitignore | sed "s/^\\t//" >> .gitignore` | Append all untracked files to .gitignore | medium |
| `push1` | `!git push origin "$(git current-branch)"` | Push the current branch to origin | medium |
| `pull1` | `!git pull origin "$(git current-branch)"` | Pull the current branch from origin | medium |
| `track` | `!f(){ branch="$(git current-branch)"; cmd="git branch $branch --set-upstream-to=${1:-origin}/${2:-$branch}"; echo "$cmd"; $cmd; }; f` | Set the upstream tracking branch | medium |
| `untrack` | `!f(){ branch="$(git current-branch)"; cmd="git branch --unset-upstream ${1:-$branch}"; echo "$cmd"; $cmd; }; f` | Remove the upstream tracking branch | medium |
| `publish` | `!f() { git push --set-upstream "${1:-origin}" "$(git current-branch)"; }; f` | Push current branch and set upstream | medium |
| `unpublish` | `!f() { git push "${1:-origin}" :"$(git current-branch)"; }; f` | Delete the remote version of the current branch | dangerous |
| `inbound` | `!git remote update --prune; git log ..@{upstream}` | Show incoming commits from upstream | medium |
| `outbound` | `log @{upstream}..` | Show outgoing commits not yet pushed | safe |
| `reincarnate` | `!f() { [ $# -gt 0 ] && git checkout "$1" && git unpublish && git checkout "$(git default-branch)" && git branch --delete --force "$1" && git checkout -b "$1" && git publish; }; f` | Delete and recreate a branch based on main | dangerous |
| `pruner` | `!git prune --expire=now; git reflog expire --expire-unreachable=now --rewrite --all` | Prune all unreachable objects immediately | medium |
| `repacker` | `repack -a -d -f --depth=300 --window=300 --window-memory=1g` | Repack the repository for optimal storage | medium |
| `optimizer` | `!git pruner; git repacker; git prune-packed` | Run pruner, repacker, and prune-packed to optimize the repo | medium |
| `worktree-add` | `worktree add` | Add a new linked worktree (requires git >= 2.5) | medium |
| `worktree-list` | `worktree list` | List all worktrees for this repository (requires git >= 2.5) | safe |
| `worktree-remove` | `worktree remove` | Remove a linked worktree (requires git >= 2.17) | medium |
| `sparse-init` | `sparse-checkout init` | Enable sparse-checkout and initialize it for the repository (requires git >= 2.25) | medium |
| `sparse-set` | `sparse-checkout set` | Set the sparse-checkout path patterns (requires git >= 2.25) | medium |

## worktree

| Alias | Command | Description | Risk |
| --- | --- | --- | --- |
| `wt-new` | `!f() { branch="$1"; base="${2:-origin/main}"; repo=$(basename "$(git rev-parse --show-toplevel)"); clean=$(echo "$branch" | tr '/' '-'); mkdir -p ../wt; target="../wt/${repo}-${clean}"; git worktree add -b "$branch" "$target" "$base"; }; f` | Create a new worktree with a new branch from a base (default origin/main) | medium |
| `wt-open` | `!f() { branch="$1"; repo=$(basename "$(git rev-parse --show-toplevel)"); clean=$(echo "$branch" | tr '/' '-'); mkdir -p ../wt; target="../wt/${repo}-${clean}"; git worktree add "$target" "$branch"; }; f` | Open an existing branch in a new worktree | medium |
| `wt-rm` | `!f() { branch="$1"; repo=$(basename "$(git rev-parse --show-toplevel)"); clean=$(echo "$branch" | tr '/' '-'); target="../wt/${repo}-${clean}"; git worktree remove "$target"; }; f` | Remove a worktree by branch name | medium |
| `wt-list` | `worktree list` | List all worktrees for this repository | safe |
| `wt-prune` | `worktree prune` | Prune stale worktree references | medium |
