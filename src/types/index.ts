import { DEFAULT_CAPABILITIES, NETWORKS } from '../constants';

/**
 * Agent capabilities type
 */
export type AgentCapability = typeof DEFAULT_CAPABILITIES[number];

/**
 * Network name type
 */
export type NetworkName = keyof typeof NETWORKS;

/**
 * Agent configuration
 */
export interface AgentConfig {
    name: string;
    capabilities: AgentCapability[];
    memoryLimit: number;
    executionLimit?: number;
    autonomousMode: boolean;
    deployment?: DeploymentInfo;
    metadata?: Record<string, any>;
}

/**
 * Deployment information
 */
export interface DeploymentInfo {
    id: string;
    address: string;
    network: NetworkName;
    status: DeploymentStatus;
    createdAt: string;
    updatedAt: string;
    stoppedAt?: string;
}

/**
 * Deployment status
 */
export type DeploymentStatus = 
    | 'pending'
    | 'deploying'
    | 'running'
    | 'stopped'
    | 'failed';

/**
 * CLI options
 */
export interface CliOptions {
    debug?: boolean;
    verbose?: boolean;
    json?: boolean;
    quiet?: boolean;
    config?: string;
}

/**
 * Command options
 */
export interface CommandOptions extends CliOptions {
    force?: boolean;
    dryRun?: boolean;
    validate?: boolean;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
    name: NetworkName;
    url: string;
    explorer?: string;
    headers?: Record<string, string>;
}

/**
 * API response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

/**
 * Agent metrics
 */
export interface AgentMetrics {
    memoryUsage: number;
    executionSteps: number;
    computeUnits: number;
    uptime: number;
    lastActive: string;
}

/**
 * Agent event
 */
export interface AgentEvent {
    type: string;
    timestamp: string;
    data: any;
}

/**
 * Agent state
 */
export interface AgentState {
    status: DeploymentStatus;
    metrics: AgentMetrics;
    lastEvent?: AgentEvent;
}

/**
 * Progress callback
 */
export type ProgressCallback = (
    current: number,
    total: number,
    message?: string
) => void;

/**
 * Status callback
 */
export type StatusCallback = (
    status: string,
    details?: any
) => void;

/**
 * Error callback
 */
export type ErrorCallback = (
    error: Error,
    details?: any
) => void;

/**
 * Logger options
 */
export interface LoggerOptions {
    level?: 'debug' | 'info' | 'warn' | 'error';
    format?: 'text' | 'json';
    timestamp?: boolean;
    colors?: boolean;
}

/**
 * Spinner options
 */
export interface SpinnerOptions {
    text?: string;
    color?: string;
    spinner?: string;
    stream?: NodeJS.WriteStream;
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

/**
 * Retry options
 */
export interface RetryOptions {
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
    factor?: number;
    onRetry?: (error: Error, attempt: number) => void;
}

/**
 * File info
 */
export interface FileInfo {
    path: string;
    name: string;
    size: number;
    created: Date;
    modified: Date;
    isDirectory: boolean;
}

/**
 * Command definition
 */
export interface CommandDefinition {
    name: string;
    description: string;
    args?: string[];
    options?: Record<string, string>;
    action: (options: CommandOptions) => Promise<void>;
}