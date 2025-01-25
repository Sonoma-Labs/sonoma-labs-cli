import fs from 'fs';
import path from 'path';
import os from 'os';
import { cosmiconfig } from 'cosmiconfig';
import { merge } from 'lodash';
import { ConfigData } from '../types';
import { logger } from './logger';

class Config {
    private static instance: Config;
    private configPath: string;
    private configData: ConfigData;
    private explorer = cosmiconfig('sonoma');

    private constructor() {
        this.configPath = path.join(os.homedir(), '.sonoma', 'config.json');
        this.configData = this.loadConfig();
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    /**
     * Get configuration value by key
     */
    public get(key?: string): any {
        if (!key) {
            return this.configData;
        }

        const keys = key.split('.');
        let value = this.configData;

        for (const k of keys) {
            if (value === undefined) break;
            value = value[k];
        }

        return value;
    }

    /**
     * Set configuration value
     */
    public async set(keyOrData: string | object, value?: any): Promise<void> {
        if (typeof keyOrData === 'string') {
            const keys = keyOrData.split('.');
            let current = this.configData;
            
            // Navigate to the nested location
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = current[keys[i]] || {};
                current = current[keys[i]];
            }
            
            // Set the value
            current[keys[keys.length - 1]] = value;
        } else {
            // Merge entire object
            this.configData = merge({}, this.configData, keyOrData);
        }

        await this.saveConfig();
    }

    /**
     * Reset configuration
     */
    public async reset(key?: string): Promise<void> {
        if (key) {
            const keys = key.split('.');
            let current = this.configData;
            
            // Navigate to parent of target key
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) return;
                current = current[keys[i]];
            }
            
            // Delete the target key
            delete current[keys[keys.length - 1]];
        } else {
            this.configData = {};
        }

        await this.saveConfig();
    }

    /**
     * Reset all configuration
     */
    public async resetAll(): Promise<void> {
        this.configData = {};
        await this.saveConfig();
    }

    /**
     * Load configuration from file and environment
     */
    private loadConfig(): ConfigData {
        try {
            // Ensure config directory exists
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // Load config file if it exists
            let fileConfig = {};
            if (fs.existsSync(this.configPath)) {
                const content = fs.readFileSync(this.configPath, 'utf8');
                fileConfig = JSON.parse(content);
            }

            // Search for project config
            const result = this.explorer.searchSync();
            const projectConfig = result?.config || {};

            // Merge configs with environment variables
            return merge(
                {},
                fileConfig,
                projectConfig,
                this.getEnvConfig()
            );

        } catch (error) {
            logger.error('Failed to load configuration:', error);
            return {};
        }
    }

    /**
     * Save configuration to file
     */
    private async saveConfig(): Promise<void> {
        try {
            const configDir = path.dirname(this.configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            await fs.promises.writeFile(
                this.configPath,
                JSON.stringify(this.configData, null, 2)
            );

        } catch (error) {
            logger.error('Failed to save configuration:', error);
            throw error;
        }
    }

    /**
     * Get configuration from environment variables
     */
    private getEnvConfig(): Partial<ConfigData> {
        const envConfig: Partial<ConfigData> = {};
        
        // Map environment variables to config structure
        const envMapping = {
            SONOMA_API_KEY: 'auth.apiKey',
            SONOMA_NETWORK: 'network',
            SONOMA_DEBUG: 'debug'
        };

        for (const [envVar, configPath] of Object.entries(envMapping)) {
            const value = process.env[envVar];
            if (value !== undefined) {
                const keys = configPath.split('.');
                let current = envConfig;
                
                // Build nested structure
                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = current[keys[i]] || {};
                    current = current[keys[i]];
                }
                
                // Set value with appropriate type conversion
                const lastKey = keys[keys.length - 1];
                current[lastKey] = value === 'true' ? true :
                                 value === 'false' ? false :
                                 !isNaN(Number(value)) ? Number(value) :
                                 value;
            }
        }

        return envConfig;
    }
}

export const config = Config.getInstance();