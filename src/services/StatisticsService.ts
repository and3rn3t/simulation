export class StatisticsService {
  calculateStatistics(): Record<string, number> {
    return {
      population: 100,
      generation: 10,
    };
  }

  logStatistics(): void {
    console.log('Statistics logged');
  }
}
