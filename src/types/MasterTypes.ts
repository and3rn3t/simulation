/**
 * Master Type Definitions
 * Consolidated to reduce duplication
 */

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds extends Position, Size {}

export interface ErrorContext {
  operation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
}

export interface EventHandler<T = Event> {
  (event: T): void;
}

export interface CleanupFunction {
  (): void;
}

export interface ConfigOptions {
  [key: string]: any;
}

export interface StatusResult {
  success: boolean;
  message?: string;
  data?: any;
}
