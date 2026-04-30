export function formatDoctorChecks(checks: Array<{ label: string; ok: boolean; detail: string }>): string {
  return checks.map((check) => `${check.ok ? '✔' : '✖'} ${check.label}: ${check.detail}`).join('\n');
}
