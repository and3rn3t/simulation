import { describe, expect, it } from 'vitest';

describe('Chart.js Instance Debug', () => {
  it('should create Chart instances with proper methods', async () => {
    const { Chart } = await import('chart.js');

    // Create a chart instance like ChartComponent does
    const ctx = { canvas: null } as any;
    const config = { type: 'line', data: { labels: [], datasets: [] } };

    const chartInstance = new Chart(ctx, config);

    console.log('Chart instance:', chartInstance);
    console.log('Chart instance update:', chartInstance.update);
    console.log('Chart instance destroy:', chartInstance.destroy);

    expect(chartInstance).toBeDefined();
    expect(chartInstance.update).toBeTypeOf('function');
    expect(chartInstance.destroy).toBeTypeOf('function');

    // Try calling the methods
    chartInstance.update();
    chartInstance.destroy();
  });
});
