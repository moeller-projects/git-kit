import { readFile } from 'node:fs/promises';
import { parseDocument, isMap, type ParsedNode, type YAMLMap } from 'yaml';

export type AliasRisk = 'safe' | 'medium' | 'dangerous';

export interface AliasEntry {
  name: string;
  command: string;
  description: string;
  category: string;
  risk: string;
}

export interface AliasValidationIssue {
  code:
    | 'duplicate-alias'
    | 'empty-alias'
    | 'empty-command'
    | 'empty-description'
    | 'empty-category'
    | 'empty-risk'
    | 'invalid-risk'
    | 'unsafe-shell-risk';
  message: string;
}

const validRisks = new Set<AliasRisk>(['safe', 'medium', 'dangerous']);

function readScalar(node: ParsedNode | null | undefined): string {
  if (node == null) {
    return '';
  }

  if ('value' in node) {
    return String(node.value ?? '').trim();
  }

  return String(node.toJSON() ?? '').trim();
}

function readRequiredString(map: YAMLMap<ParsedNode, ParsedNode>, key: string): string {
  return readScalar(map.get(key, true) as ParsedNode | undefined);
}

export function parseAliasesYaml(content: string): AliasEntry[] {
  const document = parseDocument(content, { uniqueKeys: false });

  if (document.errors.length > 0) {
    throw new Error(document.errors.map((error) => error.message).join('\n'));
  }

  if (!isMap(document.contents)) {
    throw new Error('aliases.yml must contain a top-level mapping.');
  }

  const aliasesNode = document.contents.get('aliases', true) as ParsedNode | undefined;
  if (!isMap(aliasesNode)) {
    throw new Error('aliases.yml must contain an aliases mapping.');
  }

  return aliasesNode.items.map((item) => {
    const name = readScalar(item.key as ParsedNode | undefined);
    const valueNode = item.value as ParsedNode | undefined;

    if (!isMap(valueNode)) {
      return {
        name,
        command: '',
        description: '',
        category: '',
        risk: '',
      } satisfies AliasEntry;
    }

    return {
      name,
      command: readRequiredString(valueNode, 'command'),
      description: readRequiredString(valueNode, 'description'),
      category: readRequiredString(valueNode, 'category'),
      risk: readRequiredString(valueNode, 'risk'),
    } satisfies AliasEntry;
  });
}

export async function loadAliasesFromFile(filePath: string): Promise<AliasEntry[]> {
  const content = await readFile(filePath, 'utf8');
  return parseAliasesYaml(content);
}

export function validateAliases(entries: AliasEntry[]): AliasValidationIssue[] {
  const issues: AliasValidationIssue[] = [];
  const seenAliases = new Set<string>();

  for (const entry of entries) {
    if (entry.name.length === 0) {
      issues.push({
        code: 'empty-alias',
        message: 'Alias key must not be empty.',
      });
    } else if (seenAliases.has(entry.name)) {
      issues.push({
        code: 'duplicate-alias',
        message: `Duplicate alias detected: ${entry.name}`,
      });
    } else {
      seenAliases.add(entry.name);
    }

    if (entry.command.length === 0) {
      issues.push({
        code: 'empty-command',
        message: `Alias ${entry.name || '<empty>'} must define a command.`,
      });
    }

    if (entry.description.length === 0) {
      issues.push({
        code: 'empty-description',
        message: `Alias ${entry.name || '<empty>'} must define a description.`,
      });
    }

    if (entry.category.length === 0) {
      issues.push({
        code: 'empty-category',
        message: `Alias ${entry.name || '<empty>'} must define a category.`,
      });
    }

    if (entry.risk.length === 0) {
      issues.push({
        code: 'empty-risk',
        message: `Alias ${entry.name || '<empty>'} must define a risk.`,
      });
    } else if (!validRisks.has(entry.risk as AliasRisk)) {
      issues.push({
        code: 'invalid-risk',
        message: `Alias ${entry.name || '<empty>'} has invalid risk ${entry.risk}.`,
      });
    }

    if (entry.command.startsWith('!') && entry.risk === 'safe') {
      issues.push({
        code: 'unsafe-shell-risk',
        message: `Shell alias ${entry.name || '<empty>'} must have risk medium or dangerous.`,
      });
    }
  }

  return issues;
}

export function assertValidAliases(entries: AliasEntry[]): AliasEntry[] {
  const issues = validateAliases(entries);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => `- ${issue.message}`).join('\n'));
  }

  return entries;
}

export function groupAliasesByCategory(entries: AliasEntry[]): Map<string, AliasEntry[]> {
  const grouped = new Map<string, AliasEntry[]>();

  for (const entry of entries) {
    const categoryEntries = grouped.get(entry.category) ?? [];
    categoryEntries.push(entry);
    grouped.set(entry.category, categoryEntries);
  }

  return new Map([...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)));
}
