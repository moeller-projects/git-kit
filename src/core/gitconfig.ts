import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { getDefaultGlobalGitConfigPath, getHomeDirectory } from './paths.js';

function normalizeConfigValue(value: string, platform: NodeJS.Platform): string {
  const normalized = value.trim().replace(/^['"]|['"]$/g, '').replace(/\\/g, '/');
  return platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function parsePathLine(line: string): string | null {
  const match = line.match(/^\s*path\s*=\s*(.+?)\s*$/i);
  return match ? match[1] : null;
}

function isIncludeHeader(header: string): boolean {
  return /^\s*\[include\]\s*$/i.test(header);
}

function splitSections(content: string): Array<{ header: string | null; lines: string[] }> {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const lines = normalizedContent.split('\n');
  const sections: Array<{ header: string | null; lines: string[] }> = [];
  let currentSection = { header: null as string | null, lines: [] as string[] };

  for (const line of lines) {
    if (/^\s*\[[^\]]+\]\s*$/.test(line)) {
      sections.push(currentSection);
      currentSection = { header: line, lines: [] };
      continue;
    }

    currentSection.lines.push(line);
  }

  sections.push(currentSection);
  return sections;
}

function renderSections(sections: Array<{ header: string | null; lines: string[] }>, hasTrailingNewline: boolean): string {
  const rendered = sections
    .flatMap((section) => (section.header == null ? [...section.lines] : [section.header, ...section.lines]))
    .join('\n')
    .replace(/^\n+/, '');

  if (rendered.length === 0) {
    return '';
  }

  return hasTrailingNewline ? `${rendered}\n` : rendered;
}

export function renderAliasGitConfig(entries: Array<{ name: string; command: string }>): string {
  const lines = ['[alias]'];

  for (const entry of entries) {
    lines.push(`    ${entry.name} = ${entry.command}`);
  }

  return `${lines.join('\n')}\n`;
}

export function renderAliasesMarkdown(entries: Array<{ name: string; command: string; description: string; category: string; risk: string }>): string {
  const groupedEntries = new Map<string, typeof entries>();
  for (const entry of entries) {
    const categoryEntries = groupedEntries.get(entry.category) ?? [];
    categoryEntries.push(entry);
    groupedEntries.set(entry.category, categoryEntries);
  }

  const sections = ['# git-kit aliases', '', 'Generated from `aliases/aliases.yml`.'];

  for (const category of [...groupedEntries.keys()].sort((left, right) => left.localeCompare(right))) {
    sections.push('', `## ${category}`, '', '| Alias | Command | Description | Risk |', '| --- | --- | --- | --- |');
    for (const entry of groupedEntries.get(category) ?? []) {
      sections.push(`| \`${entry.name}\` | \`${entry.command}\` | ${entry.description} | ${entry.risk} |`);
    }
  }

  return `${sections.join('\n')}\n`;
}

export function hasIncludePath(content: string, includePath: string, platform: NodeJS.Platform = process.platform): boolean {
  const expectedPath = normalizeConfigValue(includePath, platform);

  return splitSections(content).some((section) => {
    if (section.header == null || !isIncludeHeader(section.header)) {
      return false;
    }

    return section.lines.some((line) => {
      const configuredPath = parsePathLine(line);
      return configuredPath != null && normalizeConfigValue(configuredPath, platform) === expectedPath;
    });
  });
}

export function addIncludePath(content: string, includePath: string, platform: NodeJS.Platform = process.platform): { changed: boolean; content: string } {
  if (hasIncludePath(content, includePath, platform)) {
    return { changed: false, content };
  }

  const normalizedPath = includePath.replace(/\\/g, '/');
  const includeBlock = `[include]\n    path = ${normalizedPath}\n`;
  const trimmed = content.replace(/\s*$/, '');

  if (trimmed.length === 0) {
    return { changed: true, content: includeBlock };
  }

  return { changed: true, content: `${trimmed}\n\n${includeBlock}` };
}

export function removeIncludePath(content: string, includePath: string, platform: NodeJS.Platform = process.platform): { changed: boolean; content: string; removedCount: number } {
  const expectedPath = normalizeConfigValue(includePath, platform);
  const hasTrailingNewline = content.endsWith('\n');
  let removedCount = 0;

  const sections = splitSections(content)
    .map((section) => {
      if (section.header == null || !isIncludeHeader(section.header)) {
        return section;
      }

      const filteredLines = section.lines.filter((line) => {
        const configuredPath = parsePathLine(line);
        const shouldRemove = configuredPath != null && normalizeConfigValue(configuredPath, platform) === expectedPath;
        if (shouldRemove) {
          removedCount += 1;
        }
        return !shouldRemove;
      });

      const hasOnlyWhitespace = filteredLines.every((line) => line.trim().length === 0);
      if (removedCount > 0 && hasOnlyWhitespace) {
        return null;
      }

      return {
        header: section.header,
        lines: filteredLines,
      };
    })
    .filter((section): section is { header: string | null; lines: string[] } => section != null);

  return {
    changed: removedCount > 0,
    content: renderSections(sections, hasTrailingNewline),
    removedCount,
  };
}

export function resolveGlobalGitConfigPath(homeDirectory: string = getHomeDirectory(), managedAliasesPath?: string): string {
  try {
    const output = execFileSync('git', ['config', '--global', '--show-origin', '--list'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const origins = output
      .split(/\r?\n/)
      .map((line) => line.match(/^file:(.+?)(?:\t| (?=[^\s]+=))/)?.[1]?.trim())
      .filter((origin): origin is string => Boolean(origin));

    const preferredOrigin =
      origins.find((origin) => path.basename(origin) === '.gitconfig') ??
      origins.find((origin) => (managedAliasesPath == null ? true : normalizeConfigValue(origin, process.platform) !== normalizeConfigValue(managedAliasesPath, process.platform))) ??
      origins[0];

    if (preferredOrigin) {
      return preferredOrigin;
    }
  } catch {
    // Fall back to the default Git path.
  }

  return getDefaultGlobalGitConfigPath(homeDirectory);
}
