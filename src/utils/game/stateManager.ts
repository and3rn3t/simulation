import { BehaviorSubject } from 'rxjs';

interface AppState {
  simulationRunning: boolean;
  selectedOrganism: string;
  speed: number;
  populationLimit: number;
  stats: {
    population: number;
    generation: number;
  };
}

export class StateManager {
  private state$: BehaviorSubject<AppState>;

  constructor(initialState: AppState) {
    this.state$ = new BehaviorSubject<AppState>(initialState);
  }

  getState() {
    return this.state$.asObservable();
  }

  updateState(partialState: Partial<AppState>) {
    const currentState = this.state$.getValue();
    this.state$.next({ ...currentState, ...partialState });
  }

  getCurrentState(): AppState {
    return this.state$.getValue();
  }

  saveStateToLocalStorage(key: string): void {
    const currentState = this.getCurrentState();
    localStorage.setItem(key, JSON.stringify(currentState));
  }

  loadStateFromLocalStorage(key: string): void {
    const savedState = localStorage.getItem(key);
    if (savedState) { this.updateState(JSON.parse(savedState));
      }
  }
}
