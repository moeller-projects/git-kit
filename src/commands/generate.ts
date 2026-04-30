import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadAliasesFromDirectory, loadAliasesFromFile } from '../core/aliases.js';
import { renderAliasGitConfig, renderAliasesMarkdown } from '../core/gitconfig.js';
import { resolvePackagePath } from '../core/paths.js';
import { ensureAliasEntries } from '../core/validator.js';

export interface GenerateResult {
  generatedPaths: string[];
}

export async function generateCommand(): Promise<GenerateResult> {
  const aliasesDirectory = resolvePackagePath('aliases');
  const generatedDirectory = resolvePackagePath('generated');
  const docsDirectory = resolvePackagePath('docs');

  await mkdir(generatedDirectory, { recursive: true });
  await mkdir(docsDirectory, { recursive: true });

  const ymlFiles = (await readdir(aliasesDirectory))
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .sort();

  const generatedPaths: string[] = [];

  // Generate one .gitconfig per yml file
  for (const file of ymlFiles) {
    const profile = path.basename(file, path.extname(file));
    const aliases = ensureAliasEntries(await loadAliasesFromFile(path.join(aliasesDirectory, file)));
    const gitconfigPath = path.join(generatedDirectory, `${profile}.gitconfig`);
    await writeFile(gitconfigPath, renderAliasGitConfig(aliases), 'utf8');
    generatedPaths.push(gitconfigPath);
  }

  // Generate a combined aliases.gitconfig
  const allAliases = ensureAliasEntries(await loadAliasesFromDirectory(aliasesDirectory));
  const combinedGitConfigPath = path.join(generatedDirectory, 'aliases.gitconfig');
  await writeFile(combinedGitConfigPath, renderAliasGitConfig(allAliases), 'utf8');
  generatedPaths.push(combinedGitConfigPath);

  // Generate combined docs
  const docsPath = path.join(docsDirectory, 'aliases.md');
  await writeFile(docsPath, renderAliasesMarkdown(allAliases), 'utf8');
  generatedPaths.push(docsPath);

  return { generatedPaths };
}
