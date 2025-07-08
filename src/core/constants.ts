/**
 * Application-wide constants and configuration values
 */

export const SIMULATION_CONFIG = {
  /** Default simulation speed */
  DEFAULT_SPEED: 5,
  /** Maximum simulation speed */
  MAX_SPEED: 10,
  /** Minimum simulation speed */
  MIN_SPEED: 1,
  /** Default maximum population */
  DEFAULT_MAX_POPULATION: 1000,
  /** Minimum age before organism can reproduce */
  MIN_REPRODUCTION_AGE: 20,
  /** Time interval for stats updates (ms) */
  STATS_UPDATE_INTERVAL: 1000,
  /** Notification display duration (ms) */
  NOTIFICATION_DURATION: 4000,
  /** Game systems update interval (ms) */
  GAME_SYSTEMS_UPDATE_INTERVAL: 1000
} as const;

export const CANVAS_CONFIG = {
  /** Default canvas width */
  DEFAULT_WIDTH: 800,
  /** Default canvas height */
  DEFAULT_HEIGHT: 500,
  /** Background color */
  BACKGROUND_COLOR: '#1a1a1a',
  /** Grid color */
  GRID_COLOR: '#333',
  /** Grid line spacing */
  GRID_SIZE: 50,
  /** Grid line width */
  GRID_LINE_WIDTH: 0.5
} as const;

export const UI_CONFIG = {
  /** Achievement notification duration */
  ACHIEVEMENT_NOTIFICATION_DURATION: 4000,
  /** Unlock notification duration */
  UNLOCK_NOTIFICATION_DURATION: 5000,
  /** Animation delay for notifications */
  NOTIFICATION_ANIMATION_DELAY: 100,
  /** Animation hide delay */
  NOTIFICATION_HIDE_DELAY: 300
} as const;

export const ELEMENT_IDS = {
  CANVAS: 'simulation-canvas',
  ORGANISM_SELECT: 'organism-select',
  SPEED_SLIDER: 'speed-slider',
  SPEED_VALUE: 'speed-value',
  POPULATION_LIMIT_SLIDER: 'population-limit',
  POPULATION_LIMIT_VALUE: 'population-limit-value',
  START_BTN: 'start-btn',
  PAUSE_BTN: 'pause-btn',
  RESET_BTN: 'reset-btn',
  CLEAR_BTN: 'clear-btn',
  START_CHALLENGE_BTN: 'start-challenge-btn',
  // Stats elements
  POPULATION_COUNT: 'population-count',
  GENERATION_COUNT: 'generation-count',
  TIME_ELAPSED: 'time-elapsed',
  BIRTH_RATE: 'birth-rate',
  DEATH_RATE: 'death-rate',
  AVG_AGE: 'avg-age',
  OLDEST_ORGANISM: 'oldest-organism',
  POPULATION_DENSITY: 'population-density',
  POPULATION_STABILITY: 'population-stability',
  SCORE: 'score',
  ACHIEVEMENT_COUNT: 'achievement-count',
  HIGH_SCORE: 'high-score',
  // Lists
  ACHIEVEMENTS_LIST: 'achievements-list',
  LEADERBOARD_LIST: 'leaderboard-list'
} as const;
