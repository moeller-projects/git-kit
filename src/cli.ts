#!/usr/bin/env node
import { Command } from 'commander';
import { doctorCommand } from './commands/doctor.js';
import { formatDoctorChecks } from './commands/cli-shared.js';
import { generateCommand } from './commands/generate.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { uninstallCommand } from './commands/uninstall.js';
import { logger } from './core/logger.js';

async function run(): Promise<void> {
  const program = new Command();

  program.name('git-kit').description('A modular Git alias distribution toolkit.');

  program
    .command('install')
    .description('Install the managed alias include.')
    .action(async () => {
      logger.info(await installCommand());
    });

  program
    .command('uninstall')
    .description('Remove the managed alias include.')
    .action(async () => {
      logger.info(await uninstallCommand());
    });

  program
    .command('list')
    .description('List known aliases grouped by category.')
    .action(async () => {
      logger.info(await listCommand());
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
      logger.info(`generated ${result.generatedGitConfigPath}`);
      logger.info(`generated ${result.generatedDocsPath}`);
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
