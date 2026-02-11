// Floor Plan types for 2D editor and 3D visualization

export interface Room {
  id: string
  type: 'rectangle' | 'polygon'
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  vertices?: Array<{ x: number; y: number }>
}

export interface FloorPlanWall {
  id: string
  start: [number, number]  // [x, y]
  end: [number, number]   // [x, y]
  height: number
  thickness: number
  type: 'exterior' | 'interior'
}

export interface FloorPlanMetadata {
  scale: number
  unit: 'meter' | 'feet'
  createdAt: string
  updatedAt: string
}

export interface FloorPlan {
  id: string
  name: string
  metadata: FloorPlanMetadata
  rooms: Room[]
  walls: FloorPlanWall[]
}

export type EditorMode = 'select' | 'draw-room' | 'draw-wall'
