import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { spinner } from '../utils/spinner';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { validateAgentName, validateCapabilities } from '../utils/validation';
import { AgentConfig } from '../types';
import { DEFAULT_CAPABILITIES, DEFAULT_MEMORY_LIMIT } from '../constants';

export default new Command('init')
    .description('Initialize a new Sonoma agent')
    .argument('[name]', 'Name of the agent')
    .option('-a, --autonomous', 'Run in autonomous mode', true)
    .option('-c, --capabilities <list>', 'Comma-separated list of capabilities')
    .option('-m, --memory-limit <bytes>', 'Memory limit in bytes')
    .option('-e, --execution-limit <number>', 'Maximum execution steps')
    .option('--no-validate', 'Skip validation checks')
    .option('--force', 'Overwrite existing configuration')
    .action(async (name: string | undefined, options: any) => {
        try {
            // Get agent name through prompt if not provided
            const agentName = name || await promptAgentName();
            
            // Validate agent name if validation is enabled
            if (options.validate) {
                validateAgentName(agentName);
            }

            // Check for existing configuration
            const existingConfig = config.get(`agents.${agentName}`);
            if (existingConfig && !options.force) {
                throw new Error(`Agent "${agentName}" already exists. Use --force to overwrite.`);
            }

            // Start initialization spinner
            const initSpinner = spinner.start(`Initializing agent: ${chalk.cyan(agentName)}`);

            try {
                // Get or prompt for configuration
                const agentConfig = await buildAgentConfig(options);

                // Save configuration
                await config.set(`agents.${agentName}`, {
                    name: agentName,
                    config: agentConfig,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                initSpinner.succeed(`Agent ${chalk.cyan(agentName)} initialized successfully`);

                // Display configuration summary
                logger.info('\nConfiguration Summary:');
                logger.info(`Name: ${chalk.cyan(agentName)}`);
                logger.info(`Autonomous Mode: ${chalk.cyan(agentConfig.autonomousMode)}`);
                logger.info(`Capabilities: ${chalk.cyan(agentConfig.capabilities.join(', '))}`);
                logger.info(`Memory Limit: ${chalk.cyan(formatBytes(agentConfig.memoryLimit))}`);
                if (agentConfig.executionLimit) {
                    logger.info(`Execution Limit: ${chalk.cyan(agentConfig.executionLimit)}`);
                }

                // Show next steps
                logger.info('\nNext Steps:');
                logger.info(`1. Configure your agent: ${chalk.cyan(`sonoma config ${agentName}`)}`);
                logger.info(`2. Deploy your agent: ${chalk.cyan(`sonoma deploy ${agentName}`)}`);

            } catch (error) {
                initSpinner.fail(`Failed to initialize agent: ${error.message}`);
                throw error;
            }

        } catch (error) {
            logger.error('Initialization failed:', error);
            process.exit(1);
        }
    });

async function promptAgentName(): Promise<string> {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter agent name:',
            validate: (input: string) => {
                try {
                    validateAgentName(input);
                    return true;
                } catch (error) {
                    return error.message;
                }
            }
        }
    ]);
    return name;
}

async function buildAgentConfig(options: any): Promise<AgentConfig> {
    const capabilities = options.capabilities
        ? validateCapabilities(options.capabilities)
        : await promptCapabilities();

    const config: AgentConfig = {
        autonomousMode: options.autonomous,
        capabilities,
        memoryLimit: parseInt(options.memoryLimit) || DEFAULT_MEMORY_LIMIT,
        executionLimit: options.executionLimit ? parseInt(options.executionLimit) : undefined
    };

    return config;
}

async function promptCapabilities(): Promise<string[]> {
    const { capabilities } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'capabilities',
            message: 'Select agent capabilities:',
            choices: DEFAULT_CAPABILITIES.map(cap => ({
                name: cap,
                checked: cap === 'compute'
            }))
        }
    ]);
    return capabilities;
}

function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}