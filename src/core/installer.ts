import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';
import type { AliasEntry } from './aliases.js';
import { loadAliasesFromDirectory, loadAliasesFromFile } from './aliases.js';
import { addIncludePath, removeAllManagedIncludePaths, removeIncludePath, renderAliasGitConfig, resolveGlobalGitConfigPath } from './gitconfig.js';
import { getManagedAliasesPath, getManagedConfigDirectory, resolvePackagePath, resolveProfilePath } from './paths.js';
import { loadProfile, loadAliasesForProfile } from './profile.js';
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
  all?: boolean;
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
  removedAllFiles?: string[];
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

async function readAliasesForProfile(profileName: string): Promise<AliasEntry[]> {
  const profileDef = await loadProfile(resolveProfilePath(profileName));
  const entries = await loadAliasesForProfile(profileDef, resolvePackagePath('aliases'));
  return ensureAliasEntries(entries);
}

export async function installAliases(options: InstallOptions = {}): Promise<InstallResult> {
  const managedConfigDirectory = options.managedConfigDirectory ?? getManagedConfigDirectory();
  await ensureWritableDirectory(managedConfigDirectory);

  const managedAliasesPath = getManagedAliasesPath(managedConfigDirectory, options.profile);

  let aliases: AliasEntry[];
  if (options.aliasesFilePath != null) {
    aliases = await readAliases(options.aliasesFilePath);
  } else if (options.profile != null) {
    aliases = await readAliasesForProfile(options.profile);
  } else {
    aliases = await readAliasesFromDirectory(resolvePackagePath('aliases'));
  }
  const generatedConfig = renderAliasGitConfig(aliases);
  await writeFile(managedAliasesPath, generatedConfig, 'utf8');

  const globalGitConfigPath = options.globalGitConfigPath ?? resolveGlobalGitConfigPath(undefined, managedAliasesPath);
  const globalConfigExists = await fileExists(globalGitConfigPath);
  let globalContent = globalConfigExists ? await readFile(globalGitConfigPath, 'utf8') : '';
  let anyChanged = false;

  // Remove any OTHER git-kit-managed includes so only one is ever active at a time.
  // We only act when there are managed includes pointing to a different file; this
  // preserves idempotency when re-installing the same target.
  const targetForward = managedAliasesPath.replace(/\\/g, '/');
  const targetNorm = process.platform === 'win32' ? targetForward.toLowerCase() : targetForward;
  const scanResult = removeAllManagedIncludePaths(globalContent, managedConfigDirectory);
  const otherManagedPaths = scanResult.removedPaths.filter((p) => {
    const pForward = p.replace(/\\/g, '/');
    const pNorm = process.platform === 'win32' ? pForward.toLowerCase() : pForward;
    return pNorm !== targetNorm;
  });

  if (otherManagedPaths.length > 0) {
    // Strip all managed includes (removeAllManagedIncludePaths already did this
    // for the target too) and delete the orphaned files.
    globalContent = scanResult.content;
    anyChanged = true;
    for (const orphanedPath of otherManagedPaths) {
      await rm(path.normalize(orphanedPath), { force: true });
    }
  }

  // Add the managed aliases include (idempotent — skipped if already present).
  const managedResult = addIncludePath(globalContent, managedAliasesPath);
  if (managedResult.changed) {
    globalContent = managedResult.content;
    anyChanged = true;
  }

  let backupPath: string | undefined;
  if (anyChanged) {
    await mkdir(path.dirname(globalGitConfigPath), { recursive: true });
    backupPath = await backupIfNeeded(globalGitConfigPath);
    await writeFile(globalGitConfigPath, globalContent, 'utf8');
  }

  return {
    managedAliasesPath,
    globalGitConfigPath,
    includeAdded: managedResult.changed,
    backupPath,
  };
}

export async function uninstallAliases(options: UninstallOptions = {}): Promise<UninstallResult> {
  const managedConfigDirectory = options.managedConfigDirectory ?? getManagedConfigDirectory();
  const managedAliasesPath = getManagedAliasesPath(managedConfigDirectory, options.profile);
  const globalGitConfigPath = options.globalGitConfigPath ?? resolveGlobalGitConfigPath(undefined, managedAliasesPath);

  if (options.all) {
    // Remove every git-kit-managed include from the global config.
    const globalConfigExists = await fileExists(globalGitConfigPath);
    let includeRemoved = false;
    let backupPath: string | undefined;

    if (globalConfigExists) {
      const existingGlobalConfig = await readFile(globalGitConfigPath, 'utf8');
      const removeResult = removeAllManagedIncludePaths(existingGlobalConfig, managedConfigDirectory);
      if (removeResult.changed) {
        backupPath = await backupIfNeeded(globalGitConfigPath);
        await writeFile(globalGitConfigPath, removeResult.content, 'utf8');
        includeRemoved = true;
      }
    }

    // Delete every *.gitconfig file in the managed directory.
    const removedAllFiles: string[] = [];
    try {
      const entries = await readdir(managedConfigDirectory);
      for (const entry of entries) {
        if (entry.endsWith('.gitconfig')) {
          const filePath = path.join(managedConfigDirectory, entry);
          await rm(filePath, { force: true });
          removedAllFiles.push(filePath);
        }
      }
    } catch {
      // Managed directory does not exist — nothing to delete.
    }

    return {
      managedAliasesPath,
      globalGitConfigPath,
      includeRemoved,
      removedManagedFile: removedAllFiles.length > 0,
      backupPath,
      removedAllFiles,
    };
  }

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
