import { NetworkName, AgentConfig } from './index';

/**
 * Global configuration structure
 */
export interface ConfigData {
    // Authentication
    auth?: {
        apiKey?: string;
        token?: string;
        refreshToken?: string;
        expiresAt?: string;
    };

    // Network settings
    network?: {
        name: NetworkName;
        url?: string;
        headers?: Record<string, string>;
    };

    // Agent configurations
    agents?: {
        [key: string]: AgentConfig;
    };

    // User preferences
    preferences?: {
        theme?: 'light' | 'dark';
        debug?: boolean;
        telemetry?: boolean;
        autoUpdate?: boolean;
        defaultNetwork?: NetworkName;
    };

    // Project settings
    project?: {
        name?: string;
        version?: string;
        description?: string;
        repository?: string;
        license?: string;
        author?: string;
    };

    // Development settings
    development?: {
        localNetwork?: {
            port: number;
            host: string;
            ssl?: boolean;
        };
        logging?: {
            level: 'debug' | 'info' | 'warn' | 'error';
            file?: string;
            format?: 'text' | 'json';
        };
        experimental?: {
            features?: string[];
            flags?: Record<string, boolean>;
        };
    };

    // Cache settings
    cache?: {
        dir?: string;
        maxSize?: number;
        ttl?: number;
        cleanupInterval?: number;
    };

    // Proxy settings
    proxy?: {
        enabled?: boolean;
        host?: string;
        port?: number;
        auth?: {
            username?: string;
            password?: string;
        };
    };

    // Rate limiting
    rateLimit?: {
        enabled?: boolean;
        maxRequests?: number;
        windowMs?: number;
        delayMs?: number;
    };

    // Retry settings
    retry?: {
        enabled?: boolean;
        attempts?: number;
        delay?: number;
        maxDelay?: number;
        factor?: number;
    };

    // Timeout settings
    timeouts?: {
        request?: number;
        connection?: number;
        idle?: number;
        keepAlive?: number;
    };

    // Metrics collection
    metrics?: {
        enabled?: boolean;
        interval?: number;
        retention?: number;
        detailed?: boolean;
    };

    // Update settings
    updates?: {
        check?: boolean;
        interval?: number;
        autoDownload?: boolean;
        autoInstall?: boolean;
        channel?: 'stable' | 'beta' | 'alpha';
    };

    // Plugin settings
    plugins?: {
        enabled?: boolean;
        directory?: string;
        autoload?: boolean;
        allowedSources?: string[];
        installed?: Record<string, {
            version: string;
            enabled: boolean;
            config?: Record<string, any>;
        }>;
    };

    // Custom extensions
    extensions?: {
        [key: string]: any;
    };
}

/**
 * Configuration file structure
 */
export interface ConfigFile {
    version: string;
    lastUpdated: string;
    data: ConfigData;
}

/**
 * Configuration options
 */
export interface ConfigOptions {
    configPath?: string;
    autoCreate?: boolean;
    autoLoad?: boolean;
    watchFile?: boolean;
    mergeEnv?: boolean;
    defaults?: Partial<ConfigData>;
}

/**
 * Configuration update event
 */
export interface ConfigUpdateEvent {
    type: 'update' | 'delete' | 'create';
    key: string;
    value?: any;
    previousValue?: any;
    timestamp: string;
}

/**
 * Configuration validation options
 */
export interface ConfigValidationOptions {
    strict?: boolean;
    allowUnknown?: boolean;
    removeUnknown?: boolean;
}

/**
 * Configuration migration
 */
export interface ConfigMigration {
    version: string;
    description: string;
    up: (config: ConfigData) => Promise<void>;
    down: (config: ConfigData) => Promise<void>;
}