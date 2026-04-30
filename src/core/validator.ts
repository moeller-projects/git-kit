import type { AliasEntry, AliasValidationIssue } from './aliases.js';
import { validateAliases } from './aliases.js';

export function validateAliasEntries(entries: AliasEntry[]): AliasValidationIssue[] {
  return validateAliases(entries);
}

export function ensureAliasEntries(entries: AliasEntry[]): AliasEntry[] {
  const issues = validateAliasEntries(entries);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join('\n'));
  }

  return entries;
}
