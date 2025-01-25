import chalk from 'chalk';
import figures from 'figures';
import { format } from 'date-fns';

class Logger {
    private static instance: Logger;
    private debugMode: boolean = false;

    private constructor() {
        this.debugMode = process.env.SONOMA_DEBUG === 'true';
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    /**
     * Enable or disable debug mode
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * Log an info message
     */
    public info(message: string, ...args: any[]): void {
        console.log(
            chalk.blue(figures.info),
            message,
            ...args
        );
    }

    /**
     * Log a success message
     */
    public success(message: string, ...args: any[]): void {
        console.log(
            chalk.green(figures.tick),
            message,
            ...args
        );
    }

    /**
     * Log a warning message
     */
    public warn(message: string, ...args: any[]): void {
        console.log(
            chalk.yellow(figures.warning),
            chalk.yellow(message),
            ...args
        );
    }

    /**
     * Log an error message
     */
    public error(message: string, error?: Error | any, ...args: any[]): void {
        console.error(
            chalk.red(figures.cross),
            chalk.red(message),
            ...args
        );

        if (error && this.debugMode) {
            if (error instanceof Error) {
                console.error(chalk.red(error.stack));
            } else {
                console.error(chalk.red(JSON.stringify(error, null, 2)));
            }
        }
    }

    /**
     * Log a debug message (only in debug mode)
     */
    public debug(message: string, ...args: any[]): void {
        if (this.debugMode) {
            console.debug(
                chalk.gray(figures.pointer),
                chalk.gray(`[${format(new Date(), 'HH:mm:ss')}]`),
                chalk.gray(message),
                ...args
            );
        }
    }

    /**
     * Log a verbose message (only in debug mode)
     */
    public verbose(message: string, ...args: any[]): void {
        if (this.debugMode) {
            console.log(
                chalk.gray(figures.dot),
                chalk.gray(message),
                ...args
            );
        }
    }

    /**
     * Create an empty line
     */
    public empty(): void {
        console.log();
    }

    /**
     * Create a divider line
     */
    public divider(): void {
        console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)));
    }

    /**
     * Log a table
     */
    public table(data: any[], columns?: string[]): void {
        if (data.length === 0) {
            return;
        }

        const cols = columns || Object.keys(data[0]);
        const widths = cols.map(col => 
            Math.max(
                col.length,
                ...data.map(row => String(row[col] || '').length)
            )
        );

        // Header
        console.log(
            cols.map((col, i) => 
                chalk.gray(col.padEnd(widths[i]))
            ).join('  ')
        );

        // Divider
        console.log(
            cols.map((_, i) => 
                chalk.gray('─'.repeat(widths[i]))
            ).join('  ')
        );

        // Rows
        data.forEach(row => {
            console.log(
                cols.map((col, i) => 
                    String(row[col] || '').padEnd(widths[i])
                ).join('  ')
            );
        });
    }

    /**
     * Start a loading group
     */
    public group(title: string): void {
        console.group(chalk.cyan(figures.pointer), title);
    }

    /**
     * End a loading group
     */
    public groupEnd(): void {
        console.groupEnd();
    }

    /**
     * Log a step message
     */
    public step(step: number, total: number, message: string): void {
        console.log(
            chalk.gray(`[${step}/${total}]`),
            chalk.cyan(figures.pointer),
            message
        );
    }
}

export const logger = Logger.getInstance();