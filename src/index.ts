import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import updateNotifier from 'update-notifier';
import { config } from './utils/config';
import { logger } from './utils/logger';
import pkg from '../package.json';

// Import commands
import initCommand from './commands/init';
import deployCommand from './commands/deploy';
import configCommand from './commands/config';
import statusCommand from './commands/status';
import logsCommand from './commands/logs';
import monitorCommand from './commands/monitor';
import updateCommand from './commands/update';
import stopCommand from './commands/stop';

// Check for updates
updateNotifier({ pkg }).notify();

const program = new Command();

// CLI Header
console.log(
  chalk.cyan(
    figlet.textSync('Sonoma Labs', {
      font: 'Standard',
      horizontalLayout: 'full'
    })
  )
);

program
  .name('sonoma')
  .description('Sonoma Labs CLI - Agent Management Tools')
  .version(pkg.version)
  .option('-d, --debug', 'Enable debug mode', false)
  .option('-c, --config <path>', 'Path to config file')
  .hook('preAction', async (thisCommand) => {
    // Initialize configuration
    await config.load(thisCommand.opts().config);
    
    // Set up logging level
    if (thisCommand.opts().debug) {
      logger.setLevel('debug');
      logger.debug('Debug mode enabled');
    }
  });

// Register commands
program
  .addCommand(initCommand)
  .addCommand(deployCommand)
  .addCommand(configCommand)
  .addCommand(statusCommand)
  .addCommand(logsCommand)
  .addCommand(monitorCommand)
  .addCommand(updateCommand)
  .addCommand(stopCommand);

// Global error handling
program.exitOverride();

try {
  // Parse command line arguments
  await program.parseAsync(process.argv);
} catch (error) {
  if (error.code === 'commander.help') {
    process.exit(0);
  }

  logger.error('Error executing command:', error);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  process.exit(0);
});