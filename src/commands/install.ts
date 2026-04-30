import { installAliases } from '../core/installer.js';

export async function installCommand(): Promise<string> {
  const result = await installAliases();
  const status = result.includeAdded ? 'installed' : 'already installed';
  return `git-kit ${status}: ${result.managedAliasesPath}`;
}
