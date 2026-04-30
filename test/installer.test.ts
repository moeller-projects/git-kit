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
