/**
 * RateLimiter class to handle API rate limits
 */
export class RateLimiter {
  private lastCallTime: number = 0;
  private minTimeBetweenCalls: number = 1000; // Default 1 second between calls

  /**
   * Create a RateLimiter instance
   * @param minTimeBetweenCalls Minimum time between API calls in milliseconds
   */
  constructor(minTimeBetweenCalls: number = 1000) {
    this.minTimeBetweenCalls = minTimeBetweenCalls;
  }

  /**
   * Sleep for the specified number of milliseconds
   * @param ms The number of milliseconds to sleep
   * @returns A promise that resolves after the specified time
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a function with rate limiting and automatic retry on rate limit errors
   * @param fn The function to execute
   * @param maxRetries Maximum number of retries (default: 3)
   * @returns The result of the function execution
   */
  async execute<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    // Check if we need to wait before making the call
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minTimeBetweenCalls) {
      const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
      await this.sleep(waitTime);
    }
    
    let retries = 0;
    
    while (true) {
      try {
        // Make the API call
        this.lastCallTime = Date.now();
        const result = await fn();
        return result;
      } catch (error: any) {
        // Check if this is a rate limit error
        const isRateLimitError = error?.message?.includes('429') || 
                                error?.message?.includes('Too Many Requests') ||
                                error?.message?.includes('exceeded your current quota');
        
        // If it's a rate limit error and we haven't exceeded max retries
        if (isRateLimitError && retries < maxRetries) {
          console.log(`Rate limit error detected. Waiting 2 seconds before retry (${retries + 1}/${maxRetries})...`);
          // Wait for 2 seconds as requested before retrying
          await this.sleep(2000);
          retries++;
          continue;
        }
        
        // For other errors or if we've exceeded retries, rethrow
        throw error;
      }
    }
  }
} 