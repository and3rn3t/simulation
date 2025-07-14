import { describe, expect, it, vi } from 'vitest';

describe('Chart.js Debug', () => {
  it('should be able to import Chart.js', async () => {
    const { Chart, registerables } = await import('chart.js');

    console.log('Chart object:', Chart);
    console.log('Chart.register:', Chart.register);
    console.log('registerables:', registerables);

    expect(Chart).toBeDefined();
    expect(Chart.register).toBeTypeOf('function');
    expect(registerables).toBeDefined();

    // Try calling Chart.register
    Chart.register(...registerables);
  });

  it('should be able to import ChartComponent', async () => {
    // This should trigger the Chart.register call at module level
    const { ChartComponent } = await import('../src/ui/components/ChartComponent');

    expect(ChartComponent).toBeDefined();
  });

  it('should work when called in the same way as integration test', async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Import Chart first like the integration test
    const { Chart } = await import('chart.js');
    console.log('Integration style - Chart object:', Chart);
    console.log('Integration style - Chart.register:', Chart.register);

    // Now import ChartComponent
    const { ChartComponent } = await import('../src/ui/components/ChartComponent');

    expect(ChartComponent).toBeDefined();
    expect(Chart.register).toHaveBeenCalled();
  });
});
