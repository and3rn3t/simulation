/**
 * Promise Safety Utilities for SonarCloud Reliability
 * Provides safe promise handling patterns
 */

export class PromiseSafetyUtils {
  /**
   * Safe promise wrapper that never throws
   */
  static async safePromise<T>(
    promise: Promise<T>,
    fallback?: T,
    context?: string
  ): Promise<{ data?: T; error?: any; success: boolean }> {
    try {
      const data = await promise;
      return { data, success: true };
    } catch (error) {
      console.warn(`Promise failed${context ? ` in ${context}` : ''}`, error);
      return {
        error,
        success: false,
        data: fallback,
      };
    }
  }

  /**
   * Safe Promise.all that handles individual failures
   */
  static async safePromiseAll<T>(
    promises: Promise<T>[]
  ): Promise<{ results: (T | undefined)[]; errors: any[]; successCount: number }> {
    const results: (T | undefined)[] = [];
    const errors: any[] = [];
    let successCount = 0;

    await Promise.allSettled(promises).then(settled => {
      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results[index] = result.value;
          successCount++;
        } else {
          results[index] = undefined;
          errors[index] = result.reason;
        }
      });
    });

    return { results, errors, successCount };
  }

  /**
   * Promise with timeout and fallback
   */
  static async safePromiseWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 5000,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Promise timeout')), timeoutMs);
      });

      return await Promise.race([promise, timeoutPromise]);
    } catch (error) {
      console.warn('Promise timeout or error:', error);
      return fallback;
    }
  }

  /**
   * Retry failed promises with exponential backoff
   */
  static async safeRetryPromise<T>(
    promiseFactory: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T | undefined> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await promiseFactory();
      } catch (error) {
        if (attempt === maxRetries) {
          console.error('Max retries exceeded:', error);
          return undefined;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return undefined;
  }

  /**
   * Convert callback to promise safely
   */
  static safePromisify<T>(fn: Function, context?: any): (...args: any[]) => Promise<T | undefined> {
    return (...args: any[]) => {
      return new Promise(resolve => {
        try {
          const callback = (error: any, result: T) => {
            if (error) {
              console.warn('Promisified function error:', error);
              resolve(undefined);
            } else {
              resolve(result);
            }
          };

          fn.apply(context, [...args, callback]);
        } catch (error) {
          console.warn('Promisify error:', error);
          resolve(undefined);
        }
      });
    };
  }
}

export default PromiseSafetyUtils;
