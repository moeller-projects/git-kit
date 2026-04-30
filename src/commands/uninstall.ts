import { uninstallAliases } from '../core/installer.js';

export async function uninstallCommand(profile?: string): Promise<string> {
  const result = await uninstallAliases({ profile });
  const removedParts: string[] = [];

  if (result.includeRemoved) {
    removedParts.push(`include from ${result.globalGitConfigPath}`);
  }

  if (result.removedManagedFile) {
    removedParts.push(`managed file ${result.managedAliasesPath}`);
  }

  if (removedParts.length === 0) {
    return 'git-kit uninstall: nothing to remove';
  }

  return `git-kit uninstall removed ${removedParts.join(' and ')}`;
}
