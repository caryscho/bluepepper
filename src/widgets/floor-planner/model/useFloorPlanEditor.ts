import { useState, useCallback, useRef } from 'react'
import { EditorMode } from '@/types/floor-plan'
import { useFloorPlanStore } from './floorPlanStore'
import { Point, normalizeRectangle } from '@/shared/utils/geometry'

export function useFloorPlanEditor() {
  const [mode, setMode] = useState<EditorMode>('select')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectedElementType, setSelectedElementType] = useState<'room' | 'wall' | null>(null)
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStartPoint, setDrawStartPoint] = useState<Point | null>(null)
  const [drawCurrentPoint, setDrawCurrentPoint] = useState<Point | null>(null)

  const store = useFloorPlanStore()
  const {
    floorPlan,
    addRoom,
    addWall,
    deleteRoom,
    deleteWall,
    exportToJSON,
    importFromJSON,
  } = store

  const nextIdRef = useRef({ room: 1, wall: 1 })

  const handleModeChange = useCallback((newMode: EditorMode) => {
    setMode(newMode)
    setSelectedElementId(null)
    setSelectedElementType(null)
    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
  }, [])

  const handleStartDrawing = useCallback((point: Point) => {
    console.log('handleStartDrawing called with point:', point, 'mode:', mode)
    if (mode === 'draw-room' || mode === 'draw-wall') {
      console.log('Setting drawing state to true')
      setIsDrawing(true)
      setDrawStartPoint(point)
      setDrawCurrentPoint(point)
    } else {
      console.log('Mode is not draw-room or draw-wall, mode:', mode)
    }
  }, [mode])

  const handleUpdateDrawing = useCallback((point: Point) => {
    if (isDrawing && drawStartPoint) {
      setDrawCurrentPoint(point)
    }
  }, [isDrawing, drawStartPoint])

  const handleFinishDrawing = useCallback(() => {
    if (!isDrawing || !drawStartPoint || !drawCurrentPoint) return

    if (mode === 'draw-room') {
      const rect = normalizeRectangle({
        x: drawStartPoint.x,
        y: drawStartPoint.y,
        width: drawCurrentPoint.x - drawStartPoint.x,
        height: drawCurrentPoint.y - drawStartPoint.y,
      })

      // Minimum size check
      if (rect.width < 0.5 || rect.height < 0.5) {
        setIsDrawing(false)
        setDrawStartPoint(null)
        setDrawCurrentPoint(null)
        return
      }

      const room = {
        id: `room-${nextIdRef.current.room++}`,
        type: 'rectangle' as const,
        bounds: rect,
      }
      addRoom(room)
    } else if (mode === 'draw-wall') {
      const dx = drawCurrentPoint.x - drawStartPoint.x
      const dy = drawCurrentPoint.y - drawStartPoint.y
      const length = Math.sqrt(dx * dx + dy * dy)

      // Minimum length check
      if (length < 0.5) {
        setIsDrawing(false)
        setDrawStartPoint(null)
        setDrawCurrentPoint(null)
        return
      }

      const wall = {
        id: `wall-${nextIdRef.current.wall++}`,
        start: [drawStartPoint.x, drawStartPoint.y] as [number, number],
        end: [drawCurrentPoint.x, drawCurrentPoint.y] as [number, number],
        height: 2.5, // Default height
        thickness: 0.2, // Default thickness
        type: 'interior' as const,
      }
      addWall(wall)
    }

    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
  }, [isDrawing, drawStartPoint, drawCurrentPoint, mode, addRoom, addWall])

  const handleCancelDrawing = useCallback(() => {
    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
  }, [])

  const handleSelectElement = useCallback((id: string, type: 'room' | 'wall') => {
    if (mode === 'select') {
      setSelectedElementId(id)
      setSelectedElementType(type)
    }
  }, [mode])

  const handleDeleteSelected = useCallback(() => {
    if (selectedElementId && selectedElementType) {
      if (selectedElementType === 'room') {
        deleteRoom(selectedElementId)
      } else {
        deleteWall(selectedElementId)
      }
      setSelectedElementId(null)
      setSelectedElementType(null)
    }
  }, [selectedElementId, selectedElementType, deleteRoom, deleteWall])

  return {
    mode,
    floorPlan,
    isDrawing,
    drawStartPoint,
    drawCurrentPoint,
    selectedElementId,
    selectedElementType,
    handleModeChange,
    handleStartDrawing,
    handleUpdateDrawing,
    handleFinishDrawing,
    handleCancelDrawing,
    handleSelectElement,
    handleDeleteSelected,
    exportToJSON,
    importFromJSON,
  }
}
