import { installAliases } from '../core/installer.js';

export async function installCommand(profile?: string): Promise<string> {
  const result = await installAliases({ profile });
  const status = result.includeAdded ? 'installed' : 'already installed';
  return `git-kit ${status}: ${result.managedAliasesPath}`;
}
