import { loadAliasesFromDirectory, groupAliasesByCategory } from '../core/aliases.js';
import { loadProfile, loadAliasesForProfile } from '../core/profile.js';
import { resolvePackagePath, resolveProfilePath } from '../core/paths.js';
import { ensureAliasEntries } from '../core/validator.js';
import type { AliasEntry } from '../core/aliases.js';

export async function listCommand(profile?: string): Promise<string> {
  let aliases: AliasEntry[];

  if (profile != null) {
    const profileDef = await loadProfile(resolveProfilePath(profile));
    aliases = ensureAliasEntries(await loadAliasesForProfile(profileDef, resolvePackagePath('aliases')));
  } else {
    aliases = ensureAliasEntries(await loadAliasesFromDirectory(resolvePackagePath('aliases')));
  }

  const groupedAliases = groupAliasesByCategory(aliases);
  const widestAlias = Math.max(0, ...aliases.map((alias) => alias.name.length));
  const lines: string[] = [];

  for (const [category, categoryAliases] of groupedAliases) {
    if (lines.length > 0) {
      lines.push('');
    }

    lines.push(category);
    for (const alias of categoryAliases) {
      lines.push(`  ${alias.name.padEnd(widestAlias, ' ')}  ${alias.description}`);
    }
  }

  return lines.join('\n');
}
