/**
 * Fast Vitest Setup for CI/CD
 * Optimized for speed with minimal mocking
 */

import { beforeAll, vi } from "vitest";

// Fast DOM setup
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Essential Canvas mock (lightweight)
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 0 }),
    canvas: { width: 800, height: 600 },
  });
}

// Essential ResizeObserver mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Essential Worker mock for algorithm tests
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null,
  onerror: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Essential URL mock
global.URL = {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
} as any;

// Fast error handler mock
if (process.env.CI) {
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
  };
}

// Essential Chart.js mock (minimal)
vi.mock("chart.js", () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    render: vi.fn(),
    clear: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    toBase64Image: vi.fn(),
    generateLegend: vi.fn(),
    data: { labels: [], datasets: [] },
    options: {},
    canvas: { canvas: null },
    ctx: { canvas: null },
    chart: null,
  })),
  registerables: [],
}));

// Test timeout warning
beforeAll(() => {
  if (process.env.CI) {
    console.log("🚀 Running in fast CI mode - complex tests excluded");
  }
});
