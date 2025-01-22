import { jest } from '@jest/globals';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { config } from '../../src/utils/config';
import { logger } from '../../src/utils/logger';
import initCommand from '../../src/commands/init';

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/utils/config');
jest.mock('../../src/utils/logger');
jest.mock('@sonoma-labs/toolkit');

describe('Init Command', () => {
  let program: Command;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset program instance
    program = new Command();
    program.addCommand(initCommand);
    
    // Mock config
    (config.get as jest.Mock).mockReturnValue({});
    
    // Mock inquirer
    (inquirer.prompt as jest.Mock).mockResolvedValue({
      name: 'test-agent',
      autonomous: true,
      capabilities: ['compute', 'storage'],
      executionLimit: 1000,
      memoryLimit: 1024 * 1024 * 10,
    });
  });

  it('should create a new agent with default options', async () => {
    // Arrange
    const args = ['init', 'test-agent'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Creating new agent: test-agent')
    );
    expect(config.set).toHaveBeenCalled();
  });

  it('should prompt for missing options', async () => {
    // Arrange
    const args = ['init'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(inquirer.prompt).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const error = new Error('Test error');
    (config.set as jest.Mock).mockRejectedValue(error);
    const args = ['init', 'test-agent'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to initialize agent'),
      error
    );
  });

  it('should validate agent name', async () => {
    // Arrange
    const args = ['init', ''];

    // Act & Assert
    await expect(program.parseAsync(args)).rejects.toThrow();
  });

  it('should respect --no-autonomous flag', async () => {
    // Arrange
    const args = ['init', 'test-agent', '--no-autonomous'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(config.set).toHaveBeenCalledWith(
      expect.objectContaining({
        autonomous: false
      })
    );
  });

  it('should handle custom capabilities', async () => {
    // Arrange
    const args = ['init', 'test-agent', '--capabilities', 'compute,network'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(config.set).toHaveBeenCalledWith(
      expect.objectContaining({
        capabilities: ['compute', 'network']
      })
    );
  });

  it('should validate execution limits', async () => {
    // Arrange
    const args = ['init', 'test-agent', '--execution-limit', '-1'];

    // Act & Assert
    await expect(program.parseAsync(args)).rejects.toThrow();
  });

  it('should create agent configuration file', async () => {
    // Arrange
    const args = ['init', 'test-agent', '--config', 'custom-config.json'];

    // Act
    await program.parseAsync(args);

    // Assert
    expect(config.save).toHaveBeenCalled();
  });
});