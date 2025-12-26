// Utility functions for parsing blueprint data

import type { BlueprintData, WarehouseStructure } from '../types/warehouse'

/**
 * JSON 파일에서 warehouse 구조 로드
 */
export async function loadWarehouseFromJSON(url: string): Promise<BlueprintData> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load warehouse data: ${response.statusText}`)
  }
  const data: BlueprintData = await response.json()
  return data
}

/**
 * CSV에서 warehouse 구조 파싱 (예시)
 * CSV 형식: type,x,y,z,width,depth,height
 */
export function parseWarehouseFromCSV(csvText: string): WarehouseStructure {
  // 간단한 CSV 파서 예시
  const lines = csvText.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',')
  
  // 실제 구현은 CSV 형식에 따라 달라짐
  // 여기서는 기본 구조만 반환
  return {
    dimensions: { length: 0, width: 0, height: 0 },
    columns: [],
    walls: [],
    doors: [],
    windows: [],
    shelves: [],
    lights: []
  }
}

/**
 * 도면 스케일 변환
 * 예: 도면에서 1cm = 실제 1m면, scale = 100
 */
export function convertScale(
  value: number,
  fromScale: number,
  toScale: number = 1
): number {
  return (value / fromScale) * toScale
}

/**
 * 좌표계 변환
 * 도면 좌표를 3D 공간 좌표로 변환
 */
export function convertCoordinates(
  x: number,
  y: number,
  originX: number = 0,
  originY: number = 0
): [number, number] {
  return [x - originX, y - originY]
}

