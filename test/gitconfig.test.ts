import { describe, expect, test } from 'bun:test';
import { addIncludePath, addIncludePathAfter, removeIncludePath, renderAliasGitConfig, KIT_PRETTY_FORMAT_NAME, KIT_PRETTY_FORMAT } from '../src/core/gitconfig.js';

describe('gitconfig helpers', () => {
  test('renders alias gitconfig with pretty section', () => {
    expect(
      renderAliasGitConfig([
        { name: 's', command: 'status --short --branch' },
        { name: 'co', command: 'checkout' },
      ]),
    ).toBe(
      `[pretty]\n    ${KIT_PRETTY_FORMAT_NAME} = ${KIT_PRETTY_FORMAT}\n\n[alias]\n    s = status --short --branch\n    co = checkout\n`,
    );
  });

  test('inserts include block once', () => {
    const includePath = '/tmp/git-kit/aliases.gitconfig';
    const firstInsert = addIncludePath('[user]\n    name = Example\n', includePath);
    const secondInsert = addIncludePath(firstInsert.content, includePath);

    expect(firstInsert.changed).toBe(true);
    expect(firstInsert.content).toContain(`[include]\n    path = ${includePath}\n`);
    expect(secondInsert.changed).toBe(false);
  });

  test('preserves existing CRLF newlines when inserting include blocks', () => {
    const includePath = 'C:/git-kit/aliases.gitconfig';
    const result = addIncludePath('[user]\r\n    name = Example\r\n', includePath);

    expect(result.changed).toBe(true);
    expect(result.content).toContain(`\r\n\r\n[include]\r\n    path = ${includePath}\r\n`);
    expect(result.content).not.toContain('\n\n[include]\n');
  });

  test('removes only matching include block', () => {
    const includePath = '/tmp/git-kit/aliases.gitconfig';
    const content = `[include]\n    path = ${includePath}\n\n[include]\n    path = /tmp/other.gitconfig\n`;
    const result = removeIncludePath(content, includePath);

    expect(result.changed).toBe(true);
    expect(result.content).not.toContain(includePath);
    expect(result.content).toContain('/tmp/other.gitconfig');
  });

  test('preserves existing CRLF newlines when removing include blocks', () => {
    const includePath = 'C:/git-kit/aliases.gitconfig';
    const content = `[include]\r\n    path = ${includePath}\r\n\r\n[user]\r\n    name = Example\r\n`;
    const result = removeIncludePath(content, includePath);

    expect(result.changed).toBe(true);
    expect(result.content).toBe('[user]\r\n    name = Example\r\n');
  });

  describe('addIncludePathAfter', () => {
    test('inserts new include after the target include', () => {
      const managedPath = '/config/git-kit/aliases.gitconfig';
      const extraPath = '/home/user/.gitalias';
      const content = `[user]\n    name = Example\n\n[include]\n    path = ${managedPath}\n`;

      const result = addIncludePathAfter(content, extraPath, managedPath);

      expect(result.changed).toBe(true);
      const managedIndex = result.content.indexOf(managedPath);
      const extraIndex = result.content.indexOf(extraPath);
      expect(managedIndex).toBeGreaterThan(-1);
      // extra config must appear AFTER managed config so user aliases win
      expect(extraIndex).toBeGreaterThan(managedIndex);
    });

    test('falls back to appending when target include is not present', () => {
      const managedPath = '/config/git-kit/aliases.gitconfig';
      const extraPath = '/home/user/.gitalias';
      const content = '[user]\n    name = Example\n';

      const result = addIncludePathAfter(content, extraPath, managedPath);

      expect(result.changed).toBe(true);
      expect(result.content).toContain(extraPath);
    });

    test('is idempotent when the insert path is already present', () => {
      const managedPath = '/config/git-kit/aliases.gitconfig';
      const extraPath = '/home/user/.gitalias';
      const content = `[include]\n    path = ${managedPath}\n\n[include]\n    path = ${extraPath}\n`;

      const result = addIncludePathAfter(content, extraPath, managedPath);

      expect(result.changed).toBe(false);
    });
  });
});
