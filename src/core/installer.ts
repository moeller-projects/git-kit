import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import type { AliasEntry } from './aliases.js';
import { loadAliasesFromDirectory, loadAliasesFromFile } from './aliases.js';
import { addIncludePath, removeIncludePath, renderAliasGitConfig, resolveGlobalGitConfigPath } from './gitconfig.js';
import { getManagedAliasesPath, getManagedConfigDirectory, resolvePackagePath } from './paths.js';
import { ensureAliasEntries } from './validator.js';

export interface InstallOptions {
  aliasesFilePath?: string;
  profile?: string;
  managedConfigDirectory?: string;
  globalGitConfigPath?: string;
}

export interface UninstallOptions {
  profile?: string;
  managedConfigDirectory?: string;
  globalGitConfigPath?: string;
}

export interface InstallResult {
  managedAliasesPath: string;
  globalGitConfigPath: string;
  includeAdded: boolean;
  backupPath?: string;
}

export interface UninstallResult {
  managedAliasesPath: string;
  globalGitConfigPath: string;
  includeRemoved: boolean;
  removedManagedFile: boolean;
  backupPath?: string;
}

function createBackupTimestamp(date: Date = new Date()): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  const millisecond = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}${month}${day}${hour}${minute}${second}${millisecond}`;
}

async function resolveBackupPath(filePath: string): Promise<string> {
  const baseBackupPath = `${filePath}.git-kit-backup-${createBackupTimestamp()}`;

  if (!(await fileExists(baseBackupPath))) {
    return baseBackupPath;
  }

  let suffix = 1;
  let backupPath = `${baseBackupPath}-${suffix}`;
  while (await fileExists(backupPath)) {
    suffix += 1;
    backupPath = `${baseBackupPath}-${suffix}`;
  }

  return backupPath;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureWritableDirectory(directoryPath: string): Promise<void> {
  await mkdir(directoryPath, { recursive: true });
  await access(directoryPath, fsConstants.W_OK);
}

async function backupIfNeeded(filePath: string): Promise<string | undefined> {
  if (!(await fileExists(filePath))) {
    return undefined;
  }

  const backupPath = await resolveBackupPath(filePath);
  await copyFile(filePath, backupPath);
  return backupPath;
}

async function readAliases(aliasesFilePath: string): Promise<AliasEntry[]> {
  const aliases = await loadAliasesFromFile(aliasesFilePath);
  return ensureAliasEntries(aliases);
}

async function readAliasesFromDirectory(dirPath: string): Promise<AliasEntry[]> {
  const aliases = await loadAliasesFromDirectory(dirPath);
  return ensureAliasEntries(aliases);
}

export async function installAliases(options: InstallOptions = {}): Promise<InstallResult> {
  const managedConfigDirectory = options.managedConfigDirectory ?? getManagedConfigDirectory();
  await ensureWritableDirectory(managedConfigDirectory);

  const managedAliasesPath = getManagedAliasesPath(managedConfigDirectory, options.profile);

  let aliases: AliasEntry[];
  if (options.aliasesFilePath != null) {
    aliases = await readAliases(options.aliasesFilePath);
  } else if (options.profile != null) {
    aliases = await readAliases(resolvePackagePath('aliases', `${options.profile}.yml`));
  } else {
    aliases = await readAliasesFromDirectory(resolvePackagePath('aliases'));
  }
  const generatedConfig = renderAliasGitConfig(aliases);
  await writeFile(managedAliasesPath, generatedConfig, 'utf8');

  const globalGitConfigPath = options.globalGitConfigPath ?? resolveGlobalGitConfigPath(undefined, managedAliasesPath);
  const globalConfigExists = await fileExists(globalGitConfigPath);
  const existingGlobalConfig = globalConfigExists ? await readFile(globalGitConfigPath, 'utf8') : '';
  const updatedGlobalConfig = addIncludePath(existingGlobalConfig, managedAliasesPath);

  let backupPath: string | undefined;
  if (updatedGlobalConfig.changed) {
    await mkdir(path.dirname(globalGitConfigPath), { recursive: true });
    backupPath = await backupIfNeeded(globalGitConfigPath);
    await writeFile(globalGitConfigPath, updatedGlobalConfig.content, 'utf8');
  }

  return {
    managedAliasesPath,
    globalGitConfigPath,
    includeAdded: updatedGlobalConfig.changed,
    backupPath,
  };
}

export async function uninstallAliases(options: UninstallOptions = {}): Promise<UninstallResult> {
  const managedConfigDirectory = options.managedConfigDirectory ?? getManagedConfigDirectory();
  const managedAliasesPath = getManagedAliasesPath(managedConfigDirectory, options.profile);
  const globalGitConfigPath = options.globalGitConfigPath ?? resolveGlobalGitConfigPath(undefined, managedAliasesPath);
  const globalConfigExists = await fileExists(globalGitConfigPath);

  let includeRemoved = false;
  let backupPath: string | undefined;

  if (globalConfigExists) {
    const existingGlobalConfig = await readFile(globalGitConfigPath, 'utf8');
    const updatedGlobalConfig = removeIncludePath(existingGlobalConfig, managedAliasesPath);

    if (updatedGlobalConfig.changed) {
      backupPath = await backupIfNeeded(globalGitConfigPath);
      await writeFile(globalGitConfigPath, updatedGlobalConfig.content, 'utf8');
      includeRemoved = true;
    }
  }

  const removedManagedFile = await fileExists(managedAliasesPath);
  if (removedManagedFile) {
    await rm(managedAliasesPath, { force: true });
  }

  return {
    managedAliasesPath,
    globalGitConfigPath,
    includeRemoved,
    removedManagedFile,
    backupPath,
  };
}
