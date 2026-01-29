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
    console.log('handleStartDrawing called with point:', point, 'mode:', mode, 'isDrawing:', isDrawing)
    if (mode === 'draw-room') {
      // Room은 드래그 방식 유지
      console.log('Setting drawing state to true for room')
      setIsDrawing(true)
      setDrawStartPoint(point)
      setDrawCurrentPoint(point)
    } else if (mode === 'draw-wall') {
      // Wall은 클릭-클릭 방식 - 첫 번째 클릭만 처리
      if (!isDrawing) {
        // 첫 번째 클릭: 시작점 설정
        console.log('First click - setting start point for wall:', point)
        setIsDrawing(true)
        setDrawStartPoint(point)
        setDrawCurrentPoint(point)
      }
      // 두 번째 클릭은 handleMouseDown에서 직접 처리
    }
  }, [mode, isDrawing])

  const handleUpdateDrawing = useCallback((point: Point, shiftKey: boolean = false) => {
    if (isDrawing && drawStartPoint) {
      if (shiftKey && mode === 'draw-wall') {
        // Shift 키가 눌려있으면 직선으로 (수평 또는 수직)
        const dx = Math.abs(point.x - drawStartPoint.x)
        const dy = Math.abs(point.y - drawStartPoint.y)
        
        if (dx > dy) {
          // 수평선: y 좌표를 시작점과 동일하게
          setDrawCurrentPoint({ x: point.x, y: drawStartPoint.y })
        } else {
          // 수직선: x 좌표를 시작점과 동일하게
          setDrawCurrentPoint({ x: drawStartPoint.x, y: point.y })
        }
      } else {
        setDrawCurrentPoint(point)
      }
    }
  }, [isDrawing, drawStartPoint, mode])

  const handleFinishDrawing = useCallback((endPoint?: Point) => {
    // endPoint가 제공되면 사용, 아니면 drawCurrentPoint 사용
    const finalEndPoint = endPoint || drawCurrentPoint
    console.log('handleFinishDrawing called', { isDrawing, drawStartPoint, drawCurrentPoint, endPoint, finalEndPoint, mode })
    
    if (!isDrawing || !drawStartPoint || !finalEndPoint) {
      console.log('Early return - missing state')
      return
    }

    if (mode === 'draw-room') {
      const rect = normalizeRectangle({
        x: drawStartPoint.x,
        y: drawStartPoint.y,
        width: finalEndPoint.x - drawStartPoint.x,
        height: finalEndPoint.y - drawStartPoint.y,
      })

      // Minimum size check
      if (rect.width < 0.5 || rect.height < 0.5) {
        console.log('Room too small, canceling')
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
      console.log('Adding room:', room)
      addRoom(room)
    } else if (mode === 'draw-wall') {
      const dx = finalEndPoint.x - drawStartPoint.x
      const dy = finalEndPoint.y - drawStartPoint.y
      const length = Math.sqrt(dx * dx + dy * dy)

      console.log('Wall calculation:', { dx, dy, length, start: drawStartPoint, end: finalEndPoint })

      // Minimum length check
      if (length < 0.5) {
        console.log('Wall too short, canceling')
        setIsDrawing(false)
        setDrawStartPoint(null)
        setDrawCurrentPoint(null)
        return
      }

      const wall = {
        id: `wall-${nextIdRef.current.wall++}`,
        start: [drawStartPoint.x, drawStartPoint.y] as [number, number],
        end: [finalEndPoint.x, finalEndPoint.y] as [number, number],
        height: 2.5, // Default height
        thickness: 0.2, // Default thickness
        type: 'interior' as const,
      }
      console.log('Adding wall:', wall)
      addWall(wall)
    }

    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
    console.log('Drawing finished, state reset')
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
