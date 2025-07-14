export interface SimulationStats {
  population: number;
  births: number;
  deaths: number;
  averageAge: number;
  averageEnergy: number;
  time: number;
  generation: number;
  isRunning: boolean;
  placementMode: boolean;
}
