/**
 * Position interface for 2D coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Position with optional velocity
 */
export interface PositionWithVelocity extends Position {
  vx?: number;
  vy?: number;
}

/**
 * 3D Position interface
 */
export interface Position3D extends Position {
  z: number;
}
