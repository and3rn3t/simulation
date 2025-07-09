import { vi } from 'vitest'
import { createCanvas } from 'canvas';

// Define HTMLCanvasElement globally
class HTMLCanvasElementMock {
  width = 0;
  height = 0;
  style: { [key: string]: string } = {};
  eventListeners: { [key: string]: Function[] } = {};
  calls: { type: string; listener: Function }[] = [];

  getContext(type: string) {
    if (type === '2d') {
      const canvas = createCanvas(this.width, this.height);
      return canvas.getContext('2d');
    }
    return null;
  }

  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);

    // Track calls in the instance property
    if (!this.calls) {
      this.calls = [];
    }
    this.calls.push({ type: event, listener: callback });

    // Also attach calls to the addEventListener method itself for test compatibility
    const addEventListenerWithCalls = this.addEventListener as any;
    if (!addEventListenerWithCalls.calls) {
      addEventListenerWithCalls.calls = [];
    }
    addEventListenerWithCalls.calls.push({ type: event, listener: callback });
  }

  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
    this.calls = this.calls.filter(call => call.type !== event || call.listener !== callback);
  }
}
Object.defineProperty(globalThis, 'HTMLCanvasElement', {
  value: HTMLCanvasElementMock,
  configurable: true,
});

// Mock requestAnimationFrame
;(globalThis as any).requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16)
})

// Mock performance.now
;(globalThis as any).performance = {
  now: vi.fn(() => Date.now())
}

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock document and window globals
(globalThis as any).document = {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return new globalThis.HTMLCanvasElement();
    }
    return {};
  }),
  getElementById: vi.fn(() => null),
  querySelector: vi.fn(() => null),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

(globalThis as any).window = {
  ...globalThis,
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  alert: vi.fn(),
  screen: {
    width: 1024,
    height: 768,
  },
};

// Ensure alert mock is applied correctly
globalThis.alert = vi.fn();

// Ensure screen mock is applied correctly
Object.defineProperty(globalThis, 'screen', {
  value: {
    width: 1024,
    height: 768,
    colorDepth: 24,
  },
  configurable: true,
});

// Mock other browser-specific APIs
Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent: 'node.js',
  },
  writable: false,
});

(globalThis as any).Image = class {
  src = '';
  onload = vi.fn();
  onerror = vi.fn();
};

// Mock Canvas API for testing
class MockCanvasElement {
  getContext(contextType: string) {
    if (contextType === '2d') {
      return {
        canvas: this,
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        getImageData: vi.fn(),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        strokeText: vi.fn(),
        fillText: vi.fn(),
      };
    }
    return null;
  }
}

// Enhance mock DOM structure
class MockElement {
  children: any[];
  style: { [key: string]: string };
  id: string;
  eventListeners: { [key: string]: Function[] };
  parentNode: MockElement | null;

  constructor() {
    this.children = [];
    this.style = {};
    this.id = '';
    this.eventListeners = {};
    this.parentNode = null;
  }

  appendChild(child: any) {
    child.parentNode = this;
    this.children.push(child);
  }

  removeChild(child: any) {
    this.children = this.children.filter(c => c !== child);
    child.parentNode = null;
  }

  setAttribute(attr: string, value: any) {
    this[attr] = value;
  }

  getAttribute(attr: string) {
    return this[attr];
  }

  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
}

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = (tagName) => {
  if (tagName === 'canvas') {
    return originalCreateElement.call(document, 'canvas');
  }
  return new MockElement();
};

// Mock document.getElementById
const originalGetElementById = document.getElementById;
document.getElementById = (id) => {
  if (id === 'canvas-container') {
    const container = new MockElement();
    container.id = 'canvas-container';
    return container;
  }
  return originalGetElementById.call(document, id);
};

// Mock CanvasManager methods as spies
const createLayerSpy = vi.fn();
const getContextSpy = vi.fn(() =>
  ({
    canvas: { width: 800, height: 600 },
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    strokeText: vi.fn(),
    fillText: vi.fn(),
    clip: vi.fn(),
    isPointInPath: vi.fn(),
    isPointInStroke: vi.fn(),
    globalAlpha: 1.0,
    globalCompositeOperation: 'source-over',
    lineWidth: 1.0,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10.0,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    strokeStyle: '',
    fillStyle: '',
    createConicGradient: vi.fn(),
    createLinearGradient: vi.fn(),
    createPattern: vi.fn(),
    createRadialGradient: vi.fn(),
    drawFocusIfNeeded: vi.fn(),
    ellipse: vi.fn(),
    getLineDash: vi.fn(),
    lineDashOffset: 0,
    setLineDash: vi.fn(),
    scrollPathIntoView: vi.fn(),
    textDirection: 'ltr',
    filter: '',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low',
    arc: vi.fn(),
    arcTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    fillRule: 'nonzero',
    roundRect: vi.fn(),
    strokeRect: vi.fn(),
    getContextAttributes: vi.fn(),
    isContextLost: vi.fn(),
    drawCustomFocusRing: vi.fn(),
    addHitRegion: vi.fn(),
    removeHitRegion: vi.fn(),
    clearHitRegions: vi.fn(),
    reset: vi.fn(),
    direction: 'ltr',
    fontKerning: 'auto',
    fontStretch: 'normal',
    fontVariantCaps: 'normal',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textRendering: 'auto',
    getTransform: vi.fn(),
    transform: vi.fn(),
  } as any)
);
const resizeLayerSpy = vi.fn();
const clearLayerSpy = vi.fn();
const resizeAllSpy = vi.fn();

vi.mock('../src/utils/canvas/canvasManager', () => {
  // Create a mock constructor that returns the same spies
  const MockCanvasManager = vi.fn().mockImplementation(() => ({
    createLayer: createLayerSpy,
    getContext: getContextSpy,
    resizeLayer: resizeLayerSpy,
    clearLayer: clearLayerSpy,
    resizeAll: resizeAllSpy,
  }));

  // Attach the spies to the constructor's prototype for direct testing
  MockCanvasManager.prototype.createLayer = createLayerSpy;
  MockCanvasManager.prototype.getContext = getContextSpy;
  MockCanvasManager.prototype.resizeLayer = resizeLayerSpy;
  MockCanvasManager.prototype.clearLayer = clearLayerSpy;
  MockCanvasManager.prototype.resizeAll = resizeAllSpy;

  return {
    CanvasManager: MockCanvasManager,
  };
});

// Export the spies for test access
(globalThis as any).__canvasManagerSpies = {
  createLayer: createLayerSpy,
  getContext: getContextSpy,
  resizeLayer: resizeLayerSpy,
  clearLayer: clearLayerSpy,
  resizeAll: resizeAllSpy,
};

// Enhance HTMLCanvasElementMock to include missing properties and methods
class EnhancedHTMLCanvasElementMock extends HTMLCanvasElementMock {
  captureStream = vi.fn();
  toBlob = vi.fn();
  toDataURL = vi.fn(() => 'data:image/png;base64,');
  transferControlToOffscreen = vi.fn();
  // Explicitly type getContext to match the base class
  getContext: (type: string) => import("canvas").CanvasRenderingContext2D | null = vi.fn((type: string) => {
    if (type === '2d') {
      // Create a base context from the canvas package and extend it with the required properties
      const baseCanvas = createCanvas(this.width, this.height);
      const ctx = baseCanvas.getContext('2d') as import("canvas").CanvasRenderingContext2D & {
        addPage?: Function;
        beginTag?: Function;
        endTag?: Function;
        patternQuality?: string;
        textDrawingMode?: string;
        antialias?: string;
        quality?: string;
        currentTransform?: DOMMatrix;
      };

      ctx.addPage = vi.fn();
      ctx.beginTag = vi.fn();
      ctx.endTag = vi.fn();
      ctx.patternQuality = 'good';
      ctx.textDrawingMode = 'path';
      ctx.antialias = 'default';
      ctx.quality = 'best';
      ctx.currentTransform = new DOMMatrix();
      ctx.measureText = vi.fn(() => ({
        width: 0,
        actualBoundingBoxAscent: 0,
        actualBoundingBoxDescent: 0,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 0,
        fontBoundingBoxAscent: 0,
        fontBoundingBoxDescent: 0,
        alphabeticBaseline: 0,
        hangingBaseline: 0,
        ideographicBaseline: 0,
        emHeightAscent: 0,
        emHeightDescent: 0,
      }));

      return ctx;
    }
    return null;
  });
}

// Mock DOMMatrix for the test environment
class MockDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  is2D = true;
  m11 = 1;
  m12 = 0;
  m21 = 0;
  m22 = 1;
  m41 = 0;
  m42 = 0;

  multiply() {
    return this;
  }

  invertSelf() {
    return this;
  }

  translate() {
    return this;
  }

  scale() {
    return this;
  }

  rotate() {
    return this;
  }

  setMatrixValue() {
    return this;
  }
}

Object.defineProperty(globalThis, 'DOMMatrix', {
  value: MockDOMMatrix,
  configurable: true,
});
