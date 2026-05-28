import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { getDefaultGlobalGitConfigPath, getHomeDirectory } from './paths.js';

type GitConfigSection = { header: string | null; lines: string[] };

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

function detectNewline(content: string): '\n' | '\r\n' {
  const newlineMatches = content.match(/\r\n|\n/g);
  if (newlineMatches == null) {
    return '\n';
  }

  const crlfCount = newlineMatches.filter((match) => match === '\r\n').length;
  const lfCount = newlineMatches.length - crlfCount;
  if (crlfCount === lfCount) {
    return newlineMatches[0] === '\r\n' ? '\r\n' : '\n';
  }

  return crlfCount > lfCount ? '\r\n' : '\n';
}

function trimTrailingNewlines(content: string): string {
  return content.replace(/(?:\r?\n)+$/, '');
}

function splitSections(content: string): GitConfigSection[] {
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const lines = normalizedContent.split('\n');
  const sections: GitConfigSection[] = [];
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

function renderSections(sections: GitConfigSection[], hasTrailingNewline: boolean, newline: '\n' | '\r\n'): string {
  const renderedLines = sections.flatMap((section) => (section.header == null ? [...section.lines] : [section.header, ...section.lines]));
  let startIndex = 0;
  let endIndex = renderedLines.length;

  while (startIndex < endIndex && renderedLines[startIndex] === '') {
    startIndex += 1;
  }

  while (endIndex > startIndex && renderedLines[endIndex - 1] === '') {
    endIndex -= 1;
  }

  const rendered = renderedLines.slice(startIndex, endIndex).join(newline);

  if (rendered.length === 0) {
    return '';
  }

  return hasTrailingNewline ? `${rendered}${newline}` : rendered;
}

/**
 * Quote a gitconfig value so that it is read back verbatim by git.
 *
 * In gitconfig, a `"` character outside of a quoted section opens a quoted
 * section, and `;` / `#` outside of a quoted section start a comment.
 * Shell aliases frequently contain all of these characters, so values that
 * contain any of them must be wrapped in outer double quotes with the inner
 * double quotes and backslashes escaped.
 *
 * Alias commands are expected to be single-line; real newlines in a command
 * string indicate a YAML authoring error and are not handled here.
 */
function quoteGitConfigValue(value: string): string {
  if (/[";\#\\]/.test(value)) {
    return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return value;
}

export function renderAliasGitConfig(entries: Array<{ name: string; command: string }>): string {
  const lines = ['[alias]'];

  for (const entry of entries) {
    lines.push(`    ${entry.name} = ${quoteGitConfigValue(entry.command)}`);
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

  const sections = ['# git-kit aliases', '', 'Generated from `aliases/`.'];

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

  const newline = detectNewline(content);
  const normalizedPath = includePath.replace(/\\/g, '/');
  const includeBlock = `[include]${newline}    path = ${normalizedPath}${newline}`;
  const trimmed = trimTrailingNewlines(content);

  if (trimmed.length === 0) {
    return { changed: true, content: includeBlock };
  }

  return { changed: true, content: `${trimmed}${newline}${newline}${includeBlock}` };
}

/**
 * Remove every [include] path entry whose resolved path lives under the given
 * managed config directory.  Used during install/uninstall to keep a single
 * git-kit include active at a time.
 *
 * Returns the filtered content together with the raw path strings that were
 * removed (as they appeared in the file).
 */
export function removeAllManagedIncludePaths(
  content: string,
  managedDirectory: string,
  platform: NodeJS.Platform = process.platform,
): { changed: boolean; content: string; removedPaths: string[] } {
  const dirForward = managedDirectory.replace(/\\/g, '/');
  const dirNorm = (platform === 'win32' ? dirForward.toLowerCase() : dirForward).replace(/\/+$/, '') + '/';

  const newline = detectNewline(content);
  const hasTrailingNewline = content.endsWith('\r\n') || content.endsWith('\n');
  const removedPaths: string[] = [];

  const sections = splitSections(content)
    .map((section) => {
      if (section.header == null || !isIncludeHeader(section.header)) {
        return section;
      }

      let removedFromSection = 0;
      const filteredLines = section.lines.filter((line) => {
        const configuredPath = parsePathLine(line);
        if (configuredPath == null) return true;
        const forward = configuredPath.replace(/\\/g, '/');
        const norm = platform === 'win32' ? forward.toLowerCase() : forward;
        if (norm.startsWith(dirNorm)) {
          removedPaths.push(configuredPath);
          removedFromSection += 1;
          return false;
        }
        return true;
      });

      const hasOnlyWhitespace = filteredLines.every((line) => line.trim().length === 0);
      if (removedFromSection > 0 && hasOnlyWhitespace) {
        return null;
      }

      return { header: section.header, lines: filteredLines };
    })
    .filter((section): section is GitConfigSection => section != null);

  return {
    changed: removedPaths.length > 0,
    content: renderSections(sections, hasTrailingNewline, newline),
    removedPaths,
  };
}

export function removeIncludePath(content: string, includePath: string, platform: NodeJS.Platform = process.platform): { changed: boolean; content: string; removedCount: number } {
  const expectedPath = normalizeConfigValue(includePath, platform);
  const newline = detectNewline(content);
  const hasTrailingNewline = content.endsWith('\r\n') || content.endsWith('\n');
  let removedCount = 0;

  const sections = splitSections(content)
    .map((section) => {
      if (section.header == null || !isIncludeHeader(section.header)) {
        return section;
      }

      let removedFromSection = 0;
      const filteredLines = section.lines.filter((line) => {
        const configuredPath = parsePathLine(line);
        const shouldRemove = configuredPath != null && normalizeConfigValue(configuredPath, platform) === expectedPath;
        if (shouldRemove) {
          removedCount += 1;
          removedFromSection += 1;
        }
        return !shouldRemove;
      });

      const hasOnlyWhitespace = filteredLines.every((line) => line.trim().length === 0);
      if (removedFromSection > 0 && hasOnlyWhitespace) {
        return null;
      }

      return {
        header: section.header,
        lines: filteredLines,
      };
    })
    .filter((section): section is GitConfigSection => section != null);

  return {
    changed: removedCount > 0,
    content: renderSections(sections, hasTrailingNewline, newline),
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
