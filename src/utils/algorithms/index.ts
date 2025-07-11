// Algorithm optimizations exports
export { QuadTree, SpatialPartitioningManager } from './spatialPartitioning';
export { OrganismBatchProcessor, AdaptiveBatchProcessor } from './batchProcessor';
export { AlgorithmWorkerManager, algorithmWorkerManager } from './workerManager';
export { PopulationPredictor } from './populationPredictor';

// Type exports
export type { Rectangle, Point } from './spatialPartitioning';
export type { BatchConfig, BatchResult } from './batchProcessor';
export type {
  WorkerMessage,
  WorkerResponse,
  PopulationPredictionData,
  StatisticsData,
} from './workerManager';
export type {
  EnvironmentalFactors,
  PopulationPrediction,
  GrowthCurve,
} from './populationPredictor';
