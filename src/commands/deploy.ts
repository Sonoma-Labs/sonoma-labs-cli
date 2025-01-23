import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { spinner } from '../utils/spinner';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { validateAgentName } from '../utils/validation';
import { SonomaSDK, Agent } from '@sonoma-labs/toolkit';
import { NETWORKS, DEFAULT_COMPUTE_LIMIT } from '../constants';

export default new Command('deploy')
    .description('Deploy a Sonoma agent')
    .argument('<name>', 'Name of the agent to deploy')
    .option('-n, --network <network>', 'Target network (devnet, testnet, mainnet)')
    .option('-c, --compute-limit <limit>', 'Compute unit limit')
    .option('-p, --priority <level>', 'Transaction priority (low, medium, high)')
    .option('--dry-run', 'Simulate deployment without committing')
    .option('--monitor', 'Monitor agent after deployment')
    .option('--update', 'Update existing deployment')
    .option('--stop', 'Stop running agent')
    .action(async (name: string, options: any) => {
        try {
            // Validate agent name
            validateAgentName(name);

            // Get agent configuration
            const agentConfig = config.get(`agents.${name}`);
            if (!agentConfig) {
                throw new Error(`Agent "${name}" not found. Run 'sonoma init ${name}' first.`);
            }

            // Get or prompt for network
            const network = options.network || await promptNetwork();

            // Initialize deployment spinner
            const deploySpinner = spinner.start(`Deploying agent ${chalk.cyan(name)} to ${chalk.yellow(network)}`);

            try {
                // Initialize SDK
                const sdk = await initializeSDK(network);

                // Handle different deployment actions
                if (options.stop) {
                    await handleStopAgent(sdk, name, deploySpinner);
                } else if (options.update) {
                    await handleUpdateAgent(sdk, name, agentConfig, options, deploySpinner);
                } else {
                    await handleDeployAgent(sdk, name, agentConfig, options, deploySpinner);
                }

                // Monitor if requested
                if (options.monitor && !options.stop) {
                    await monitorAgent(sdk, name);
                }

            } catch (error) {
                deploySpinner.fail(`Deployment failed: ${error.message}`);
                throw error;
            }

        } catch (error) {
            logger.error('Deployment failed:', error);
            process.exit(1);
        }
    });

async function promptNetwork(): Promise<string> {
    const { network } = await inquirer.prompt([
        {
            type: 'list',
            name: 'network',
            message: 'Select target network:',
            choices: NETWORKS
        }
    ]);
    return network;
}

async function initializeSDK(network: string): Promise<SonomaSDK> {
    try {
        // Get wallet configuration
        const wallet = config.get('wallet');
        if (!wallet) {
            throw new Error('No wallet configured. Run `sonoma config wallet` first.');
        }

        // Initialize SDK with network and wallet
        return new SonomaSDK({
            network,
            wallet,
            commitment: 'confirmed'
        });
    } catch (error) {
        throw new Error(`Failed to initialize SDK: ${error.message}`);
    }
}

async function handleDeployAgent(
    sdk: SonomaSDK,
    name: string,
    agentConfig: any,
    options: any,
    deploySpinner: any
): Promise<void> {
    // Create deployment configuration
    const deployConfig = {
        computeLimit: parseInt(options.computeLimit) || DEFAULT_COMPUTE_LIMIT,
        priority: options.priority || 'medium',
        dryRun: options.dryRun || false
    };

    // Deploy agent
    const agent = await sdk.deployAgent(name, {
        ...agentConfig,
        ...deployConfig
    });

    // Update local configuration with deployment info
    await config.set(`agents.${name}.deployment`, {
        address: agent.publicKey.toString(),
        network: sdk.network,
        deployedAt: new Date().toISOString(),
        status: 'deployed'
    });

    deploySpinner.succeed(`Agent ${chalk.cyan(name)} deployed successfully`);
    
    // Display deployment information
    logger.info('\nDeployment Summary:');
    logger.info(`Address: ${chalk.cyan(agent.publicKey.toString())}`);
    logger.info(`Network: ${chalk.cyan(sdk.network)}`);
    logger.info(`Status: ${chalk.green('deployed')}`);
}

async function handleUpdateAgent(
    sdk: SonomaSDK,
    name: string,
    agentConfig: any,
    options: any,
    deploySpinner: any
): Promise<void> {
    // Get deployment info
    const deployment = config.get(`agents.${name}.deployment`);
    if (!deployment) {
        throw new Error(`Agent "${name}" has not been deployed yet.`);
    }

    // Update agent
    const agent = await Agent.load(sdk.getProgram(), deployment.address);
    await agent.updateConfig(agentConfig);

    // Update local configuration
    await config.set(`agents.${name}.deployment.updatedAt`, new Date().toISOString());

    deploySpinner.succeed(`Agent ${chalk.cyan(name)} updated successfully`);
}

async function handleStopAgent(
    sdk: SonomaSDK,
    name: string,
    deploySpinner: any
): Promise<void> {
    // Get deployment info
    const deployment = config.get(`agents.${name}.deployment`);
    if (!deployment) {
        throw new Error(`Agent "${name}" has not been deployed yet.`);
    }

    // Stop agent
    const agent = await Agent.load(sdk.getProgram(), deployment.address);
    await agent.close();

    // Update local configuration
    await config.set(`agents.${name}.deployment.status`, 'stopped');
    await config.set(`agents.${name}.deployment.stoppedAt`, new Date().toISOString());

    deploySpinner.succeed(`Agent ${chalk.cyan(name)} stopped successfully`);
}

async function monitorAgent(sdk: SonomaSDK, name: string): Promise<void> {
    const deployment = config.get(`agents.${name}.deployment`);
    if (!deployment) {
        throw new Error(`Agent "${name}" has not been deployed yet.`);
    }

    logger.info('\nMonitoring agent activity...');
    const agent = await Agent.load(sdk.getProgram(), deployment.address);

    // Subscribe to agent events
    agent.on('stateChange', (oldState, newState) => {
        logger.info(`State changed: ${chalk.yellow(oldState)} → ${chalk.yellow(newState)}`);
    });

    agent.on('execution', (success, data) => {
        if (success) {
            logger.info(`Execution completed: ${chalk.green('success')}`);
        } else {
            logger.error(`Execution failed: ${data}`);
        }
    });

    // Keep process running
    process.stdin.resume();
    logger.info('Press Ctrl+C to stop monitoring');
}