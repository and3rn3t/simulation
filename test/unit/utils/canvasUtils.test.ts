import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CanvasUtils, CANVAS_CONFIG } from '../../../src/utils/canvas/canvasUtils'

describe('CanvasUtils', () => {
  let mockCanvas: HTMLCanvasElement
  let mockCtx: CanvasRenderingContext2D
  let canvasUtils: CanvasUtils

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      globalAlpha: 1
    } as any

    mockCanvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => mockCtx),
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      }))
    } as any

    canvasUtils = new CanvasUtils(mockCanvas)
  })

  describe('constructor', () => {
    it('should initialize with canvas and context', () => {
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })
  })

  describe('clear', () => {
    it('should clear canvas with background color', () => {
      canvasUtils.clear()

      expect(mockCtx.fillStyle).toBe(CANVAS_CONFIG.BACKGROUND_COLOR)
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600)
    })
  })

  describe('drawGrid', () => {
    it('should draw grid with correct properties', () => {
      canvasUtils.drawGrid()

      expect(mockCtx.strokeStyle).toBe(CANVAS_CONFIG.GRID_COLOR)
      expect(mockCtx.lineWidth).toBe(CANVAS_CONFIG.GRID_LINE_WIDTH)
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.stroke).toHaveBeenCalled()
    })

    it('should draw vertical and horizontal lines', () => {
      canvasUtils.drawGrid()

      const expectedVerticalLines = Math.floor(800 / CANVAS_CONFIG.GRID_SIZE) + 1
      const expectedHorizontalLines = Math.floor(600 / CANVAS_CONFIG.GRID_SIZE) + 1

      // Check that moveTo and lineTo were called for grid lines
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(expectedVerticalLines + expectedHorizontalLines)
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(expectedVerticalLines + expectedHorizontalLines)
    })
  })

  describe('drawPlacementInstructions', () => {
    it('should draw instructions with correct text and positioning', () => {
      canvasUtils.drawPlacementInstructions()

      expect(mockCtx.fillText).toHaveBeenCalledWith(
        'Click on the canvas to place organisms',
        400,
        280
      )
      expect(mockCtx.fillText).toHaveBeenCalledWith(
        'Click "Start" when ready to begin the simulation',
        400,
        320
      )
    })

    it('should set correct font properties', () => {
      canvasUtils.drawPlacementInstructions()

      expect(mockCtx.font).toBe('14px Arial')
      expect(mockCtx.textAlign).toBe('center')
      expect(mockCtx.fillStyle).toBe(CANVAS_CONFIG.INSTRUCTION_SUB_COLOR)
    })

    it('should clear and draw grid before instructions', () => {
      const clearSpy = vi.spyOn(canvasUtils, 'clear')
      const drawGridSpy = vi.spyOn(canvasUtils, 'drawGrid')

      canvasUtils.drawPlacementInstructions()

      expect(clearSpy).toHaveBeenCalled()
      expect(drawGridSpy).toHaveBeenCalled()
    })
  })

  describe('drawPreviewOrganism', () => {
    it('should draw organism with reduced opacity', () => {
      const x = 100
      const y = 100
      const color = '#ff0000'
      const size = 5

      canvasUtils.drawPreviewOrganism(x, y, color, size)

      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.globalAlpha).toBe(CANVAS_CONFIG.PREVIEW_ALPHA)
      expect(mockCtx.fillStyle).toBe(color)
      expect(mockCtx.arc).toHaveBeenCalledWith(x, y, size, 0, Math.PI * 2)
      expect(mockCtx.fill).toHaveBeenCalled()
      expect(mockCtx.restore).toHaveBeenCalled()
    })
  })

  describe('getMouseCoordinates', () => {
    it('should return correct mouse coordinates relative to canvas', () => {
      const mockEvent = {
        clientX: 150,
        clientY: 100
      } as MouseEvent

      const coordinates = canvasUtils.getMouseCoordinates(mockEvent)

      expect(mockCanvas.getBoundingClientRect).toHaveBeenCalled()
      expect(coordinates).toEqual({
        x: 150,
        y: 100
      })
    })

    it('should account for canvas offset', () => {
      ;(mockCanvas.getBoundingClientRect as any) = vi.fn(() => ({
        left: 50,
        top: 25,
        width: 800,
        height: 600,
        right: 850,
        bottom: 625,
        x: 50,
        y: 25,
        toJSON: vi.fn()
      }))

      const mockEvent = {
        clientX: 150,
        clientY: 100
      } as MouseEvent

      const coordinates = canvasUtils.getMouseCoordinates(mockEvent)

      expect(coordinates).toEqual({
        x: 100, // 150 - 50
        y: 75   // 100 - 25
      })
    })
  })
})

describe('CANVAS_CONFIG', () => {
  it('should have expected configuration values', () => {
    expect(CANVAS_CONFIG.BACKGROUND_COLOR).toBe('#1a1a1a')
    expect(CANVAS_CONFIG.GRID_COLOR).toBe('#333')
    expect(CANVAS_CONFIG.GRID_SIZE).toBe(50)
    expect(CANVAS_CONFIG.GRID_LINE_WIDTH).toBe(0.5)
    expect(CANVAS_CONFIG.INSTRUCTION_COLOR).toBe('rgba(255, 255, 255, 0.8)')
    expect(CANVAS_CONFIG.INSTRUCTION_SUB_COLOR).toBe('rgba(255, 255, 255, 0.6)')
    expect(CANVAS_CONFIG.PREVIEW_ALPHA).toBe(0.5)
  })
})
