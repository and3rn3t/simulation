import { SimulationService } from '../../services/SimulationService';
import { AchievementService } from '../../services/AchievementService';
import { StatisticsService } from '../../services/StatisticsService';

export class IoCContainer {
  private services: Map<string, any> = new Map();

  register<T>(key: string, instance: T): void {
    if (this.services.has(key)) {
      throw new Error(`Service with key '${key}' is already registered.`);
    }
    this.services.set(key, instance);
  }

  resolve<T>(key: string): T {
    const instance = this.services.get(key);
    if (!instance) { throw new Error(`Service with key '${key  }' is not registered.`);
    }
    return instance;
  }
}

// Register services in IoC container
const iocContainer = new IoCContainer();
iocContainer.register('SimulationService', new SimulationService());
iocContainer.register('AchievementService', new AchievementService());
iocContainer.register('StatisticsService', new StatisticsService());
