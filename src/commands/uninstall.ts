import { uninstallAliases } from '../core/installer.js';

export async function uninstallCommand(profile?: string, all?: boolean): Promise<string> {
  const result = await uninstallAliases({ profile, all });

  if (all) {
    const fileParts: string[] = [];
    if (result.includeRemoved) {
      fileParts.push(`all git-kit includes from ${result.globalGitConfigPath}`);
    }
    if (result.removedAllFiles != null && result.removedAllFiles.length > 0) {
      fileParts.push(`${result.removedAllFiles.length} managed file(s)`);
    }
    if (fileParts.length === 0) {
      return 'git-kit uninstall --all: nothing to remove';
    }
    return `git-kit uninstall --all removed ${fileParts.join(' and ')}`;
  }

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
