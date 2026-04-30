import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadAliasesFromFile } from '../core/aliases.js';
import { renderAliasGitConfig, renderAliasesMarkdown } from '../core/gitconfig.js';
import { resolvePackagePath } from '../core/paths.js';
import { ensureAliasEntries } from '../core/validator.js';

export async function generateCommand(): Promise<{ generatedGitConfigPath: string; generatedDocsPath: string }> {
  const aliasesFilePath = resolvePackagePath('aliases', 'aliases.yml');
  const generatedGitConfigPath = resolvePackagePath('generated', 'aliases.gitconfig');
  const generatedDocsPath = resolvePackagePath('docs', 'aliases.md');

  const aliases = ensureAliasEntries(await loadAliasesFromFile(aliasesFilePath));

  await mkdir(path.dirname(generatedGitConfigPath), { recursive: true });
  await mkdir(path.dirname(generatedDocsPath), { recursive: true });
  await writeFile(generatedGitConfigPath, renderAliasGitConfig(aliases), 'utf8');
  await writeFile(generatedDocsPath, renderAliasesMarkdown(aliases), 'utf8');

  return {
    generatedGitConfigPath,
    generatedDocsPath,
  };
}
