import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Organism } from '../../../src/core/organism'
import type { OrganismType } from '../../../src/models/organismTypes'

describe('Organism', () => {
  let mockOrganismType: OrganismType
  let organism: Organism

  beforeEach(() => {
    mockOrganismType = {
      name: 'Test Organism',
      color: '#ff0000',
      size: 5,
      growthRate: 10,
      deathRate: 5,
      maxAge: 100,
      description: 'A test organism'
    }
    organism = new Organism(100, 100, mockOrganismType)
  })

  describe('constructor', () => {
    it('should create an organism with correct initial values', () => {
      expect(organism.x).toBe(100)
      expect(organism.y).toBe(100)
      expect(organism.age).toBe(0)
      expect(organism.type).toBe(mockOrganismType)
      expect(organism.reproduced).toBe(false)
    })
  })

  describe('update', () => {
    it('should increase age based on delta time', () => {
      const deltaTime = 10
      organism.update(deltaTime, 800, 600)
      expect(organism.age).toBe(deltaTime)
    })

    it('should move organism randomly within bounds', () => {
      const initialX = organism.x
      const initialY = organism.y
      
      // Mock Math.random to return consistent values
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      
      organism.update(1, 800, 600)
      
      // Position should stay the same when Math.random returns 0.5
      expect(organism.x).toBe(initialX)
      expect(organism.y).toBe(initialY)
    })

    it('should keep organism within canvas bounds', () => {
      const canvasWidth = 800
      const canvasHeight = 600
      const size = mockOrganismType.size

      // Test left boundary
      organism.x = -10
      organism.update(1, canvasWidth, canvasHeight)
      expect(organism.x).toBe(size)

      // Test right boundary
      organism.x = canvasWidth + 10
      organism.update(1, canvasWidth, canvasHeight)
      expect(organism.x).toBe(canvasWidth - size)

      // Test top boundary
      organism.y = -10
      organism.update(1, canvasWidth, canvasHeight)
      expect(organism.y).toBe(size)

      // Test bottom boundary
      organism.y = canvasHeight + 10
      organism.update(1, canvasWidth, canvasHeight)
      expect(organism.y).toBe(canvasHeight - size)
    })
  })

  describe('canReproduce', () => {
    it('should return false if organism is too young', () => {
      organism.age = 10
      expect(organism.canReproduce()).toBe(false)
    })

    it('should return false if organism has already reproduced', () => {
      organism.age = 30
      organism.reproduced = true
      expect(organism.canReproduce()).toBe(false)
    })

    it('should return true if conditions are met and random chance succeeds', () => {
      organism.age = 30
      organism.reproduced = false
      
      // Mock Math.random to return a value that passes the growth rate check
      vi.spyOn(Math, 'random').mockReturnValue(0.05) // 5% chance, growth rate is 10%
      
      expect(organism.canReproduce()).toBe(true)
    })

    it('should return false if random chance fails', () => {
      organism.age = 30
      organism.reproduced = false
      
      // Mock Math.random to return a value that fails the growth rate check
      vi.spyOn(Math, 'random').mockReturnValue(0.15) // 15% chance, growth rate is 10%
      
      expect(organism.canReproduce()).toBe(false)
    })
  })

  describe('shouldDie', () => {
    it('should return true if organism exceeds max age', () => {
      organism.age = mockOrganismType.maxAge + 1
      expect(organism.shouldDie()).toBe(true)
    })

    it('should return true if random death chance occurs', () => {
      organism.age = 50
      
      // Mock Math.random to return a value that triggers death
      vi.spyOn(Math, 'random').mockReturnValue(0.004) // 0.4% chance, death rate is 5 * 0.001 = 0.5%
      
      expect(organism.shouldDie()).toBe(true)
    })

    it('should return false if organism is young and random chance fails', () => {
      organism.age = 50
      
      // Mock Math.random to return a value that avoids death
      vi.spyOn(Math, 'random').mockReturnValue(0.006) // 0.6% chance, death rate is 5 * 0.001 = 0.5%
      
      expect(organism.shouldDie()).toBe(false)
    })
  })

  describe('reproduce', () => {
    it('should mark organism as reproduced', () => {
      organism.reproduce()
      expect(organism.reproduced).toBe(true)
    })

    it('should create a new organism near the parent', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      
      const child = organism.reproduce()
      
      expect(child).toBeInstanceOf(Organism)
      expect(child.x).toBe(organism.x) // When Math.random returns 0.5, offset is 0
      expect(child.y).toBe(organism.y)
      expect(child.type).toBe(mockOrganismType)
      expect(child.age).toBe(0)
      expect(child.reproduced).toBe(false)
    })

    it('should create offspring with random offset', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.8)
      
      const child = organism.reproduce()
      
      // When Math.random returns 0.8, offset is (0.8 - 0.5) * 20 = 6
      expect(child.x).toBe(organism.x + 6)
      expect(child.y).toBe(organism.y + 6)
    })
  })

  describe('draw', () => {
    it('should draw organism with correct properties', () => {
      const mockCtx = {
        fillStyle: '',
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn()
      } as any

      organism.draw(mockCtx)

      expect(mockCtx.fillStyle).toBe(mockOrganismType.color)
      expect(mockCtx.beginPath).toHaveBeenCalled()
      expect(mockCtx.arc).toHaveBeenCalledWith(
        organism.x,
        organism.y,
        mockOrganismType.size,
        0,
        Math.PI * 2
      )
      expect(mockCtx.fill).toHaveBeenCalled()
    })
  })
})
