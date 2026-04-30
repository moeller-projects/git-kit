import { access, mkdir, readFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { loadAliasesFromDirectory } from '../core/aliases.js';
import { hasIncludePath, renderAliasGitConfig } from '../core/gitconfig.js';
import { resolveGlobalGitConfigPath } from '../core/gitconfig.js';
import { getManagedAliasesPath, getManagedConfigDirectory, resolvePackagePath, getDefaultGlobalGitConfigPath } from '../core/paths.js';
import { validateAliasEntries } from '../core/validator.js';

export interface DoctorCheck {
  label: string;
  ok: boolean;
  detail: string;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function doctorCommand(): Promise<DoctorCheck[]> {
  const managedConfigDirectory = getManagedConfigDirectory();
  const managedAliasesPath = getManagedAliasesPath(managedConfigDirectory);
  const aliasesDirectory = resolvePackagePath('aliases');
  const generatedGitConfigPath = resolvePackagePath('generated', 'aliases.gitconfig');
  const aliases = await loadAliasesFromDirectory(aliasesDirectory);
  const issues = validateAliasEntries(aliases);
  const globalGitConfigPath = resolveGlobalGitConfigPath(undefined, managedAliasesPath);
  const checks: DoctorCheck[] = [];

  const gitVersion = spawnSync('git', ['--version'], { encoding: 'utf8' });
  checks.push({
    label: 'Git is installed',
    ok: gitVersion.status === 0,
    detail: gitVersion.status === 0 ? gitVersion.stdout.trim() : 'git executable not found',
  });

  const canUseGlobalConfig =
    (await exists(globalGitConfigPath)) ||
    (await (async () => {
      try {
        await mkdir(path.dirname(globalGitConfigPath), { recursive: true });
        await access(path.dirname(globalGitConfigPath), fsConstants.W_OK);
        return true;
      } catch {
        return false;
      }
    })());
  checks.push({
    label: 'Global Git config exists or can be created',
    ok: canUseGlobalConfig,
    detail: globalGitConfigPath || getDefaultGlobalGitConfigPath(),
  });

  let managedDirectoryWritable = false;
  try {
    await mkdir(managedConfigDirectory, { recursive: true });
    await access(managedConfigDirectory, fsConstants.W_OK);
    managedDirectoryWritable = true;
  } catch {
    managedDirectoryWritable = false;
  }
  checks.push({
    label: 'Managed config directory is writable',
    ok: managedDirectoryWritable,
    detail: managedConfigDirectory,
  });

  const renderedGitConfig = renderAliasGitConfig(aliases);
  const generatedGitConfigExists = await exists(generatedGitConfigPath);
  const generatedGitConfig = generatedGitConfigExists ? await readFile(generatedGitConfigPath, 'utf8') : '';
  checks.push({
    label: 'Generated alias config is valid',
    ok: issues.length === 0 && generatedGitConfigExists && generatedGitConfig === renderedGitConfig,
    detail: generatedGitConfigExists ? generatedGitConfigPath : 'generated/aliases.gitconfig is missing',
  });

  const globalConfigContent = (await exists(globalGitConfigPath)) ? await readFile(globalGitConfigPath, 'utf8') : '';
  checks.push({
    label: 'Managed include path exists in global config',
    ok: globalConfigContent.length > 0 && hasIncludePath(globalConfigContent, managedAliasesPath),
    detail: `${globalGitConfigPath} -> ${managedAliasesPath}`,
  });

  checks.push({
    label: 'No duplicate alias names exist in source YAML',
    ok: !issues.some((issue) => issue.code === 'duplicate-alias'),
    detail: issues.filter((issue) => issue.code === 'duplicate-alias').map((issue) => issue.message).join('; ') || 'ok',
  });

  checks.push({
    label: 'Shell aliases use medium or dangerous risk',
    ok: !issues.some((issue) => issue.code === 'unsafe-shell-risk'),
    detail: issues.filter((issue) => issue.code === 'unsafe-shell-risk').map((issue) => issue.message).join('; ') || 'ok',
  });

  checks.push({
    label: 'Required fields exist for each alias',
    ok: !issues.some((issue) => ['empty-command', 'empty-description', 'empty-category', 'empty-risk', 'invalid-risk', 'empty-alias'].includes(issue.code)),
    detail: issues
      .filter((issue) => ['empty-command', 'empty-description', 'empty-category', 'empty-risk', 'invalid-risk', 'empty-alias'].includes(issue.code))
      .map((issue) => issue.message)
      .join('; ') || 'ok',
  });

  return checks;
}
