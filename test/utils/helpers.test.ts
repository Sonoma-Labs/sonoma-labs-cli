import { jest } from '@jest/globals';
import {
  validateAgentName,
  validateNetworkUrl,
  parseCapabilities,
  formatBytes,
  sleep,
  retry,
  isValidSolanaAddress,
  parseConfig,
  mergeConfigs,
  sanitizePath,
  validateExecutionLimit,
} from '../../src/utils/helpers';

describe('Helper Functions', () => {
  describe('validateAgentName', () => {
    it('should accept valid agent names', () => {
      expect(validateAgentName('test-agent')).toBe(true);
      expect(validateAgentName('agent_123')).toBe(true);
      expect(validateAgentName('myAgent')).toBe(true);
    });

    it('should reject invalid agent names', () => {
      expect(() => validateAgentName('')).toThrow();
      expect(() => validateAgentName('a')).toThrow();
      expect(() => validateAgentName('invalid@name')).toThrow();
      expect(() => validateAgentName('a'.repeat(33))).toThrow();
    });
  });

  describe('validateNetworkUrl', () => {
    it('should validate correct network URLs', () => {
      expect(validateNetworkUrl('https://api.mainnet-beta.solana.com')).toBe(true);
      expect(validateNetworkUrl('http://localhost:8899')).toBe(true);
    });

    it('should reject invalid network URLs', () => {
      expect(() => validateNetworkUrl('invalid-url')).toThrow();
      expect(() => validateNetworkUrl('ftp://invalid.com')).toThrow();
    });
  });

  describe('parseCapabilities', () => {
    it('should parse capability strings', () => {
      expect(parseCapabilities('compute,storage')).toEqual(['compute', 'storage']);
      expect(parseCapabilities('compute')).toEqual(['compute']);
    });

    it('should handle empty capabilities', () => {
      expect(parseCapabilities('')).toEqual([]);
    });

    it('should remove duplicates', () => {
      expect(parseCapabilities('compute,compute,storage')).toEqual(['compute', 'storage']);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    });

    it('should handle zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });
  });

  describe('sleep', () => {
    it('should sleep for specified duration', async () => {
      const start = Date.now();
      await sleep(100);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(95); // Allow for small timing variations
    });
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await retry(mockFn, { maxAttempts: 3, delay: 10 });
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fail'));

      await expect(retry(mockFn, { maxAttempts: 2, delay: 10 }))
        .rejects.toThrow('Always fail');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isValidSolanaAddress', () => {
    it('should validate Solana addresses', () => {
      expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true);
      expect(isValidSolanaAddress('invalid')).toBe(false);
    });
  });

  describe('parseConfig', () => {
    it('should parse JSON config', () => {
      const config = parseConfig('{"network": "devnet"}');
      expect(config).toEqual({ network: 'devnet' });
    });

    it('should handle invalid JSON', () => {
      expect(() => parseConfig('invalid')).toThrow();
    });
  });

  describe('mergeConfigs', () => {
    it('should merge configs correctly', () => {
      const base = { a: 1, b: { c: 2 } };
      const override = { b: { d: 3 }, e: 4 };
      const result = mergeConfigs(base, override);
      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });
  });

  describe('sanitizePath', () => {
    it('should sanitize file paths', () => {
      expect(sanitizePath('../config.json')).not.toContain('..');
      expect(sanitizePath('/absolute/path')).not.toContain('/absolute');
    });
  });

  describe('validateExecutionLimit', () => {
    it('should validate execution limits', () => {
      expect(validateExecutionLimit(1000)).toBe(true);
      expect(() => validateExecutionLimit(-1)).toThrow();
      expect(() => validateExecutionLimit(1000001)).toThrow();
    });
  });
});