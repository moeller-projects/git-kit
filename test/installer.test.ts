import { describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { installAliases, uninstallAliases } from '../src/core/installer.js';

const fixtureAliases = `aliases:\n  s:\n    command: status --short --branch\n    description: Compact status with branch info\n    category: core\n    risk: safe\n`;

describe('installer', () => {
  test('install is idempotent', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-install-'));
    const aliasesFilePath = path.join(tempDirectory, 'aliases.yml');
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(aliasesFilePath, fixtureAliases, 'utf8');
    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    const firstInstall = await installAliases({ aliasesFilePath, managedConfigDirectory, globalGitConfigPath });
    const secondInstall = await installAliases({ aliasesFilePath, managedConfigDirectory, globalGitConfigPath });
    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');

    expect(firstInstall.includeAdded).toBe(true);
    expect(secondInstall.includeAdded).toBe(false);
    expect(globalConfigContent.match(/aliases\.gitconfig/g)?.length).toBe(1);
  });

  test('uninstall leaves unrelated includes untouched', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-uninstall-'));
    const aliasesFilePath = path.join(tempDirectory, 'aliases.yml');
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');
    const managedAliasesPath = path.join(managedConfigDirectory, 'aliases.gitconfig');

    await mkdir(managedConfigDirectory, { recursive: true });
    await writeFile(aliasesFilePath, fixtureAliases, 'utf8');
    await writeFile(managedAliasesPath, '[alias]\n    s = status\n', 'utf8');
    await writeFile(
      globalGitConfigPath,
      `[include]\n    path = ${managedAliasesPath}\n\n[include]\n    path = /tmp/keep.gitconfig\n`,
      'utf8',
    );

    const result = await uninstallAliases({ aliasesFilePath, managedConfigDirectory, globalGitConfigPath });
    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');

    expect(result.includeRemoved).toBe(true);
    expect(result.removedManagedFile).toBe(true);
    expect(globalConfigContent).not.toContain(managedAliasesPath);
    expect(globalConfigContent).toContain('/tmp/keep.gitconfig');
  });
});
