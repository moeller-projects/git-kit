import { loadAliasesFromFile, groupAliasesByCategory } from '../core/aliases.js';
import { resolvePackagePath } from '../core/paths.js';
import { ensureAliasEntries } from '../core/validator.js';

export async function listCommand(): Promise<string> {
  const aliases = ensureAliasEntries(await loadAliasesFromFile(resolvePackagePath('aliases', 'aliases.yml')));
  const groupedAliases = groupAliasesByCategory(aliases);
  const widestAlias = Math.max(...aliases.map((alias) => alias.name.length));
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
