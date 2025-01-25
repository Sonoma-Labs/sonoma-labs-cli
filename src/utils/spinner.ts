import ora, { Ora } from 'ora';
import chalk from 'chalk';
import figures from 'figures';

class Spinner {
    private static instance: Spinner;
    private spinner: Ora | null = null;
    private isEnabled: boolean = true;

    private constructor() {
        // Disable spinner in CI environments
        this.isEnabled = !process.env.CI && process.stdout.isTTY;
    }

    public static getInstance(): Spinner {
        if (!Spinner.instance) {
            Spinner.instance = new Spinner();
        }
        return Spinner.instance;
    }

    /**
     * Start a new spinner
     */
    public start(text: string): SpinnerInstance {
        if (this.spinner) {
            this.spinner.stop();
        }

        if (this.isEnabled) {
            this.spinner = ora({
                text,
                color: 'cyan',
                spinner: 'dots',
            }).start();
        } else {
            console.log(chalk.cyan(figures.pointer), text);
        }

        return new SpinnerInstance(this.spinner);
    }

    /**
     * Stop the current spinner
     */
    public stop(): void {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
}

class SpinnerInstance {
    constructor(private spinner: Ora | null) {}

    /**
     * Update spinner text
     */
    public text(text: string): this {
        if (this.spinner) {
            this.spinner.text = text;
        } else {
            console.log(chalk.cyan(figures.pointer), text);
        }
        return this;
    }

    /**
     * Stop spinner with success
     */
    public succeed(text?: string): void {
        if (this.spinner) {
            this.spinner.succeed(text);
        } else {
            console.log(chalk.green(figures.tick), text || '');
        }
    }

    /**
     * Stop spinner with failure
     */
    public fail(text?: string): void {
        if (this.spinner) {
            this.spinner.fail(text);
        } else {
            console.log(chalk.red(figures.cross), text || '');
        }
    }

    /**
     * Stop spinner with warning
     */
    public warn(text?: string): void {
        if (this.spinner) {
            this.spinner.warn(text);
        } else {
            console.log(chalk.yellow(figures.warning), text || '');
        }
    }

    /**
     * Stop spinner with info
     */
    public info(text?: string): void {
        if (this.spinner) {
            this.spinner.info(text);
        } else {
            console.log(chalk.blue(figures.info), text || '');
        }
    }

    /**
     * Update spinner color
     */
    public color(color: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'): this {
        if (this.spinner) {
            this.spinner.color = color;
        }
        return this;
    }

    /**
     * Stop the spinner
     */
    public stop(): void {
        if (this.spinner) {
            this.spinner.stop();
        }
    }

    /**
     * Clear the spinner
     */
    public clear(): void {
        if (this.spinner) {
            this.spinner.clear();
        }
    }

    /**
     * Render a frame
     */
    public render(): void {
        if (this.spinner) {
            this.spinner.render();
        }
    }

    /**
     * Start the spinner
     */
    public start(text?: string): this {
        if (this.spinner) {
            this.spinner.start(text);
        } else if (text) {
            console.log(chalk.cyan(figures.pointer), text);
        }
        return this;
    }

    /**
     * Check if spinner is spinning
     */
    public isSpinning(): boolean {
        return this.spinner ? this.spinner.isSpinning : false;
    }
}

export const spinner = Spinner.getInstance();