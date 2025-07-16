import { Organism } from '../../core/organism';
import type { OrganismType } from '../../models/organismTypes';
import { algorithmWorkerManager } from './workerManager';

/**
 * Environmental factors that affect population growth
 */
export interface EnvironmentalFactors {
  temperature: number; // 0-1 range, 0.5 is optimal
  resources: number; // 0-1 range, 1 is abundant
  space: number; // 0-1 range, 1 is unlimited
  toxicity: number; // 0-1 range, 0 is no toxicity
  pH: number; // 0-1 range, 0.5 is neutral
}

/**
 * Population prediction result
 */
export interface PopulationPrediction {
  timeSteps: number[];
  totalPopulation: number[];
  populationByType: Record<string, number[]>;
  confidence: number;
  peakPopulation: number;
  peakTime: number;
  equilibrium: number;
}

/**
 * Growth curve parameters
 */
export interface GrowthCurve {
  type: 'exponential' | 'logistic' | 'gompertz' | 'competition';
  parameters: {
    r: number; // Growth rate
    K: number; // Carrying capacity
    t0: number; // Time offset
    alpha?: number; // Competition coefficient
    beta?: number; // Environmental stress coefficient
  };
}

/**
 * Predictive population growth algorithms
 */
export class PopulationPredictor {
  private environmentalFactors: EnvironmentalFactors;
  private historicalData: { time: number; population: number }[] = [];
  private predictionCache: Map<string, PopulationPrediction> = new Map();

  constructor(initialEnvironment: EnvironmentalFactors) {
    this.environmentalFactors = initialEnvironment;
  }

  /**
   * Predicts population growth using multiple algorithms
   * @param organisms - Current organism population
   * @param timeHorizon - Number of time steps to predict
   * @param useWorkers - Whether to use web workers for calculation
   * @returns Population prediction
   */
  async predictPopulationGrowth(
    organisms: Organism[],
    timeHorizon: number = 100,
    useWorkers: boolean = true
  ): Promise<PopulationPrediction> {
    try {
      const cacheKey = this.generateCacheKey(organisms, timeHorizon);

      // Check cache first
      if (this.predictionCache.has(cacheKey)) {
        return this.predictionCache.get(cacheKey)!;
      }

      let prediction: PopulationPrediction;

      if (useWorkers && organisms.length > 100) {
        // Use web workers for large populations
        try {
          prediction = await this.predictUsingWorkers(organisms, timeHorizon);
        } catch (error) {
          console.error('Worker prediction error:', error);
          // Fallback to main thread
          prediction = await this.predictUsingMainThread(organisms, timeHorizon);
        }
      } else {
        // Use main thread for small populations
        prediction = await this.predictUsingMainThread(organisms, timeHorizon);
      }

      // Cache the result
      this.predictionCache.set(cacheKey, prediction);

      // Limit cache size
      if (this.predictionCache.size > 10) {
        const firstKey = this.predictionCache.keys().next().value;
        if (firstKey) {
          this.predictionCache.delete(firstKey);
        }
      }

      return prediction;
    } catch {
      /* handled */
    }
  }

  /**
   * Predicts using web workers
   * @param organisms - Current organisms
   * @param timeHorizon - Prediction horizon
   * @returns Population prediction
   */
  private async predictUsingWorkers(
    organisms: Organism[],
    timeHorizon: number
  ): Promise<PopulationPrediction> {
    const organismTypes = this.getOrganismTypes(organisms);
    const workerData = {
      currentPopulation: organisms.length,
      organismTypes,
      simulationTime: Date.now(),
      environmentalFactors: {
        temperature: this.environmentalFactors.temperature,
        resources: this.environmentalFactors.resources,
        space: this.environmentalFactors.space,
      },
      predictionSteps: timeHorizon,
    };

    let result;
    try {
      result = await algorithmWorkerManager.predictPopulation(workerData);
    } catch (error) {
      console.error('Worker prediction error:', error);
      throw error;
    }

    return {
      timeSteps: Array.from({ length: timeHorizon }, (_, i) => i),
      totalPopulation: result.logistic,
      populationByType: result.competition.byType,
      confidence: this.calculateConfidence(organisms),
      peakPopulation: Math.max(...result.logistic),
      peakTime: result.logistic.indexOf(Math.max(...result.logistic)),
      equilibrium: result.logistic[result.logistic.length - 1] ?? 0,
    };
  }

  /**
   * Predicts using main thread
   * @param organisms - Current organisms
   * @param timeHorizon - Prediction horizon
   * @returns Population prediction
   */
  private async predictUsingMainThread(
    organisms: Organism[],
    timeHorizon: number
  ): Promise<PopulationPrediction> {
    const organismTypes = this.getOrganismTypes(organisms);
    const growthCurves = this.calculateGrowthCurves(organismTypes);

    const timeSteps = Array.from({ length: timeHorizon }, (_, i) => i);
    const totalPopulation: number[] = [];
    const populationByType: Record<string, number[]> = {};

    // Initialize type populations
    organismTypes.forEach(type => {
      try {
        populationByType[type.name] = [];
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    // Simulate growth for each time step
    for (let t = 0; t < timeHorizon; t++) {
      let totalPop = 0;

      organismTypes.forEach(type => {
        try {
          const curve = growthCurves[type.name];
          if (curve && curve.parameters) {
            const population = this.calculatePopulationAtTime(t, curve, organisms.length);
            const typePopulation = populationByType[type.name];
            if (typePopulation) {
              typePopulation.push(population);
              totalPop += population;
            }
          }
        } catch (error) {
          console.error('Population calculation error:', error);
        }
      });

      totalPopulation.push(totalPop);
    }

    const peakPopulation = Math.max(...totalPopulation);
    const peakTime = totalPopulation.indexOf(peakPopulation);
    const equilibrium = totalPopulation[totalPopulation.length - 1] ?? 0;

    return {
      timeSteps,
      totalPopulation,
      populationByType,
      confidence: this.calculateConfidence(organisms),
      peakPopulation,
      peakTime,
      equilibrium,
    };
  }

  /**
   * Calculates growth curves for organism types
   * @param organismTypes - Array of organism types
   * @returns Growth curves by type
   */
  private calculateGrowthCurves(organismTypes: OrganismType[]): Record<string, GrowthCurve> {
    const curves: Record<string, GrowthCurve> = {};

    organismTypes.forEach(type => {
      try {
        const environmentalModifier = this.calculateEnvironmentalModifier();
        const carryingCapacity = this.calculateCarryingCapacity(type);

        curves[type.name] = {
          type: 'logistic',
          parameters: {
            r: type.growthRate * 0.01 * environmentalModifier,
            K: carryingCapacity,
            t0: 0,
            alpha: type.deathRate * 0.01,
            beta: (1 - environmentalModifier) * 0.5,
          },
        };
      } catch (error) {
        console.error('Growth curve calculation error:', error);
      }
    });

    return curves;
  }

  /**
   * Calculates population at a specific time using growth curve
   * @param time - Time point
   * @param curve - Growth curve parameters
   * @param initialPopulation - Initial population
   * @returns Population at time
   */
  private calculatePopulationAtTime(
    time: number,
    curve: GrowthCurve,
    initialPopulation: number
  ): number {
    const { r, K, alpha = 0, beta = 0 } = curve.parameters;

    switch (curve.type) {
      case 'exponential':
        return initialPopulation * Math.exp(r * time);

      case 'logistic': {
        const logisticGrowth =
          K / (1 + ((K - initialPopulation) / initialPopulation) * Math.exp(-r * time));
        return Math.max(0, logisticGrowth * (1 - alpha * time) * (1 - beta));
      }
      case 'gompertz': {
        const gompertzGrowth = K * Math.exp(-Math.exp(-r * (time - curve.parameters.t0)));
        return Math.max(0, gompertzGrowth * (1 - alpha * time) * (1 - beta));
      }
      default: {
        return initialPopulation * Math.exp(r * time);
      }
    }
  }

  /**
   * Calculates carrying capacity based on environment and organism type
   * @param type - Organism type
   * @returns Carrying capacity
   */
  private calculateCarryingCapacity(type: OrganismType): number {
    const baseCapacity = 1000;
    const sizeModifier = 1 / Math.sqrt(type.size);
    const environmentalModifier = this.calculateEnvironmentalModifier();

    return baseCapacity * sizeModifier * environmentalModifier;
  }

  /**
   * Calculates environmental modifier for growth
   * @returns Environmental modifier (0-1)
   */
  private calculateEnvironmentalModifier(): number {
    const factors = this.environmentalFactors;

    // Temperature optimum curve
    const tempModifier = 1 - Math.pow(factors.temperature - 0.5, 2) * 4;

    // Resource limitation
    const resourceModifier = factors.resources;

    // Space limitation
    const spaceModifier = factors.space;

    // Toxicity effect
    const toxicityModifier = 1 - factors.toxicity;

    // pH optimum curve
    const pHModifier = 1 - Math.pow(factors.pH - 0.5, 2) * 4;

    return Math.max(
      0.1,
      tempModifier * resourceModifier * spaceModifier * toxicityModifier * pHModifier
    );
  }

  /**
   * Calculates prediction confidence based on data quality
   * @param organisms - Current organisms
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(organisms: Organism[]): number {
    // No organisms = no confidence
    if (organisms.length === 0) {
      return 0;
    }

    let confidence = 0.5; // Base confidence

    // More organisms = higher confidence
    if (organisms.length > 10) confidence += 0.2;
    if (organisms.length > 50) confidence += 0.1;

    // Historical data improves confidence
    if (this.historicalData.length > 5) confidence += 0.1;
    if (this.historicalData.length > 20) confidence += 0.1;

    // Stable environment improves confidence
    const envStability = this.calculateEnvironmentalStability();
    confidence += envStability * 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Calculates environmental stability
   * @returns Stability score (0-1)
   */
  private calculateEnvironmentalStability(): number {
    const factors = this.environmentalFactors;
    const optimalValues = { temperature: 0.5, resources: 0.8, space: 0.8, toxicity: 0, pH: 0.5 };

    let stability = 0;
    Object.entries(optimalValues).forEach(([key, optimal]) => {
      const current = factors[key as keyof EnvironmentalFactors];
      stability += 1 - Math.abs(current - optimal);
    });

    return stability / Object.keys(optimalValues).length;
  }

  /**
   * Gets unique organism types from population
   * @param organisms - Organism array
   * @returns Array of unique organism types
   */
  private getOrganismTypes(organisms: Organism[]): OrganismType[] {
    const typeMap = new Map<string, OrganismType>();

    organisms.forEach(organism => {
      try {
        if (!typeMap.has(organism.type.name)) {
          typeMap.set(organism.type.name, organism.type);
        }
      } catch (error) {
        console.error('Organism type mapping error:', error);
      }
    });

    return Array.from(typeMap.values());
  }

  /**
   * Generates cache key for prediction
   * @param organisms - Organism array
   * @param timeHorizon - Prediction horizon
   * @returns Cache key
   */
  private generateCacheKey(organisms: Organism[], timeHorizon: number): string {
    const typeCount = organisms.reduce(
      (acc, org) => {
        acc[org.type.name] = (acc[org.type.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return `${JSON.stringify(typeCount)}_${timeHorizon}_${JSON.stringify(this.environmentalFactors)}`;
  }

  /**
   * Creates fallback prediction when main algorithms fail
   * @param organisms - Current organisms
   * @param timeHorizon - Prediction horizon
   * @returns Fallback prediction
   */
  private createFallbackPrediction(
    organisms: Organism[],
    timeHorizon: number
  ): PopulationPrediction {
    const timeSteps = Array.from({ length: timeHorizon }, (_, i) => i);
    const currentPop = organisms.length;
    const totalPopulation = timeSteps.map(t => Math.max(0, currentPop + t * 0.1));

    return {
      timeSteps,
      totalPopulation,
      populationByType: {},
      confidence: 0.1,
      peakPopulation: totalPopulation.length > 0 ? Math.max(...totalPopulation) : 0,
      peakTime:
        totalPopulation.length > 0 ? totalPopulation.indexOf(Math.max(...totalPopulation)) : 0,
      equilibrium: totalPopulation[totalPopulation.length - 1] ?? 0,
    };
  }

  /**
   * Updates environmental factors
   * @param factors - New environmental factors
   */
  updateEnvironmentalFactors(factors: Partial<EnvironmentalFactors>): void {
    this.environmentalFactors = { ...this.environmentalFactors, ...factors };
    this.predictionCache.clear(); // Clear cache when environment changes
  }

  /**
   * Adds historical data point
   * @param time - Time point
   * @param population - Population at time
   */
  addHistoricalData(time: number, population: number): void {
    this.historicalData.push({ time, population });

    // Keep only recent data
    if (this.historicalData.length > 100) {
      this.historicalData.shift();
    }
  }

  /**
   * Gets current environmental factors
   * @returns Current environmental factors
   */
  getEnvironmentalFactors(): EnvironmentalFactors {
    return { ...this.environmentalFactors };
  }

  /**
   * Clears prediction cache
   */
  clearCache(): void {
    this.predictionCache.clear();
  }
}
