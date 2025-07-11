// Web Worker for population predictions and complex calculations
// This worker handles heavy computational tasks without blocking the main thread

interface OrganismType {
  name: string;
  growthRate: number;
  deathRate: number;
  size: number;
  color: string;
}

// Types for worker communication
interface WorkerMessage {
  id: string;
  type: 'PREDICT_POPULATION' | 'CALCULATE_STATISTICS' | 'BATCH_PROCESS';
  data: any;
}

interface WorkerResponse {
  id: string;
  type: 'PREDICTION_RESULT' | 'STATISTICS_RESULT' | 'BATCH_RESULT' | 'ERROR';
  data: any;
}

interface PopulationPredictionData {
  currentPopulation: number;
  organismTypes: OrganismType[];
  simulationTime: number;
  environmentalFactors: {
    temperature: number;
    resources: number;
    space: number;
  };
  predictionSteps: number;
}

interface StatisticsData {
  organisms: {
    x: number;
    y: number;
    age: number;
    type: string;
  }[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Population prediction using mathematical modeling
 */
class PopulationPredictor {
  /**
   * Predicts population growth using logistic growth model
   * @param data - Population prediction data
   * @returns Prediction results
   */
  static predictLogisticGrowth(data: PopulationPredictionData): number[] {
    const { currentPopulation, organismTypes, environmentalFactors, predictionSteps } = data;

    const predictions: number[] = [];
    let population = currentPopulation;

    // Calculate carrying capacity based on environment
    const carryingCapacity = this.calculateCarryingCapacity(environmentalFactors);

    // Get average growth rate from organism types
    const avgGrowthRate =
      organismTypes.reduce((sum, type) => sum + type.growthRate, 0) / organismTypes.length;
    const intrinsicGrowthRate = avgGrowthRate * 0.01; // Convert percentage to decimal

    // Apply environmental modifiers
    const modifiedGrowthRate =
      intrinsicGrowthRate * this.getEnvironmentalModifier(environmentalFactors);

    for (let step = 0; step < predictionSteps; step++) {
      // Logistic growth equation: dP/dt = r * P * (1 - P/K)
      const growthRate = modifiedGrowthRate * population * (1 - population / carryingCapacity);
      population += growthRate;

      // Apply random variation
      const variation = (Math.random() - 0.5) * 0.1 * population;
      population = Math.max(0, population + variation);

      predictions.push(Math.round(population));
    }

    return predictions;
  }

  /**
   * Predicts population using competition model
   * @param data - Population prediction data
   * @returns Prediction results with competition effects
   */
  static predictCompetitionModel(data: PopulationPredictionData): {
    totalPopulation: number[];
    byType: Record<string, number[]>;
  } {
    const { currentPopulation, organismTypes, environmentalFactors, predictionSteps } = data;

    const totalPredictions: number[] = [];
    const typePopulations: Record<string, number> = {};
    const typePredictions: Record<string, number[]> = {};

    // Initialize type populations
    organismTypes.forEach(type => {
      typePopulations[type.name] = Math.floor(currentPopulation / organismTypes.length);
      typePredictions[type.name] = [];
    });

    const carryingCapacity = this.calculateCarryingCapacity(environmentalFactors);

    for (let step = 0; step < predictionSteps; step++) {
      let totalPop = 0;

      // Calculate competition effects
      const totalCompetition = Object.values(typePopulations).reduce((sum, pop) => sum + pop, 0);

      organismTypes.forEach(type => {
        const currentPop = typePopulations[type.name];
        if (currentPop !== undefined) {
          const intrinsicGrowth = type.growthRate * 0.01 * currentPop;
          const competitionEffect = (totalCompetition / carryingCapacity) * currentPop;
          const deathEffect = type.deathRate * 0.01 * currentPop;

          const netGrowth = intrinsicGrowth - competitionEffect - deathEffect;
          const newPop = Math.max(0, currentPop + netGrowth);

          typePopulations[type.name] = newPop;
          const typePrediction = typePredictions[type.name];
          if (typePrediction) {
            typePrediction.push(Math.round(newPop));
          }
          totalPop += newPop;
        }
      });

      totalPredictions.push(Math.round(totalPop));
    }

    return {
      totalPopulation: totalPredictions,
      byType: typePredictions,
    };
  }

  /**
   * Calculates carrying capacity based on environmental factors
   * @param factors - Environmental factors
   * @returns Carrying capacity
   */
  private static calculateCarryingCapacity(
    factors: PopulationPredictionData['environmentalFactors']
  ): number {
    const baseCapacity = 1000;
    const tempModifier = 1 - Math.abs(factors.temperature - 0.5) * 0.5;
    const resourceModifier = factors.resources;
    const spaceModifier = factors.space;

    return baseCapacity * tempModifier * resourceModifier * spaceModifier;
  }

  /**
   * Gets environmental modifier for growth rate
   * @param factors - Environmental factors
   * @returns Growth rate modifier
   */
  private static getEnvironmentalModifier(
    factors: PopulationPredictionData['environmentalFactors']
  ): number {
    const tempModifier = 1 - Math.abs(factors.temperature - 0.5) * 0.3;
    const resourceModifier = 0.5 + factors.resources * 0.5;
    const spaceModifier = 0.5 + factors.space * 0.5;

    return tempModifier * resourceModifier * spaceModifier;
  }
}

/**
 * Statistics calculator for complex organism data analysis
 */
class StatisticsCalculator {
  /**
   * Calculates spatial distribution statistics
   * @param data - Statistics data
   * @returns Spatial distribution metrics
   */
  static calculateSpatialDistribution(data: StatisticsData): {
    density: number[];
    clusters: { x: number; y: number; count: number }[];
    dispersion: number;
  } {
    const { organisms, canvasWidth, canvasHeight } = data;

    // Create density grid
    const gridSize = 50;
    const gridWidth = Math.ceil(canvasWidth / gridSize);
    const gridHeight = Math.ceil(canvasHeight / gridSize);
    const density = new Array(gridWidth * gridHeight).fill(0);

    // Calculate density
    organisms.forEach(org => {
      const gridX = Math.floor(org.x / gridSize);
      const gridY = Math.floor(org.y / gridSize);
      const index = gridY * gridWidth + gridX;

      if (index >= 0 && index < density.length) {
        density[index]++;
      }
    });

    // Find clusters
    const clusters = this.findClusters(organisms, 30); // 30 pixel radius

    // Calculate dispersion index
    const dispersion = this.calculateDispersion(organisms, canvasWidth, canvasHeight);

    return {
      density,
      clusters,
      dispersion,
    };
  }

  /**
   * Calculates age distribution statistics
   * @param organisms - Organism data
   * @returns Age distribution metrics
   */
  static calculateAgeDistribution(organisms: StatisticsData['organisms']): {
    histogram: number[];
    mean: number;
    median: number;
    standardDeviation: number;
  } {
    const ages = organisms.map(org => org.age);
    const maxAge = Math.max(...ages, 100);
    const binSize = 10;
    const numBins = Math.ceil(maxAge / binSize);
    const histogram = new Array(numBins).fill(0);

    // Create histogram
    ages.forEach(age => {
      const bin = Math.floor(age / binSize);
      if (bin < numBins) {
        histogram[bin]++;
      }
    });

    // Calculate statistics
    const mean = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    const sortedAges = [...ages].sort((a, b) => a - b);
    const median = sortedAges[Math.floor(sortedAges.length / 2)] ?? 0;
    const variance = ages.reduce((sum, age) => sum + Math.pow(age - mean, 2), 0) / ages.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      histogram,
      mean,
      median,
      standardDeviation,
    };
  }

  /**
   * Finds organism clusters using proximity analysis
   * @param organisms - Organism data
   * @param radius - Cluster radius
   * @returns Array of cluster centers
   */
  private static findClusters(
    organisms: StatisticsData['organisms'],
    radius: number
  ): { x: number; y: number; count: number }[] {
    const clusters: { x: number; y: number; count: number }[] = [];
    const processed = new Set<number>();

    organisms.forEach((org, index) => {
      if (processed.has(index)) return;

      const cluster = { x: org.x, y: org.y, count: 1 };
      processed.add(index);

      // Find nearby organisms
      organisms.forEach((other, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;

        const distance = Math.sqrt(Math.pow(org.x - other.x, 2) + Math.pow(org.y - other.y, 2));

        if (distance <= radius) {
          cluster.x = (cluster.x * cluster.count + other.x) / (cluster.count + 1);
          cluster.y = (cluster.y * cluster.count + other.y) / (cluster.count + 1);
          cluster.count++;
          processed.add(otherIndex);
        }
      });

      if (cluster.count > 1) {
        clusters.push(cluster);
      }
    });

    return clusters;
  }

  /**
   * Calculates dispersion index for spatial distribution
   * @param organisms - Organism data
   * @param canvasWidth - Canvas width
   * @param canvasHeight - Canvas height
   * @returns Dispersion index
   */
  private static calculateDispersion(
    organisms: StatisticsData['organisms'],
    canvasWidth: number,
    canvasHeight: number
  ): number {
    const gridSize = 50;
    const gridWidth = Math.ceil(canvasWidth / gridSize);
    const gridHeight = Math.ceil(canvasHeight / gridSize);
    const counts: number[] = [];

    // Count organisms in each grid cell
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        let count = 0;
        organisms.forEach(org => {
          const gridX = Math.floor(org.x / gridSize);
          const gridY = Math.floor(org.y / gridSize);
          if (gridX === x && gridY === y) {
            count++;
          }
        });
        counts.push(count);
      }
    }

    // Calculate variance-to-mean ratio
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance =
      counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;

    return mean > 0 ? variance / mean : 0;
  }
}

// Worker event handlers
self.onmessage = function (e: MessageEvent<WorkerMessage>) {
  const { id, type, data } = e.data;

  try {
    let result: any;

    switch (type) {
      case 'PREDICT_POPULATION':
        result = {
          logistic: PopulationPredictor.predictLogisticGrowth(data),
          competition: PopulationPredictor.predictCompetitionModel(data),
        };
        break;

      case 'CALCULATE_STATISTICS':
        result = {
          spatial: StatisticsCalculator.calculateSpatialDistribution(data),
          age: StatisticsCalculator.calculateAgeDistribution(data.organisms),
        };
        break;

      case 'BATCH_PROCESS':
        // Handle batch processing tasks
        result = { processed: true };
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      type: type
        .replace('PREDICT_', 'PREDICTION_')
        .replace('CALCULATE_', 'CALCULATION_')
        .replace('BATCH_', 'BATCH_') as any,
      data: result,
    };

    self.postMessage(response);
  } catch (error) {
    const errorResponse: WorkerResponse = {
      id,
      type: 'ERROR',
      data: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    };

    self.postMessage(errorResponse);
  }
};

// Export types for TypeScript support
export type { WorkerMessage, WorkerResponse, PopulationPredictionData, StatisticsData };
