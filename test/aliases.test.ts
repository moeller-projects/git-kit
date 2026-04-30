import { describe, expect, test } from 'bun:test';
import { parseAliasesYaml } from '../src/core/aliases.js';
import { validateAliasEntries } from '../src/core/validator.js';

const baseYaml = `aliases:\n  st:\n    command: status\n    description: Show status\n    category: core\n    risk: safe\n`;

describe('alias parsing', () => {
  test('parses aliases from yaml', () => {
    const aliases = parseAliasesYaml(baseYaml);

    expect(aliases).toEqual([
      {
        name: 'st',
        command: 'status',
        description: 'Show status',
        category: 'core',
        risk: 'safe',
      },
    ]);
  });

  test('detects duplicate aliases', () => {
    const aliases = parseAliasesYaml(`aliases:\n  st:\n    command: status\n    description: Show status\n    category: core\n    risk: safe\n  st:\n    command: status -sb\n    description: Show status short\n    category: core\n    risk: safe\n`);
    const issues = validateAliasEntries(aliases);

    expect(issues.some((issue) => issue.code === 'duplicate-alias')).toBe(true);
  });

  test('validates shell alias risk', () => {
    const aliases = parseAliasesYaml(`aliases:\n  sheller:\n    command: !git status\n    description: Run shell command\n    category: core\n    risk: safe\n`);
    const issues = validateAliasEntries(aliases);

    expect(issues.some((issue) => issue.code === 'unsafe-shell-risk')).toBe(true);
  });
});
