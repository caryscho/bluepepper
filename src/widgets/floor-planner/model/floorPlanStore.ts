import { useState, useCallback } from 'react'
import { FloorPlan, Room, FloorPlanWall } from '@/types/floor-plan'

const DEFAULT_FLOOR_PLAN: FloorPlan = {
  id: 'floor-plan-1',
  name: 'New Floor Plan',
  metadata: {
    scale: 1,
    unit: 'meter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  rooms: [],
  walls: [],
}

export function useFloorPlanStore() {
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(DEFAULT_FLOOR_PLAN)

  const addRoom = useCallback((room: Room) => {
    setFloorPlan((prev) => ({
      ...prev,
      rooms: [...prev.rooms, room],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const addWall = useCallback((wall: FloorPlanWall) => {
    setFloorPlan((prev) => ({
      ...prev,
      walls: [...prev.walls, wall],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const deleteRoom = useCallback((roomId: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const deleteWall = useCallback((wallId: string) => {
    setFloorPlan((prev) => ({
      ...prev,
      walls: prev.walls.filter((w) => w.id !== wallId),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const updateFloorPlan = useCallback((updated: FloorPlan) => {
    setFloorPlan({
      ...updated,
      metadata: {
        ...updated.metadata,
        updatedAt: new Date().toISOString(),
      },
    })
  }, [])

  const resetFloorPlan = useCallback(() => {
    setFloorPlan(DEFAULT_FLOOR_PLAN)
  }, [])

  const exportToJSON = useCallback((): string => {
    return JSON.stringify(floorPlan, null, 2)
  }, [floorPlan])

  const importFromJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as FloorPlan
      setFloorPlan({
        ...parsed,
        metadata: {
          ...parsed.metadata,
          updatedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Failed to import floor plan:', error)
      throw error
    }
  }, [])

  return {
    floorPlan,
    addRoom,
    addWall,
    deleteRoom,
    deleteWall,
    updateFloorPlan,
    resetFloorPlan,
    exportToJSON,
    importFromJSON,
  }
}
