import { useState, useCallback, useRef } from 'react'
import { EditorMode } from '@/types/floor-plan'
import { useFloorPlanStore } from './floorPlanStore'
import {
  Point,
  normalizeRectangle,
  distance,
  snapToPoint,
  polygonBounds,
  findPathBetweenPoints,
  SNAP_THRESHOLD,
} from '@/shared/utils/geometry'

export function useFloorPlanEditor() {
  const [mode, setMode] = useState<EditorMode>('select')
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectedElementType, setSelectedElementType] = useState<'room' | 'wall' | null>(null)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStartPoint, setDrawStartPoint] = useState<Point | null>(null)
  const [drawCurrentPoint, setDrawCurrentPoint] = useState<Point | null>(null)

  // Wall chain state (for continuous wall drawing)
  const [wallChain, setWallChain] = useState<Point[]>([])
  const [snapTarget, setSnapTarget] = useState<Point | null>(null)

  const store = useFloorPlanStore()
  const {
    floorPlan,
    addRoom,
    addWalls,
    deleteRoom,
    deleteWall,
    exportToJSON,
    importFromJSON,
  } = store

  const nextIdRef = useRef({ room: 1, wall: 1 })

  // ── Helpers ──

  const getAllEndpoints = useCallback((): Point[] => {
    const points: Point[] = []
    for (const wall of floorPlan.walls) {
      points.push({ x: wall.start[0], y: wall.start[1] })
      points.push({ x: wall.end[0], y: wall.end[1] })
    }
    return points
  }, [floorPlan.walls])

  const getWallSegments = useCallback(() => {
    return floorPlan.walls.map((w) => ({
      id: w.id,
      start: { x: w.start[0], y: w.start[1] } as Point,
      end: { x: w.end[0], y: w.end[1] } as Point,
    }))
  }, [floorPlan.walls])

  const resetDrawing = useCallback(() => {
    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
    setWallChain([])
    setSnapTarget(null)
  }, [])

  const createWallsFromChain = useCallback(
    (points: Point[]) => {
      return points.slice(0, -1).map((p, i) => ({
        id: `wall-${nextIdRef.current.wall++}`,
        start: [p.x, p.y] as [number, number],
        end: [points[i + 1].x, points[i + 1].y] as [number, number],
        height: 2.5,
        thickness: 0.2,
        type: 'interior' as const,
      }))
    },
    []
  )

  // ── Handlers ──

  const handleModeChange = useCallback((newMode: EditorMode) => {
    setMode(newMode)
    setSelectedElementId(null)
    setSelectedElementType(null)
    setIsDrawing(false)
    setDrawStartPoint(null)
    setDrawCurrentPoint(null)
    setWallChain([])
    setSnapTarget(null)
  }, [])

  const handleStartDrawing = useCallback(
    (point: Point) => {
      if (mode === 'draw-room') {
        setIsDrawing(true)
        setDrawStartPoint(point)
        setDrawCurrentPoint(point)
      } else if (mode === 'draw-wall') {
        if (!isDrawing) {
          // First click: start wall chain
          // Snap to nearest existing endpoint if close
          const endpoints = getAllEndpoints()
          const snapped = snapToPoint(point, endpoints, SNAP_THRESHOLD)
          const startPoint = snapped || point

          setWallChain([startPoint])
          setIsDrawing(true)
          setDrawStartPoint(startPoint)
          setDrawCurrentPoint(startPoint)
          setSnapTarget(null)
        }
        // Subsequent clicks handled by handleFinishDrawing
      }
    },
    [mode, isDrawing, getAllEndpoints]
  )

  const handleUpdateDrawing = useCallback(
    (point: Point, shiftKey: boolean = false) => {
      if (!isDrawing) return

      if (mode === 'draw-wall' && wallChain.length > 0) {
        const lastPoint = wallChain[wallChain.length - 1]

        // Shift constraint (horizontal/vertical)
        let targetPoint = point
        if (shiftKey) {
          const dx = Math.abs(point.x - lastPoint.x)
          const dy = Math.abs(point.y - lastPoint.y)
          targetPoint =
            dx > dy
              ? { x: point.x, y: lastPoint.y }
              : { x: lastPoint.x, y: point.y }
        }

        // Snap priority: chain start (close) > existing endpoints
        if (
          wallChain.length >= 3 &&
          distance(targetPoint, wallChain[0]) < SNAP_THRESHOLD
        ) {
          setSnapTarget(wallChain[0])
          setDrawCurrentPoint(wallChain[0])
        } else {
          const endpoints = getAllEndpoints()
          const snapped = snapToPoint(targetPoint, endpoints, SNAP_THRESHOLD)
          setSnapTarget(snapped)
          setDrawCurrentPoint(snapped || targetPoint)
        }

        setDrawStartPoint(lastPoint)
      } else if (mode === 'draw-room') {
        if (drawStartPoint) {
          setDrawCurrentPoint(point)
        }
      }
    },
    [isDrawing, mode, wallChain, drawStartPoint, getAllEndpoints]
  )

  const handleFinishDrawing = useCallback(
    (endPoint?: Point, shiftKey?: boolean) => {
      // ── Room drawing (drag) ──
      if (mode === 'draw-room') {
        const finalEndPoint = endPoint || drawCurrentPoint
        if (!isDrawing || !drawStartPoint || !finalEndPoint) return

        const rect = normalizeRectangle({
          x: drawStartPoint.x,
          y: drawStartPoint.y,
          width: finalEndPoint.x - drawStartPoint.x,
          height: finalEndPoint.y - drawStartPoint.y,
        })

        if (rect.width < 0.5 || rect.height < 0.5) {
          resetDrawing()
          return
        }

        addRoom({
          id: `room-${nextIdRef.current.room++}`,
          type: 'rectangle' as const,
          bounds: rect,
        })
        resetDrawing()
        return
      }

      // ── Wall chain drawing (click-click-click) ──
      if (mode === 'draw-wall') {
        if (wallChain.length === 0) return

        const rawPoint = endPoint || drawCurrentPoint
        if (!rawPoint) return

        const lastPoint = wallChain[wallChain.length - 1]

        // Compute final point: snap > shift > raw
        let finalPoint = rawPoint

        // 1) Close snap (chain start)
        const isCloseSnap =
          wallChain.length >= 3 &&
          distance(rawPoint, wallChain[0]) < SNAP_THRESHOLD
        if (isCloseSnap) {
          finalPoint = wallChain[0]
        } else {
          // 2) Existing endpoint snap
          const endpoints = getAllEndpoints()
          const snapped = snapToPoint(rawPoint, endpoints, SNAP_THRESHOLD)
          if (snapped) {
            finalPoint = snapped
          } else if (shiftKey) {
            // 3) Shift constraint
            const dx = Math.abs(rawPoint.x - lastPoint.x)
            const dy = Math.abs(rawPoint.y - lastPoint.y)
            finalPoint =
              dx > dy
                ? { x: rawPoint.x, y: lastPoint.y }
                : { x: lastPoint.x, y: rawPoint.y }
          }
        }

        // Min segment length (allow closing with short final segment)
        if (distance(lastPoint, finalPoint) < 0.3 && !isCloseSnap) {
          return
        }

        // ① Self-close: clicked near chain start
        if (isCloseSnap) {
          // Create walls for all chain segments + closing segment
          const chainLoop = [...wallChain, wallChain[0]]
          const walls = createWallsFromChain(chainLoop)
          addWalls(walls)

          // Create polygon room
          addRoom({
            id: `room-${nextIdRef.current.room++}`,
            type: 'polygon',
            bounds: polygonBounds(wallChain),
            vertices: wallChain.map((p) => ({ x: p.x, y: p.y })),
          })

          resetDrawing()
          return
        }

        // ② Cycle detection: snapped to existing endpoint → check path back to chain start
        const existingEndpoints = getAllEndpoints()
        const isOnExisting = snapToPoint(finalPoint, existingEndpoints, SNAP_THRESHOLD)
        if (isOnExisting) {
          const segments = getWallSegments()
          const cyclePath = findPathBetweenPoints(
            finalPoint,
            wallChain[0],
            segments,
            SNAP_THRESHOLD
          )

          if (cyclePath && cyclePath.length >= 2) {
            // Create walls for the chain (including the new segment to finalPoint)
            const newChain = [...wallChain, finalPoint]
            const walls = createWallsFromChain(newChain)
            addWalls(walls)

            // Room vertices = chain + cycle path intermediates
            const roomVertices = [
              ...wallChain,
              finalPoint,
              ...cyclePath.slice(1, -1),
            ]
            addRoom({
              id: `room-${nextIdRef.current.room++}`,
              type: 'polygon',
              bounds: polygonBounds(roomVertices),
              vertices: roomVertices.map((p) => ({ x: p.x, y: p.y })),
            })

            resetDrawing()
            return
          }
        }

        // ③ Continue chain (add point, keep drawing)
        setWallChain((prev) => [...prev, finalPoint])
        setDrawStartPoint(finalPoint)
        // isDrawing stays true — chain continues
      }
    },
    [
      mode,
      isDrawing,
      drawStartPoint,
      drawCurrentPoint,
      wallChain,
      getAllEndpoints,
      getWallSegments,
      createWallsFromChain,
      addRoom,
      addWalls,
      resetDrawing,
    ]
  )

  const handleCancelDrawing = useCallback(() => {
    resetDrawing()
  }, [resetDrawing])

  const handleSelectElement = useCallback(
    (id: string, type: 'room' | 'wall') => {
      if (mode === 'select') {
        setSelectedElementId(id)
        setSelectedElementType(type)
      }
    },
    [mode]
  )

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
    wallChain,
    snapTarget,
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
