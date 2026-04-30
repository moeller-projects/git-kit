import os from 'node:os';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function findPackageRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;

  while (true) {
    if (existsSync(path.join(currentDirectory, 'package.json'))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      throw new Error('Unable to locate package root.');
    }

    currentDirectory = parentDirectory;
  }
}

export function getPackageRoot(from: string = fileURLToPath(import.meta.url)): string {
  return findPackageRoot(path.dirname(from));
}

export function resolvePackagePath(...segments: string[]): string {
  return path.join(getPackageRoot(), ...segments);
}

export function getHomeDirectory(): string {
  return os.homedir();
}

export function getManagedConfigDirectory(platform: NodeJS.Platform = process.platform, env: NodeJS.ProcessEnv = process.env): string {
  if (platform === 'win32') {
    const appDataDirectory = env.APPDATA;
    if (!appDataDirectory) {
      throw new Error('APPDATA is required on Windows.');
    }

    return path.join(appDataDirectory, 'git-kit');
  }

  return path.join(getHomeDirectory(), '.config', 'git-kit');
}

export function resolveProfilePath(name: string): string {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(name)) {
    throw new Error(`Invalid profile name: "${name}". Profile names may only contain lowercase letters, digits, hyphens, and underscores.`);
  }
  return resolvePackagePath('profiles', `${name}.json`);
}

export function getManagedAliasesPath(managedConfigDirectory: string, profile?: string): string {
  if (profile != null && profile.length > 0) {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(profile)) {
      throw new Error(`Invalid profile name: "${profile}". Profile names may only contain lowercase letters, digits, hyphens, and underscores.`);
    }
    return path.join(managedConfigDirectory, `${profile}.gitconfig`);
  }
  return path.join(managedConfigDirectory, 'aliases.gitconfig');
}

export function getDefaultGlobalGitConfigPath(homeDirectory: string = getHomeDirectory()): string {
  return path.join(homeDirectory, '.gitconfig');
}
