import { describe, expect, test } from 'bun:test';
import { addIncludePath, removeIncludePath, renderAliasGitConfig } from '../src/core/gitconfig.js';

describe('gitconfig helpers', () => {
  test('renders alias gitconfig', () => {
    expect(
      renderAliasGitConfig([
        { name: 's', command: 'status --short --branch' },
        { name: 'co', command: 'checkout' },
      ]),
    ).toBe(`[alias]\n    s = status --short --branch\n    co = checkout\n`);
  });

  test('inserts include block once', () => {
    const includePath = '/tmp/git-kit/aliases.gitconfig';
    const firstInsert = addIncludePath('[user]\n    name = Example\n', includePath);
    const secondInsert = addIncludePath(firstInsert.content, includePath);

    expect(firstInsert.changed).toBe(true);
    expect(firstInsert.content).toContain(`[include]\n    path = ${includePath}\n`);
    expect(secondInsert.changed).toBe(false);
  });

  test('removes only matching include block', () => {
    const includePath = '/tmp/git-kit/aliases.gitconfig';
    const content = `[include]\n    path = ${includePath}\n\n[include]\n    path = /tmp/other.gitconfig\n`;
    const result = removeIncludePath(content, includePath);

    expect(result.changed).toBe(true);
    expect(result.content).not.toContain(includePath);
    expect(result.content).toContain('/tmp/other.gitconfig');
  });
});
