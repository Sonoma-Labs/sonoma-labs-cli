import { jest } from '@jest/globals';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { config } from '../../src/utils/config';
import { logger } from '../../src/utils/logger';
import configCommand from '../../src/commands/config';

// Mock dependencies
jest.mock('inquirer');
jest.mock('../../src/utils/config');
jest.mock('../../src/utils/logger');
jest.mock('@sonoma-labs/toolkit');

describe('Config Command', () => {
  let program: Command;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset program instance
    program = new Command();
    program.addCommand(configCommand);
    
    // Mock config default values
    (config.get as jest.Mock).mockReturnValue({
      network: 'devnet',
      agent: {
        name: 'test-agent',
        settings: {
          autonomous: true,
          capabilities: ['compute', 'storage']
        }
      }
    });
  });

  describe('config get', () => {
    it('should display specific config value', async () => {
      // Arrange
      const args = ['config', 'get', 'network'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.info).toHaveBeenCalledWith('network: devnet');
    });

    it('should handle nested config paths', async () => {
      // Arrange
      const args = ['config', 'get', 'agent.settings.autonomous'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.info).toHaveBeenCalledWith('agent.settings.autonomous: true');
    });

    it('should handle non-existent config paths', async () => {
      // Arrange
      const args = ['config', 'get', 'invalid.path'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Config path not found: invalid.path');
    });
  });

  describe('config set', () => {
    it('should set config value', async () => {
      // Arrange
      const args = ['config', 'set', 'network', 'mainnet'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(config.set).toHaveBeenCalledWith('network', 'mainnet');
      expect(logger.success).toHaveBeenCalledWith('Config updated successfully');
    });

    it('should handle nested config paths', async () => {
      // Arrange
      const args = ['config', 'set', 'agent.settings.autonomous', 'false'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(config.set).toHaveBeenCalledWith('agent.settings.autonomous', false);
    });

    it('should validate boolean values', async () => {
      // Arrange
      const args = ['config', 'set', 'agent.settings.autonomous', 'invalid'];

      // Act & Assert
      await expect(program.parseAsync(args)).rejects.toThrow();
    });
  });

  describe('config list', () => {
    it('should display all config values', async () => {
      // Arrange
      const args = ['config', 'list'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.info).toHaveBeenCalled();
      expect(config.get).toHaveBeenCalled();
    });

    it('should format output correctly', async () => {
      // Arrange
      const args = ['config', 'list', '--format', 'json'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.info).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('config reset', () => {
    it('should reset specific config value', async () => {
      // Arrange
      const args = ['config', 'reset', 'network'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(config.reset).toHaveBeenCalledWith('network');
      expect(logger.success).toHaveBeenCalledWith('Config reset successfully');
    });

    it('should handle reset all', async () => {
      // Arrange
      const args = ['config', 'reset', '--all'];
      (inquirer.prompt as jest.Mock).mockResolvedValue({ confirm: true });

      // Act
      await program.parseAsync(args);

      // Assert
      expect(config.resetAll).toHaveBeenCalled();
    });

    it('should prompt for confirmation on reset all', async () => {
      // Arrange
      const args = ['config', 'reset', '--all'];
      (inquirer.prompt as jest.Mock).mockResolvedValue({ confirm: false });

      // Act
      await program.parseAsync(args);

      // Assert
      expect(inquirer.prompt).toHaveBeenCalled();
      expect(config.resetAll).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid commands', async () => {
      // Arrange
      const args = ['config', 'invalid'];

      // Act & Assert
      await expect(program.parseAsync(args)).rejects.toThrow();
    });

    it('should handle config errors', async () => {
      // Arrange
      const error = new Error('Config error');
      (config.set as jest.Mock).mockRejectedValue(error);
      const args = ['config', 'set', 'network', 'mainnet'];

      // Act
      await program.parseAsync(args);

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Failed to update config:', error);
    });
  });
});