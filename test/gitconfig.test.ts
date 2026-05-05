import { describe, expect, test } from 'bun:test';
import { addIncludePath, removeIncludePath, renderAliasGitConfig } from '../src/core/gitconfig.js';

describe('gitconfig helpers', () => {
  test('renders alias gitconfig — simple commands are left unquoted', () => {
    expect(
      renderAliasGitConfig([
        { name: 's', command: 'status --short --branch' },
        { name: 'co', command: 'checkout' },
      ]),
    ).toBe('[alias]\n    s = status --short --branch\n    co = checkout\n');
  });

  test('renders alias gitconfig — shell functions are wrapped in outer quotes', () => {
    // Commands containing `"`, `;`, `#`, or `\` must be quoted so that git's
    // config parser does not mistake `;` / `#` for comment-starters or `"`
    // for quoted-section delimiters.
    // Commands are expected to be single-line; newlines are not handled.
    expect(
      renderAliasGitConfig([
        { name: 'lo', command: '!f() { git log "$@" --oneline; }; f' },
        { name: 'gn', command: 'grep --line-number' },
      ]),
    ).toBe('[alias]\n    lo = "!f() { git log \\"$@\\" --oneline; }; f"\n    gn = grep --line-number\n');
  });

  test('renders alias gitconfig — backslashes are double-escaped inside outer quotes', () => {
    expect(
      renderAliasGitConfig([{ name: 'hld', command: '!f() { git branch --merged | grep -v "^\\s*\\*"; }; f' }]),
    ).toBe('[alias]\n    hld = "!f() { git branch --merged | grep -v \\"^\\\\s*\\\\*\\"; }; f"\n');
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
});
