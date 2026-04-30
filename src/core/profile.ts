import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { AliasEntry } from './aliases.js';
import { loadAliasesFromFile } from './aliases.js';

export interface ProfileDefinition {
  name: string;
  description?: string;
  includes: string[];
}

export interface ProfileValidationIssue {
  code: 'empty-name' | 'missing-includes' | 'empty-includes' | 'invalid-includes';
  message: string;
}

export function validateProfile(def: ProfileDefinition): ProfileValidationIssue[] {
  const issues: ProfileValidationIssue[] = [];

  if (typeof def.name !== 'string' || def.name.trim().length === 0) {
    issues.push({ code: 'empty-name', message: 'Profile must have a non-empty name.' });
  }

  if (!Array.isArray(def.includes)) {
    issues.push({ code: 'missing-includes', message: 'Profile must have an includes array.' });
  } else if (def.includes.length === 0) {
    issues.push({ code: 'empty-includes', message: 'Profile includes must not be empty.' });
  } else {
    for (const entry of def.includes) {
      if (typeof entry !== 'string' || !entry.endsWith('.gitconfig')) {
        issues.push({ code: 'invalid-includes', message: `Profile include entry must be a .gitconfig filename, got: ${String(entry)}` });
      }
    }
  }

  return issues;
}

export function parseProfileJson(content: string, source: string = '<unknown>'): ProfileDefinition {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in profile ${source}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Profile ${source} must be a JSON object.`);
  }

  const def = parsed as ProfileDefinition;
  const issues = validateProfile(def);

  if (issues.length > 0) {
    throw new Error(`Profile ${source} is invalid:\n${issues.map((issue) => `  - ${issue.message}`).join('\n')}`);
  }

  return def;
}

export async function loadProfile(filePath: string): Promise<ProfileDefinition> {
  const content = await readFile(filePath, 'utf8');
  return parseProfileJson(content, path.basename(filePath));
}

export async function loadAllProfiles(profilesDirectory: string): Promise<ProfileDefinition[]> {
  const files = await readdir(profilesDirectory);
  const jsonFiles = files.filter((f) => f.endsWith('.json')).sort();
  return Promise.all(jsonFiles.map((f) => loadProfile(path.join(profilesDirectory, f))));
}

export function gitconfigNameToYml(gitconfigName: string): string {
  return `${path.basename(gitconfigName, '.gitconfig')}.yml`;
}

export async function loadAliasesForProfile(profileDef: ProfileDefinition, aliasesDirectory: string): Promise<AliasEntry[]> {
  const allEntries: AliasEntry[] = [];

  for (const include of profileDef.includes) {
    const ymlName = gitconfigNameToYml(include);
    const entries = await loadAliasesFromFile(path.join(aliasesDirectory, ymlName));
    allEntries.push(...entries);
  }

  return allEntries;
}
