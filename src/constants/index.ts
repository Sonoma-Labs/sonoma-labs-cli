/**
 * Default agent capabilities
 */
export const DEFAULT_CAPABILITIES = [
    'compute',
    'network',
    'storage',
    'memory',
    'crypto',
    'ai'
] as const;

/**
 * Default memory limit (256MB)
 */
export const DEFAULT_MEMORY_LIMIT = 256 * 1024 * 1024;

/**
 * Default execution limit (100,000 steps)
 */
export const DEFAULT_EXECUTION_LIMIT = 100000;

/**
 * Default compute limit (400,000 units)
 */
export const DEFAULT_COMPUTE_LIMIT = 400000;

/**
 * Network configurations
 */
export const NETWORKS = {
    mainnet: {
        name: 'mainnet',
        url: 'https://api.sonoma.com',
        explorer: 'https://explorer.sonoma.com'
    },
    testnet: {
        name: 'testnet',
        url: 'https://api.testnet.sonoma.com',
        explorer: 'https://explorer.testnet.sonoma.com'
    },
    devnet: {
        name: 'devnet',
        url: 'https://api.devnet.sonoma.com',
        explorer: 'https://explorer.devnet.sonoma.com'
    },
    localnet: {
        name: 'localnet',
        url: 'http://localhost:8899',
        explorer: 'http://localhost:3000'
    }
} as const;

/**
 * CLI configuration
 */
export const CLI_CONFIG = {
    name: 'sonoma',
    version: '0.1.0',
    description: 'Sonoma Labs CLI',
    bin: 'sonoma',
    configName: '.sonomarc',
    homeDirName: '.sonoma'
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    AUTH_ERROR: 'Authentication failed. Please check your credentials.',
    PERMISSION_ERROR: 'Permission denied. Please check your access rights.',
    NOT_FOUND: 'Resource not found.',
    INVALID_INPUT: 'Invalid input provided.',
    UNKNOWN_ERROR: 'An unknown error occurred.'
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    AGENT_CREATED: 'Agent created successfully.',
    AGENT_UPDATED: 'Agent updated successfully.',
    AGENT_DELETED: 'Agent deleted successfully.',
    CONFIG_UPDATED: 'Configuration updated successfully.',
    DEPLOYMENT_SUCCESS: 'Deployment completed successfully.'
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    AGENTS: '/v1/agents',
    DEPLOYMENTS: '/v1/deployments',
    CONFIG: '/v1/config',
    STATUS: '/v1/status',
    METRICS: '/v1/metrics'
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
} as const;

/**
 * File size constants (in bytes)
 */
export const FILE_SIZE = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
} as const;

/**
 * Default timeouts (in milliseconds)
 */
export const TIMEOUTS = {
    REQUEST: 30000,
    DEPLOY: 300000,
    MONITOR: 60000
} as const;

/**
 * Regex patterns
 */
export const REGEX = {
    AGENT_NAME: /^[a-zA-Z][a-zA-Z0-9-_]{2,31}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
    SEMANTIC_VERSION: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
} as const;