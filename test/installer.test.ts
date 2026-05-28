import { describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
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
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');
    const managedAliasesPath = path.join(managedConfigDirectory, 'aliases.gitconfig');

    await mkdir(managedConfigDirectory, { recursive: true });
    await writeFile(managedAliasesPath, '[alias]\n    s = status\n', 'utf8');
    await writeFile(
      globalGitConfigPath,
      `[include]\n    path = ${managedAliasesPath}\n\n[include]\n    path = /tmp/keep.gitconfig\n`,
      'utf8',
    );

    const result = await uninstallAliases({ managedConfigDirectory, globalGitConfigPath });
    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');

    expect(result.includeRemoved).toBe(true);
    expect(result.removedManagedFile).toBe(true);
    expect(globalConfigContent).not.toContain(managedAliasesPath);
    expect(globalConfigContent).toContain('/tmp/keep.gitconfig');
  });

  test('installs using a named profile', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-profile-install-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    const result = await installAliases({ profile: 'minimal', managedConfigDirectory, globalGitConfigPath });

    expect(result.includeAdded).toBe(true);
    expect(result.managedAliasesPath).toContain('minimal.gitconfig');

    const managedContent = await readFile(result.managedAliasesPath, 'utf8');
    expect(managedContent).toContain('[alias]');
  });

  test('installs using the default directory (all aliases)', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-dir-install-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    const result = await installAliases({ managedConfigDirectory, globalGitConfigPath });

    expect(result.includeAdded).toBe(true);
    expect(result.managedAliasesPath).toContain('aliases.gitconfig');

    const managedContent = await readFile(result.managedAliasesPath, 'utf8');
    expect(managedContent).toContain('[alias]');
  });

  test('switching from full install to profile removes old include and its file', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-switch-'));
    const aliasesFilePath = path.join(tempDirectory, 'aliases.yml');
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(aliasesFilePath, fixtureAliases, 'utf8');
    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    // First: full install
    const fullResult = await installAliases({ aliasesFilePath, managedConfigDirectory, globalGitConfigPath });
    expect(fullResult.includeAdded).toBe(true);
    expect(fullResult.managedAliasesPath).toContain('aliases.gitconfig');

    // Second: switch to profile install
    const profileResult = await installAliases({ profile: 'minimal', managedConfigDirectory, globalGitConfigPath });
    expect(profileResult.includeAdded).toBe(true);
    expect(profileResult.managedAliasesPath).toContain('minimal.gitconfig');

    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');
    // Only the profile include should remain
    expect(globalConfigContent).toContain('minimal.gitconfig');
    expect(globalConfigContent).not.toContain('aliases.gitconfig');
    // The old managed file should have been deleted
    const { existsSync } = await import('node:fs');
    expect(existsSync(fullResult.managedAliasesPath)).toBe(false);
  });

  test('switching from one profile to another removes old include and its file', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-profile-switch-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    // Install minimal
    const minimalResult = await installAliases({ profile: 'minimal', managedConfigDirectory, globalGitConfigPath });
    expect(minimalResult.includeAdded).toBe(true);

    // Switch to power
    const powerResult = await installAliases({ profile: 'power', managedConfigDirectory, globalGitConfigPath });
    expect(powerResult.includeAdded).toBe(true);

    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');
    // Only power include should remain
    expect(globalConfigContent).toContain('power.gitconfig');
    expect(globalConfigContent).not.toContain('minimal.gitconfig');
    // Occurrence count — exactly one include for power
    expect(globalConfigContent.match(/power\.gitconfig/g)?.length).toBe(1);
    // Old managed file deleted
    const { existsSync } = await import('node:fs');
    expect(existsSync(minimalResult.managedAliasesPath)).toBe(false);
  });

  test('uninstall --all removes all managed includes and deletes all managed files', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-uninstall-all-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    // Install two different managed files to simulate a stale state
    const minimalResult = await installAliases({ profile: 'minimal', managedConfigDirectory, globalGitConfigPath });
    // Manually add a second stale include to simulate legacy state
    const staleInclude = `\n[include]\n    path = ${managedConfigDirectory}/aliases.gitconfig\n`;
    const currentContent = await readFile(globalGitConfigPath, 'utf8');
    await writeFile(globalGitConfigPath, currentContent + staleInclude, 'utf8');
    // Also create the stale file
    await writeFile(path.join(managedConfigDirectory, 'aliases.gitconfig'), '[alias]\n', 'utf8');

    const result = await uninstallAliases({ managedConfigDirectory, globalGitConfigPath, all: true });

    expect(result.includeRemoved).toBe(true);
    expect(result.removedManagedFile).toBe(true);
    expect(result.removedAllFiles?.length).toBeGreaterThanOrEqual(2);

    const globalConfigContent = await readFile(globalGitConfigPath, 'utf8');
    expect(globalConfigContent).not.toContain('minimal.gitconfig');
    expect(globalConfigContent).not.toContain('aliases.gitconfig');
    expect(globalConfigContent).toContain('name = Example');

    // Managed files are gone
    const { existsSync } = await import('node:fs');
    expect(existsSync(minimalResult.managedAliasesPath)).toBe(false);
    expect(existsSync(path.join(managedConfigDirectory, 'aliases.gitconfig'))).toBe(false);
  });

  test('uninstall --all reports nothing to remove when there are no managed includes', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-uninstall-all-empty-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    const result = await uninstallAliases({ managedConfigDirectory, globalGitConfigPath, all: true });

    expect(result.includeRemoved).toBe(false);
    expect(result.removedManagedFile).toBe(false);
    expect(result.removedAllFiles).toEqual([]);
  });


  test('rejects profile names with path traversal characters', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-security-'));
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await expect(
      installAliases({ profile: '../etc/passwd', managedConfigDirectory, globalGitConfigPath }),
    ).rejects.toThrow(/Invalid profile name/);

    await expect(
      installAliases({ profile: 'foo/bar', managedConfigDirectory, globalGitConfigPath }),
    ).rejects.toThrow(/Invalid profile name/);
  });

  test('creates unique backup files when multiple backups share a timestamp', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-backup-'));
    const aliasesFilePath = path.join(tempDirectory, 'aliases.yml');
    const managedConfigDirectory = path.join(tempDirectory, 'managed');
    const globalGitConfigPath = path.join(tempDirectory, '.gitconfig');

    await writeFile(aliasesFilePath, fixtureAliases, 'utf8');
    await writeFile(globalGitConfigPath, '[user]\n    name = Example\n', 'utf8');

    const RealDate = Date;
    const fixedNow = new RealDate('2026-04-30T09:44:00.123Z');

    class MockDate extends RealDate {
      constructor(value?: ConstructorParameters<typeof Date>[0]) {
        super(value ?? fixedNow.valueOf());
      }

      static override now(): number {
        return fixedNow.valueOf();
      }
    }

    globalThis.Date = MockDate as DateConstructor;

    try {
      await installAliases({ aliasesFilePath, managedConfigDirectory, globalGitConfigPath });
      await uninstallAliases({ managedConfigDirectory, globalGitConfigPath });
    } finally {
      globalThis.Date = RealDate;
    }

    const backupFiles = (await readdir(tempDirectory)).filter((filename) => filename.includes('.gitconfig.git-kit-backup-'));

    expect(backupFiles).toHaveLength(2);
    expect(new Set(backupFiles).size).toBe(2);
  });
});
