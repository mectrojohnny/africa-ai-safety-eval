/**
 * RateLimiter class to handle API rate limits
 */
export declare class RateLimiter {
    private lastCallTime;
    private minTimeBetweenCalls;
    /**
     * Create a RateLimiter instance
     * @param minTimeBetweenCalls Minimum time between API calls in milliseconds
     */
    constructor(minTimeBetweenCalls?: number);
    /**
     * Sleep for the specified number of milliseconds
     * @param ms The number of milliseconds to sleep
     * @returns A promise that resolves after the specified time
     */
    private sleep;
    /**
     * Execute a function with rate limiting and automatic retry on rate limit errors
     * @param fn The function to execute
     * @param maxRetries Maximum number of retries (default: 3)
     * @returns The result of the function execution
     */
    execute<T>(fn: () => Promise<T>, maxRetries?: number): Promise<T>;
}
