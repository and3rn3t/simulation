import { Organism } from '../../core/organism';
import { ErrorHandler, ErrorSeverity, SimulationError } from '../system/errorHandler';

/**
 * Represents a rectangular boundary for spatial partitioning
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents a point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * QuadTree node for spatial partitioning optimization
 * Used for efficient collision detection and spatial queries
 */
export class QuadTree {
  private boundary: Rectangle;
  private capacity: number;
  private organisms: Organism[] = [];
  private divided: boolean = false;

  // Child quadrants
  private northeast?: QuadTree | undefined;
  private northwest?: QuadTree | undefined;
  private southeast?: QuadTree | undefined;
  private southwest?: QuadTree | undefined;

  /**
   * Creates a new QuadTree node
   * @param boundary - The rectangular boundary this node covers
   * @param capacity - Maximum number of organisms before subdivision
   */
  constructor(boundary: Rectangle, capacity: number = 10) {
    try {
      if (!boundary || boundary.width <= 0 || boundary.height <= 0) {
        throw new SimulationError(
          'Invalid boundary provided for QuadTree',
          'QUADTREE_INVALID_BOUNDARY'
        );
      }

      if (capacity < 1) {
        throw new SimulationError(
          'QuadTree capacity must be at least 1',
          'QUADTREE_INVALID_CAPACITY'
        );
      }

      this.boundary = boundary;
      this.capacity = capacity;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to create QuadTree', 'QUADTREE_CREATION_ERROR'),
        ErrorSeverity.HIGH,
        'QuadTree constructor'
      );
      throw error;
    }
  }

  /**
   * Inserts an organism into the quadtree
   * @param organism - The organism to insert
   * @returns True if insertion was successful, false otherwise
   */
  insert(organism: Organism): boolean {
    try {
      if (!this.contains(organism)) {
        return false;
      }

      if (this.organisms.length < this.capacity) { this.organisms.push(organism);
        return true;
        }

      if (!this.divided) { this.subdivide();
        }

      return (
        this.northeast!.insert(organism) ||
        this.northwest!.insert(organism) ||
        this.southeast!.insert(organism) ||
        this.southwest!.insert(organism)
      );
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to insert organism into QuadTree', 'QUADTREE_INSERT_ERROR'),
        ErrorSeverity.MEDIUM,
        'QuadTree insert'
      );
      return false;
    }
  }

  /**
   * Subdivides the current node into four quadrants
   */
  private subdivide(): void {
    try {
      const x = this.boundary.x;
      const y = this.boundary.y;
      const w = this.boundary.width / 2;
      const h = this.boundary.height / 2;

      this.northeast = new QuadTree({ x: x + w, y, width: w, height: h }, this.capacity);
      this.northwest = new QuadTree({ x, y, width: w, height: h }, this.capacity);
      this.southeast = new QuadTree({ x: x + w, y: y + h, width: w, height: h }, this.capacity);
      this.southwest = new QuadTree({ x, y: y + h, width: w, height: h }, this.capacity);

      this.divided = true;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to subdivide QuadTree', 'QUADTREE_SUBDIVIDE_ERROR'),
        ErrorSeverity.HIGH,
        'QuadTree subdivide'
      );
      throw error;
    }
  }

  /**
   * Checks if an organism is within this node's boundary
   * @param organism - The organism to check
   * @returns True if the organism is within the boundary, false otherwise
   */
  private contains(organism: Organism): boolean {
    return (
      organism.x >= this.boundary.x &&
      organism.x < this.boundary.x + this.boundary.width &&
      organism.y >= this.boundary.y &&
      organism.y < this.boundary.y + this.boundary.height
    );
  }

  /**
   * Checks if a rectangle intersects with this node's boundary
   * @param range - The rectangle to check
   * @returns True if the rectangle intersects, false otherwise
   */
  private intersects(range: Rectangle): boolean {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    );
  }

  /**
   * Queries the quadtree for organisms within a specified range
   * @param range - The rectangular range to query
   * @param found - Array to store found organisms
   * @returns Array of organisms within the range
   */
  query(range: Rectangle, found: Organism[] = []): Organism[] {
    try {
      if (!this.intersects(range)) {
        return found;
      }

      // Check organisms in this node
      for (const organism of this.organisms) {
        if (this.pointInRectangle(organism, range)) {
          found.push(organism);
        }
      }

      // Check children if divided
      if (this.divided) {
        this.northeast!.query(range, found);
        this.northwest!.query(range, found);
        this.southeast!.query(range, found);
        this.southwest!.query(range, found);
      }

      return found;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to query QuadTree', 'QUADTREE_QUERY_ERROR'),
        ErrorSeverity.MEDIUM,
        'QuadTree query'
      );
      return found;
    }
  }

  /**
   * Checks if a point (organism) is within a rectangle
   * @param organism - The organism to check
   * @param range - The rectangular range
   * @returns True if the organism is within the range, false otherwise
   */
  private pointInRectangle(organism: Organism, range: Rectangle): boolean {
    return (
      organism.x >= range.x &&
      organism.x < range.x + range.width &&
      organism.y >= range.y &&
      organism.y < range.y + range.height
    );
  }

  /**
   * Finds organisms within a circular radius of a point
   * @param center - The center point
   * @param radius - The search radius
   * @returns Array of organisms within the radius
   */
  queryRadius(center: Point, radius: number): Organism[] {
    try {
      const range: Rectangle = {
        x: center.x - radius,
        y: center.y - radius,
        width: radius * 2,
        height: radius * 2,
      };

      const candidates = this.query(range);
      const result: Organism[] = [];

      for (const organism of candidates) {
        const dx = organism.x - center.x;
        const dy = organism.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) { result.push(organism);
          }
      }

      return result;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError(
              'Failed to query QuadTree by radius',
              'QUADTREE_RADIUS_QUERY_ERROR'
            ),
        ErrorSeverity.MEDIUM,
        'QuadTree queryRadius'
      );
      return [];
    }
  }

  /**
   * Clears all organisms from this node and its children
   */
  clear(): void {
    try {
      this.organisms = [];
      this.divided = false;
      this.northeast = undefined;
      this.northwest = undefined;
      this.southeast = undefined;
      this.southwest = undefined;
    } catch { /* handled */ }
  }

  /**
   * Gets the total number of organisms in this node and all children
   * @returns Total organism count
   */
  getOrganismCount(): number {
    let count = this.organisms.length;

    if (this.divided) {
      count += this.northeast!.getOrganismCount();
      count += this.northwest!.getOrganismCount();
      count += this.southeast!.getOrganismCount();
      count += this.southwest!.getOrganismCount();
    }

    return count;
  }

  /**
   * Gets the total number of nodes in this quadtree and all children
   * @returns Total node count
   */
  getNodeCount(): number {
    let count = 1; // This node

    if (this.divided) {
      count += this.northeast!.getNodeCount();
      count += this.northwest!.getNodeCount();
      count += this.southeast!.getNodeCount();
      count += this.southwest!.getNodeCount();
    }

    return count;
  }

  /**
   * Gets debug information about the quadtree structure
   * @returns Object containing debug information
   */
  getDebugInfo(): any {
    return {
      boundary: this.boundary,
      organismCount: this.organisms.length,
      divided: this.divided,
      totalOrganisms: this.getOrganismCount(),
      totalNodes: this.getNodeCount(),
      children: this.divided
        ? {
            northeast: this.northeast!.getDebugInfo(),
            northwest: this.northwest!.getDebugInfo(),
            southeast: this.southeast!.getDebugInfo(),
            southwest: this.southwest!.getDebugInfo(),
          }
        : null,
    };
  }
}

/**
 * Spatial partitioning manager for efficient collision detection and spatial queries
 */
export class SpatialPartitioningManager {
  private quadTree: QuadTree;
  private canvasWidth: number;
  private canvasHeight: number;
  private capacity: number;
  private lastRebuildTime: number = 0;
  private rebuildTimes: number[] = [];
  private totalRebuildOperations: number = 0;

  /**
   * Creates a new spatial partitioning manager
   * @param canvasWidth - Width of the canvas
   * @param canvasHeight - Height of the canvas
   * @param capacity - Maximum organisms per quadtree node
   */
  constructor(canvasWidth: number, canvasHeight: number, capacity: number = 10) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.capacity = capacity;

    this.quadTree = new QuadTree(
      { x: 0, y: 0, width: canvasWidth, height: canvasHeight },
      capacity
    );
  }

  /**
   * Rebuilds the quadtree with current organisms
   * @param organisms - Array of organisms to partition
   */
  rebuild(organisms: Organism[]): void {
    try {
      const startTime = performance.now();

      this.quadTree.clear();
      this.quadTree = new QuadTree(
        { x: 0, y: 0, width: this.canvasWidth, height: this.canvasHeight },
        this.capacity
      );

      for (const organism of organisms) {
        this.quadTree.insert(organism);
      }

      // Track performance metrics
      const rebuildTime = performance.now() - startTime;
      this.lastRebuildTime = rebuildTime;
      this.rebuildTimes.push(rebuildTime);
      this.totalRebuildOperations++;

      // Keep only the last 100 rebuild times for average calculation
      if (this.rebuildTimes.length > 100) { this.rebuildTimes.shift();
        }
    } catch { /* handled */ }
  }

  /**
   * Finds organisms within a radius of a given organism
   * @param organism - The center organism
   * @param radius - The search radius
   * @returns Array of nearby organisms
   */
  findNearbyOrganisms(organism: Organism, radius: number): Organism[] {
    return this.quadTree.queryRadius({ x: organism.x, y: organism.y }, radius);
  }

  /**
   * Finds organisms within a rectangular area
   * @param range - The rectangular area to search
   * @returns Array of organisms in the area
   */
  findOrganismsInArea(range: Rectangle): Organism[] {
    return this.quadTree.query(range);
  }

  /**
   * Gets debug information about the spatial partitioning structure
   * @returns Object containing debug information
   */
  getDebugInfo(): any {
    const quadTreeDebug = this.quadTree.getDebugInfo();
    const averageRebuildTime =
      this.rebuildTimes.length > 0
        ? this.rebuildTimes.reduce((sum, time) => sum + time, 0) / this.rebuildTimes.length
        : 0;

    return {
      canvasSize: { width: this.canvasWidth, height: this.canvasHeight },
      capacity: this.capacity,
      totalNodes: quadTreeDebug.totalNodes,
      totalElements: quadTreeDebug.totalOrganisms,
      lastRebuildTime: this.lastRebuildTime,
      averageRebuildTime,
      totalRebuildOperations: this.totalRebuildOperations,
      quadTree: quadTreeDebug,
    };
  }
}
