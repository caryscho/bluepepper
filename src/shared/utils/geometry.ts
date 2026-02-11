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
 * Handles preserveAspectRatio="xMidYMid meet" by calculating actual viewport
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewBox: { x: number; y: number; width: number; height: number },
  svgWidth: number,
  svgHeight: number
): Point {
  // Calculate aspect ratios
  const viewBoxAspect = viewBox.width / viewBox.height
  const svgAspect = svgWidth / svgHeight

  // Calculate actual viewport size (considering preserveAspectRatio="meet")
  let actualWidth: number
  let actualHeight: number
  let offsetX = 0
  let offsetY = 0

  if (viewBoxAspect > svgAspect) {
    // ViewBox is wider - fit to width
    actualWidth = svgWidth
    actualHeight = svgWidth / viewBoxAspect
    offsetY = (svgHeight - actualHeight) / 2
  } else {
    // ViewBox is taller - fit to height
    actualHeight = svgHeight
    actualWidth = svgHeight * viewBoxAspect
    offsetX = (svgWidth - actualWidth) / 2
  }

  // Adjust screen coordinates by offset
  const adjustedX = screenX - offsetX
  const adjustedY = screenY - offsetY

  // Convert to world coordinates
  const scaleX = viewBox.width / actualWidth
  const scaleY = viewBox.height / actualHeight

  return {
    x: viewBox.x + adjustedX * scaleX,
    y: viewBox.y + adjustedY * scaleY,
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

// ── Snap & polygon helpers ──

export const SNAP_THRESHOLD = 0.5 // meters

/**
 * Check if two points are within threshold distance
 */
export function pointsEqual(a: Point, b: Point, threshold: number = SNAP_THRESHOLD): boolean {
  return distance(a, b) < threshold
}

/**
 * Find the closest target point within threshold
 */
export function snapToPoint(
  point: Point,
  targets: Point[],
  threshold: number = SNAP_THRESHOLD
): Point | null {
  let closest: Point | null = null
  let minDist = threshold

  for (const target of targets) {
    const d = distance(point, target)
    if (d < minDist) {
      minDist = d
      closest = target
    }
  }
  return closest
}

/**
 * Calculate bounding rectangle of a polygon
 */
export function polygonBounds(vertices: Point[]): Rectangle {
  if (vertices.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  const xs = vertices.map((v) => v.x)
  const ys = vertices.map((v) => v.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  }
}

/**
 * BFS to find a path between two points through wall segments.
 * Returns the path as an array of Points (including from and to), or null if no path exists.
 */
export function findPathBetweenPoints(
  from: Point,
  to: Point,
  segments: Array<{ id: string; start: Point; end: Point }>,
  threshold: number = SNAP_THRESHOLD
): Point[] | null {
  type QueueItem = { point: Point; path: Point[]; usedIds: Set<string> }
  const queue: QueueItem[] = [{ point: from, path: [from], usedIds: new Set() }]
  const pointKey = (p: Point) => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`
  const visited = new Set<string>()
  visited.add(pointKey(from))

  while (queue.length > 0) {
    const { point, path, usedIds } = queue.shift()!

    for (const seg of segments) {
      if (usedIds.has(seg.id)) continue

      let nextPoint: Point | null = null
      if (distance(point, seg.start) < threshold) nextPoint = seg.end
      else if (distance(point, seg.end) < threshold) nextPoint = seg.start

      if (!nextPoint) continue

      // Reached target?
      if (distance(nextPoint, to) < threshold) {
        return [...path, nextPoint]
      }

      const key = pointKey(nextPoint)
      if (visited.has(key)) continue
      visited.add(key)

      const newUsed = new Set(usedIds)
      newUsed.add(seg.id)
      queue.push({ point: nextPoint, path: [...path, nextPoint], usedIds: newUsed })
    }
  }

  return null
}
