import { jest } from '@jest/globals';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { config } from '../../src/utils/config';
import { logger } from '../../src/utils/logger';
import { spinner } from '../../src/utils/spinner';
import deployCommand from '../../src/commands/deploy';

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/utils/config');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/spinner');
jest.mock('@sonoma-labs/toolkit');

describe('Deploy Command', () => {
  let program: Command;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset program instance
    program = new Command();
    program.addCommand(deployCommand);
    
    // Mock config
    (config.get as jest.Mock).mockReturnValue({
      agent: {
        name: 'test-agent',
        config: {
          autonomous: true,
          capabilities: ['compute', 'storage']
        }
      }
    });
    
    // Mock spinner
    (spinner.start as jest.Mock).mockReturnValue({
      succeed: jest.fn(),
      fail: jest.fn()
    });
  });

  it('should deploy agent with default options', async () => {
    // Arrange
    const args = ['deploy', 'test-agent'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(spinner.start).toHaveBeenCalledWith('Deploying agent: test-agent');
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Successfully deployed')
    );
  });

  it('should prompt for network selection if not specified', async () => {
    // Arrange
    const args = ['deploy', 'test-agent'];
    (inquirer.prompt as jest.Mock).mockResolvedValue({
      network: 'devnet'
    });

    // Act
    await program.parseAsync(args);

    // Assert
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Deploying to devnet')
    );
  });

  it('should handle deployment errors gracefully', async () => {
    // Arrange
    const error = new Error('Deployment failed');
    (config.get as jest.Mock).mockRejectedValue(error);
    const args = ['deploy', 'test-agent'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(spinner.start).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to deploy agent'),
      error
    );
  });

  it('should validate agent exists before deployment', async () => {
    // Arrange
    (config.get as jest.Mock).mockReturnValue({ agent: null });
    const args = ['deploy', 'non-existent-agent'];

    // Act & Assert
    await expect(program.parseAsync(args)).rejects.toThrow(
      'Agent not found: non-existent-agent'
    );
  });

  it('should respect --network flag', async () => {
    // Arrange
    const args = ['deploy', 'test-agent', '--network', 'mainnet'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Deploying to mainnet')
    );
  });

  it('should handle custom deployment options', async () => {
    // Arrange
    const args = [
      'deploy',
      'test-agent',
      '--compute-limit',
      '1000',
      '--priority',
      'high'
    ];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(config.get).toHaveBeenCalledWith(
      expect.objectContaining({
        computeLimit: 1000,
        priority: 'high'
      })
    );
  });

  it('should verify wallet connection before deployment', async () => {
    // Arrange
    const args = ['deploy', 'test-agent'];
    (config.get as jest.Mock).mockReturnValue({ wallet: null });

    // Act & Assert
    await expect(program.parseAsync(args)).rejects.toThrow(
      'No wallet configured'
    );
  });

  it('should show deployment progress', async () => {
    // Arrange
    const args = ['deploy', 'test-agent'];
    const progressMock = jest.fn();
    (spinner.start as jest.Mock).mockReturnValue({
      succeed: jest.fn(),
      fail: jest.fn(),
      text: '',
      render: progressMock
    });

    // Act
    await program.parseAsync(args);

    // Assert
    expect(progressMock).toHaveBeenCalled();
  });

  it('should save deployment information', async () => {
    // Arrange
    const args = ['deploy', 'test-agent'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(config.set).toHaveBeenCalledWith(
      expect.objectContaining({
        deployments: expect.any(Array)
      })
    );
  });
});