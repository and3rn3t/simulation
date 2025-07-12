import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Chart.js Module Level Debug', () => {
  beforeEach(() => {
    // Clear all mocks and module cache before each test
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should call Chart.register on fresh module import', async () => {
    // Import Chart first to get a fresh mock
    const { Chart } = await import('chart.js');

    // Now import ChartComponent which should trigger Chart.register at module level
    await import('../src/ui/components/ChartComponent');

    expect(Chart.register).toHaveBeenCalled();
  });

  it('should show how integration test behaves', async () => {
    // This mimics what happens in the integration test
    const { ChartComponent } = await import('../src/ui/components/ChartComponent');
    const { Chart } = await import('chart.js');

    console.log(
      'After component import - Chart.register called?',
      (Chart.register as any).mock.calls.length
    );

    expect(ChartComponent).toBeDefined();
    // In the real integration test, this would fail because the module was already loaded
  });
});
