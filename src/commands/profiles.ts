import { loadAllProfiles } from '../core/profile.js';
import { resolvePackagePath } from '../core/paths.js';

export async function profilesCommand(): Promise<string> {
  const profiles = await loadAllProfiles(resolvePackagePath('profiles'));

  if (profiles.length === 0) {
    return 'No profiles found.';
  }

  const lines: string[] = [];
  const widestName = Math.max(0, ...profiles.map((p) => p.name.length));

  for (const profile of profiles) {
    const desc = profile.description != null ? `  ${profile.description}` : '';
    lines.push(`${profile.name.padEnd(widestName)}${desc}`);
    for (const include of profile.includes) {
      lines.push(`  + ${include}`);
    }
  }

  return lines.join('\n');
}
