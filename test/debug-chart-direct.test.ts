/**
 * Debug Chart.js Direct Usage
 */

import { describe, expect, it, vi } from 'vitest';

describe('Chart.js Direct Debug', () => {
  it('should create Chart instances with methods when called directly', () => {
    // Import Chart.js and test directly
    const { Chart } = require('chart.js');

    console.log('Chart constructor:', Chart);
    console.log('Chart type:', typeof Chart);

    // Create a mock canvas context
    const mockCtx = {
      canvas: { width: 400, height: 300 },
      fillRect: vi.fn(),
      clearRect: vi.fn(),
    };

    // Create a chart instance directly
    const chart = new Chart(mockCtx, {
      type: 'line',
      data: { datasets: [], labels: [] },
      options: {},
    });

    console.log('Chart instance:', chart);
    console.log('Chart instance update:', chart.update);
    console.log('Chart instance destroy:', chart.destroy);

    expect(chart).toBeDefined();
    expect(chart.update).toBeDefined();
    expect(chart.destroy).toBeDefined();
    expect(typeof chart.update).toBe('function');
    expect(typeof chart.destroy).toBe('function');
  });
});
