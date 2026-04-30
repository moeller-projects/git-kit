#!/usr/bin/env node
import { Command } from 'commander';
import { doctorCommand } from './commands/doctor.js';
import { formatDoctorChecks } from './commands/cli-shared.js';
import { generateCommand } from './commands/generate.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { profilesCommand } from './commands/profiles.js';
import { uninstallCommand } from './commands/uninstall.js';
import { logger } from './core/logger.js';

async function run(): Promise<void> {
  const program = new Command();

  program.name('git-kit').description('A modular Git alias distribution toolkit.');

  program
    .command('install')
    .description('Install the managed alias include.')
    .option('--profile <name>', 'Install only a specific alias profile (e.g. log, stash)')
    .action(async (options: { profile?: string }) => {
      logger.info(await installCommand(options.profile));
    });

  program
    .command('uninstall')
    .description('Remove the managed alias include.')
    .option('--profile <name>', 'Uninstall only a specific alias profile')
    .action(async (options: { profile?: string }) => {
      logger.info(await uninstallCommand(options.profile));
    });

  program
    .command('list')
    .description('List known aliases grouped by category.')
    .option('--profile <name>', 'Show only aliases included in a specific profile')
    .action(async (options: { profile?: string }) => {
      logger.info(await listCommand(options.profile));
    });

  program
    .command('profiles')
    .description('List available alias profiles.')
    .action(async () => {
      logger.info(await profilesCommand());
    });

  program
    .command('doctor')
    .description('Run installation and configuration checks.')
    .action(async () => {
      const checks = await doctorCommand();
      logger.info(formatDoctorChecks(checks));
      if (checks.some((check) => !check.ok)) {
        process.exitCode = 1;
      }
    });

  program
    .command('generate')
    .description('Generate managed alias config and docs.')
    .action(async () => {
      const result = await generateCommand();
      for (const generatedPath of result.generatedPaths) {
        logger.info(`generated ${generatedPath}`);
      }
    });

  await program.parseAsync(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exitCode = 1;
});
