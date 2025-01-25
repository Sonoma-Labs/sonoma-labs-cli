import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger';

const execAsync = promisify(exec);

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration to human readable string
 */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Get home directory path
 */
export function getHomePath(): string {
    return path.join(os.homedir(), '.sonoma');
}

/**
 * Ensure directory exists
 */
export function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Check if path is directory
 */
export function isDirectory(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch {
        return false;
    }
}

/**
 * Check if path is file
 */
export function isFile(path: string): boolean {
    try {
        return fs.statSync(path).isFile();
    } catch {
        return false;
    }
}

/**
 * Get package version
 */
export function getVersion(): string {
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
    return process.env.NODE_ENV === 'test';
}

/**
 * Check if command exists
 */
export async function commandExists(command: string): Promise<boolean> {
    try {
        await execAsync(`which ${command}`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get system info
 */
export function getSystemInfo(): Record<string, any> {
    return {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpus: os.cpus().length,
        memory: os.totalmem(),
        tmpdir: os.tmpdir(),
        homedir: os.homedir(),
        hostname: os.hostname(),
        type: os.type(),
        release: os.release()
    };
}

/**
 * Sleep for specified duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: {
        retries?: number;
        minTimeout?: number;
        maxTimeout?: number;
        factor?: number;
    } = {}
): Promise<T> {
    const {
        retries = 3,
        minTimeout = 1000,
        maxTimeout = 10000,
        factor = 2
    } = options;

    let attempt = 0;
    let timeout = minTimeout;

    while (true) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            if (attempt >= retries) {
                throw error;
            }

            timeout = Math.min(timeout * factor, maxTimeout);
            logger.debug(`Retry attempt ${attempt} after ${timeout}ms`);
            await sleep(timeout);
        }
    }
}

/**
 * Generate random string
 */
export function randomString(length: number = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Parse JSON safely
 */
export function safeJsonParse(str: string): any {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

/**
 * Stringify JSON safely
 */
export function safeJsonStringify(obj: any): string {
    try {
        return JSON.stringify(obj);
    } catch {
        return '';
    }
}

/**
 * Truncate string
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

/**
 * Check if string is URL
 */
export function isUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}