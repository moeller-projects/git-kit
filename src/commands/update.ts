import { installAliases } from '../core/installer.js';

export async function updateCommand(profile?: string): Promise<string> {
  const result = await installAliases({ profile });
  return `git-kit updated: ${result.managedAliasesPath}`;
}
