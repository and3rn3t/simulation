import { describe, it, expect } from 'vitest';
import { VisualizationDashboard } from '../../src/ui/components/VisualizationDashboard';

describe('VisualizationDashboard Import Test', () => {
  it('should import VisualizationDashboard successfully', () => {
    expect(VisualizationDashboard).toBeDefined();
  });
});
