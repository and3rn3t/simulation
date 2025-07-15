/**
 * Base Singleton class to reduce getInstance() duplication
 */
export abstract class BaseSingleton {
  private static instances: Map<string, any> = new Map();

  protected static getInstance<T extends BaseSingleton>(this: new () => T, className: string): T {
    if (!BaseSingleton.instances.has(className)) {
      BaseSingleton.instances.set(className, new this());
    }
    return BaseSingleton.instances.get(className) as T;
  }

  protected constructor() {
    // Protected constructor to prevent direct instantiation
  }

  /**
   * Reset all singleton instances (useful for testing)
   */
  public static resetInstances(): void {
    BaseSingleton.instances.clear();
  }
}
