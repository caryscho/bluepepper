// Warehouse structure types for 3D visualization

export interface WarehouseDimensions {
  length: number // X-axis (미터)
  width: number  // Z-axis (미터)
  height: number // Y-axis (미터)
}

export interface Column {
  id: string
  position: {
    x: number
    z: number
  }
  size: {
    width: number
    depth: number
  }
  height: number
}

export interface Wall {
  id: string
  start: [number, number] // [x, z]
  end: [number, number]   // [x, z]
  height: number
  thickness: number
  type: 'exterior' | 'interior'
}

export interface Door {
  id: string
  wallId: string
  position: number // 벽을 따라간 위치 (0-1)
  width: number
  height: number
}

export interface Window {
  id: string
  wallId: string
  position: number // 벽을 따라간 위치 (0-1)
  width: number
  height: number
  yPosition: number // 바닥에서 높이
}

export interface Shelf {
  id: string
  position: {
    x: number
    z: number
  }
  size: {
    length: number
    width: number
    height: number
  }
  tiers: number // 선반 단 수
  orientation: 'north' | 'south' | 'east' | 'west'
}

export interface Light {
  id: string
  position: {
    x: number
    y: number // 천장 높이
    z: number
  }
  type: 'ceiling' | 'wall'
  intensity?: number
}

export interface WarehouseStructure {
  dimensions: WarehouseDimensions
  columns: Column[]
  walls: Wall[]
  doors: Door[]
  windows: Window[]
  shelves: Shelf[]
  lights: Light[]
}

// 도면에서 파싱한 원시 데이터
export interface BlueprintData {
  // 메타데이터
  scale: number // 예: 1cm = 1m면 scale은 100
  unit: 'meter' | 'feet' | 'inch'
  
  // 구조 데이터
  structure: WarehouseStructure
  
  // 추가 정보
  notes?: string
  lastUpdated?: Date
}

