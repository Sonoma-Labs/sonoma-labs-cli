import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { NETWORKS } from '../constants';

export default new Command('config')
    .description('Manage Sonoma CLI configuration')
    .addCommand(
        new Command('get')
            .description('Get configuration value')
            .argument('<key>', 'Configuration key')
            .action(getConfig)
    )
    .addCommand(
        new Command('set')
            .description('Set configuration value')
            .argument('<key>', 'Configuration key')
            .argument('[value]', 'Configuration value')
            .action(setConfig)
    )
    .addCommand(
        new Command('list')
            .description('List all configuration')
            .option('--format <format>', 'Output format (json, yaml)', 'json')
            .action(listConfig)
    )
    .addCommand(
        new Command('reset')
            .description('Reset configuration')
            .argument('[key]', 'Configuration key to reset')
            .option('--all', 'Reset all configuration')
            .action(resetConfig)
    )
    .addCommand(
        new Command('wallet')
            .description('Configure wallet')
            .option('--import <path>', 'Import wallet from file')
            .option('--create', 'Create new wallet')
            .action(configureWallet)
    )
    .addCommand(
        new Command('network')
            .description('Configure network')
            .argument('[network]', 'Network name')
            .option('--url <url>', 'Custom RPC URL')
            .action(configureNetwork)
    );

async function getConfig(key: string) {
    try {
        const value = config.get(key);
        if (value === undefined) {
            throw new Error(`Configuration key not found: ${key}`);
        }
        logger.info(`${key}: ${formatValue(value)}`);
    } catch (error) {
        logger.error('Failed to get configuration:', error);
        process.exit(1);
    }
}

async function setConfig(key: string, value: string) {
    try {
        // Handle nested keys
        const keys = key.split('.');
        const lastKey = keys.pop()!;
        let currentObj = config.get() || {};
        let target = currentObj;

        // Build nested structure
        for (const k of keys) {
            target[k] = target[k] || {};
            target = target[k];
        }

        // Parse value if it's JSON
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch {
            parsedValue = value;
        }

        target[lastKey] = parsedValue;
        await config.set(currentObj);
        logger.success('Configuration updated successfully');

    } catch (error) {
        logger.error('Failed to set configuration:', error);
        process.exit(1);
    }
}

async function listConfig(options: { format: string }) {
    try {
        const configuration = config.get();
        if (options.format === 'json') {
            logger.info(JSON.stringify(configuration, null, 2));
        } else if (options.format === 'yaml') {
            // Add YAML support if needed
            logger.info(JSON.stringify(configuration, null, 2));
        }
    } catch (error) {
        logger.error('Failed to list configuration:', error);
        process.exit(1);
    }
}

async function resetConfig(key?: string, options?: { all: boolean }) {
    try {
        if (options?.all) {
            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Are you sure you want to reset all configuration?',
                    default: false
                }
            ]);

            if (confirm) {
                await config.resetAll();
                logger.success('All configuration reset successfully');
            }
        } else if (key) {
            await config.reset(key);
            logger.success(`Configuration reset successfully: ${key}`);
        } else {
            throw new Error('Please specify a key to reset or use --all');
        }
    } catch (error) {
        logger.error('Failed to reset configuration:', error);
        process.exit(1);
    }
}

async function configureWallet(options: { import?: string, create?: boolean }) {
    try {
        if (options.import) {
            // Import wallet from file
            const wallet = await importWallet(options.import);
            await config.set('wallet', {
                publicKey: wallet.publicKey.toString(),
                path: options.import
            });
            logger.success('Wallet imported successfully');

        } else if (options.create) {
            // Create new wallet
            const wallet = await createWallet();
            await config.set('wallet', {
                publicKey: wallet.publicKey.toString(),
                path: wallet.path
            });
            logger.success('Wallet created successfully');
            logger.info(`Backup phrase saved to: ${chalk.cyan(wallet.path)}`);

        } else {
            // Interactive wallet configuration
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Choose wallet action:',
                    choices: ['Create new wallet', 'Import existing wallet']
                }
            ]);

            if (action === 'Create new wallet') {
                await configureWallet({ create: true });
            } else {
                const { path } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'path',
                        message: 'Enter path to wallet file:'
                    }
                ]);
                await configureWallet({ import: path });
            }
        }
    } catch (error) {
        logger.error('Failed to configure wallet:', error);
        process.exit(1);
    }
}

async function configureNetwork(network?: string, options?: { url?: string }) {
    try {
        if (!network) {
            const { selectedNetwork } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectedNetwork',
                    message: 'Select network:',
                    choices: NETWORKS
                }
            ]);
            network = selectedNetwork;
        }

        const networkConfig = {
            name: network,
            url: options?.url || getDefaultUrl(network)
        };

        await config.set('network', networkConfig);
        logger.success(`Network configured: ${chalk.cyan(network)}`);
        if (options?.url) {
            logger.info(`Custom RPC URL: ${chalk.cyan(options.url)}`);
        }

    } catch (error) {
        logger.error('Failed to configure network:', error);
        process.exit(1);
    }
}

// Helper functions
function formatValue(value: any): string {
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

function getDefaultUrl(network: string): string {
    const urls: { [key: string]: string } = {
        mainnet: 'https://api.mainnet-beta.solana.com',
        devnet: 'https://api.devnet.solana.com',
        testnet: 'https://api.testnet.solana.com'
    };
    return urls[network] || urls.devnet;
}

async function importWallet(path: string): Promise<any> {
    // Implementation for wallet import
    throw new Error('Not implemented');
}

async function createWallet(): Promise<any> {
    // Implementation for wallet creation
    throw new Error('Not implemented');
}