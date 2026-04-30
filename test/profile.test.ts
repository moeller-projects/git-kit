import { describe, expect, test } from 'bun:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { parseProfileJson, validateProfile, loadProfile, loadAllProfiles, gitconfigNameToYml } from '../src/core/profile.js';

const validProfileJson = JSON.stringify({
  name: 'lazy',
  description: 'Comfortable everyday aliases',
  includes: ['core.gitconfig', 'log.gitconfig'],
});

describe('profile parsing', () => {
  test('parses a valid profile', () => {
    const def = parseProfileJson(validProfileJson);

    expect(def.name).toBe('lazy');
    expect(def.description).toBe('Comfortable everyday aliases');
    expect(def.includes).toEqual(['core.gitconfig', 'log.gitconfig']);
  });

  test('parses a profile without a description', () => {
    const def = parseProfileJson(JSON.stringify({ name: 'minimal', includes: ['core.gitconfig'] }));

    expect(def.name).toBe('minimal');
    expect(def.description).toBeUndefined();
  });

  test('throws on invalid JSON', () => {
    expect(() => parseProfileJson('not-json')).toThrow(/Invalid JSON/);
  });

  test('throws on non-object JSON', () => {
    expect(() => parseProfileJson('"just a string"')).toThrow(/must be a JSON object/);
  });
});

describe('profile validation', () => {
  test('returns no issues for a valid profile', () => {
    const issues = validateProfile({ name: 'lazy', includes: ['core.gitconfig'] });

    expect(issues).toHaveLength(0);
  });

  test('detects empty name', () => {
    const issues = validateProfile({ name: '', includes: ['core.gitconfig'] });

    expect(issues.some((i) => i.code === 'empty-name')).toBe(true);
  });

  test('detects missing includes array', () => {
    const issues = validateProfile({ name: 'lazy', includes: undefined as unknown as string[] });

    expect(issues.some((i) => i.code === 'missing-includes')).toBe(true);
  });

  test('detects empty includes array', () => {
    const issues = validateProfile({ name: 'lazy', includes: [] });

    expect(issues.some((i) => i.code === 'empty-includes')).toBe(true);
  });

  test('detects includes entry that is not a .gitconfig filename', () => {
    const issues = validateProfile({ name: 'lazy', includes: ['core.yml'] });

    expect(issues.some((i) => i.code === 'invalid-includes')).toBe(true);
  });
});

describe('profile loading', () => {
  test('loads a profile from a file', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-profile-'));
    const profilePath = path.join(tempDirectory, 'lazy.json');

    await writeFile(profilePath, validProfileJson, 'utf8');

    const def = await loadProfile(profilePath);

    expect(def.name).toBe('lazy');
    expect(def.includes).toHaveLength(2);
  });

  test('loads all profiles from a directory', async () => {
    const tempDirectory = await mkdtemp(path.join(os.tmpdir(), 'git-kit-profiles-'));

    await writeFile(path.join(tempDirectory, 'minimal.json'), JSON.stringify({ name: 'minimal', includes: ['core.gitconfig'] }), 'utf8');
    await writeFile(path.join(tempDirectory, 'power.json'), JSON.stringify({ name: 'power', includes: ['core.gitconfig', 'log.gitconfig'] }), 'utf8');

    const profiles = await loadAllProfiles(tempDirectory);

    expect(profiles).toHaveLength(2);
    expect(profiles.map((p) => p.name)).toContain('minimal');
    expect(profiles.map((p) => p.name)).toContain('power');
  });
});

describe('gitconfigNameToYml', () => {
  test('converts core.gitconfig to core.yml', () => {
    expect(gitconfigNameToYml('core.gitconfig')).toBe('core.yml');
  });

  test('converts gitconfig extension to yml', () => {
    expect(gitconfigNameToYml('log.gitconfig')).toBe('log.yml');
  });
});
