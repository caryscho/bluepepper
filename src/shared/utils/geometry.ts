// Geometry utility functions

export interface Point {
  x: number
  y: number
}

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate angle between two points in radians
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

/**
 * Normalize rectangle (ensure width and height are positive)
 */
export function normalizeRectangle(rect: {
  x: number
  y: number
  width: number
  height: number
}): Rectangle {
  const x = Math.min(rect.x, rect.x + rect.width)
  const y = Math.min(rect.y, rect.y + rect.height)
  const width = Math.abs(rect.width)
  const height = Math.abs(rect.height)
  return { x, y, width, height }
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRectangle(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/**
 * Check if two rectangles intersect
 */
export function rectanglesIntersect(
  rect1: Rectangle,
  rect2: Rectangle
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  )
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewBox: { x: number; y: number; width: number; height: number },
  svgWidth: number,
  svgHeight: number
): Point {
  const scaleX = viewBox.width / svgWidth
  const scaleY = viewBox.height / svgHeight
  return {
    x: viewBox.x + screenX * scaleX,
    y: viewBox.y + screenY * scaleY,
  }
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewBox: { x: number; y: number; width: number; height: number },
  svgWidth: number,
  svgHeight: number
): Point {
  const scaleX = svgWidth / viewBox.width
  const scaleY = svgHeight / viewBox.height
  return {
    x: (worldX - viewBox.x) * scaleX,
    y: (worldY - viewBox.y) * scaleY,
  }
}
