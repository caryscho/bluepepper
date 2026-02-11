import { useRef, useState, useCallback, useEffect } from 'react'
import { EditorMode } from '@/types/floor-plan'
import { FloorPlan } from '@/types/floor-plan'
import { Point, screenToWorld } from '@/shared/utils/geometry'

const GRID_SIZE = 1 // meters
const VIEWBOX_SIZE = 100 // meters

interface FloorPlanEditorProps {
  mode: EditorMode
  floorPlan: FloorPlan
  isDrawing: boolean
  drawStartPoint: Point | null
  drawCurrentPoint: Point | null
  wallChain: Point[]
  snapTarget: Point | null
  selectedElementId: string | null
  selectedElementType: 'room' | 'wall' | null
  onStartDrawing: (point: Point) => void
  onUpdateDrawing: (point: Point, shiftKey?: boolean) => void
  onFinishDrawing: (endPoint?: Point, shiftKey?: boolean) => void
  onCancelDrawing: () => void
  onSelectElement: (id: string, type: 'room' | 'wall') => void
}

export default function FloorPlanEditor({
  mode,
  floorPlan,
  isDrawing,
  drawStartPoint,
  drawCurrentPoint,
  wallChain,
  snapTarget,
  selectedElementId,
  selectedElementType,
  onStartDrawing,
  onUpdateDrawing,
  onFinishDrawing,
  onCancelDrawing,
  onSelectElement,
}: FloorPlanEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({
    x: -VIEWBOX_SIZE / 2,
    y: -VIEWBOX_SIZE / 2,
    width: VIEWBOX_SIZE,
    height: VIEWBOX_SIZE,
  })
  const [panStart, setPanStart] = useState<Point | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const getWorldPoint = useCallback(
    (event: MouseEvent | React.MouseEvent): Point | null => {
      if (!svgRef.current) return null
      const rect = svgRef.current.getBoundingClientRect()
      const svgX = event.clientX - rect.left
      const svgY = event.clientY - rect.top
      return screenToWorld(
        svgX,
        svgY,
        viewBox,
        rect.width,
        rect.height
      )
    },
    [viewBox]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      if (!svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
      const newWidth = viewBox.width * zoomFactor
      const newHeight = viewBox.height * zoomFactor

      const worldX = viewBox.x + (mouseX / rect.width) * viewBox.width
      const worldY = viewBox.y + (mouseY / rect.height) * viewBox.height

      setViewBox({
        x: worldX - (mouseX / rect.width) * newWidth,
        y: worldY - (mouseY / rect.height) * newHeight,
        width: newWidth,
        height: newHeight,
      })
    },
    [viewBox]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const target = e.target as Element

      // Handle drawing modes
      if (mode === 'draw-room' || mode === 'draw-wall') {
        // Don't start drawing on existing rooms or walls
        const isRoom = target.tagName === 'rect' && target.closest('#rooms')
        const isWall = target.tagName === 'line' && target.closest('#walls')
        const isPolygonRoom = target.tagName === 'polygon' && target.closest('#rooms')

        if (!isRoom && !isWall && !isPolygonRoom) {
          e.preventDefault()
          e.stopPropagation()
          const point = getWorldPoint(e)

          if (point) {
            if (mode === 'draw-wall' && isDrawing && wallChain.length > 0) {
              // Subsequent click in wall chain: add point / close
              onFinishDrawing(point, e.shiftKey)
            } else {
              // First click: start drawing
              onStartDrawing(point)
            }
          }
        }
        return
      }

      // Handle select mode - panning
      if (mode === 'select' && e.button === 0 && !isDrawing) {
        if (target.tagName === 'rect' || target.tagName === 'polygon' || (target.tagName === 'line' && !target.closest('#grid'))) {
          return
        }
        setIsPanning(true)
        const rect = svgRef.current?.getBoundingClientRect()
        if (rect) {
          setPanStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          })
        }
      }
    },
    [mode, isDrawing, wallChain, getWorldPoint, onStartDrawing, onFinishDrawing]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Handle drawing modes - update drawing preview
      if ((mode === 'draw-room' || mode === 'draw-wall') && isDrawing) {
        const point = getWorldPoint(e)
        if (point) {
          onUpdateDrawing(point, e.shiftKey)
        }
        return
      }

      // Handle panning in select mode
      if (isPanning && panStart && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        const dx = (e.clientX - rect.left - panStart.x) * (viewBox.width / rect.width)
        const dy = (e.clientY - rect.top - panStart.y) * (viewBox.height / rect.height)
        setViewBox((prev) => ({
          ...prev,
          x: prev.x - dx,
          y: prev.y - dy,
        }))
      }
    },
    [mode, isDrawing, isPanning, panStart, viewBox, getWorldPoint, onUpdateDrawing]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Room: drag finish
      if (mode === 'draw-room' && isDrawing) {
        e.preventDefault()
        e.stopPropagation()
        onFinishDrawing()
        return
      }
      // Wall chain: handled by mouseDown clicks, not mouseUp

      // Handle panning
      setIsPanning(false)
      setPanStart(null)
    },
    [mode, isDrawing, onFinishDrawing]
  )

  // ESC key handler for canceling drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        onCancelDrawing()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawing, onCancelDrawing])

  const renderGrid = () => {
    const gridLines = []
    const startX = Math.floor(viewBox.x / GRID_SIZE) * GRID_SIZE
    const startY = Math.floor(viewBox.y / GRID_SIZE) * GRID_SIZE
    const endX = Math.ceil((viewBox.x + viewBox.width) / GRID_SIZE) * GRID_SIZE
    const endY = Math.ceil((viewBox.y + viewBox.height) / GRID_SIZE) * GRID_SIZE

    for (let x = startX; x <= endX; x += GRID_SIZE) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={startY}
          x2={x}
          y2={endY}
          stroke="#e5e7eb"
          strokeWidth={0.05}
        />
      )
    }

    for (let y = startY; y <= endY; y += GRID_SIZE) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={0.05}
        />
      )
    }

    return gridLines
  }

  // Check if snap target is the chain start (close indicator)
  const isCloseSnap =
    snapTarget &&
    wallChain.length >= 3 &&
    Math.abs(snapTarget.x - wallChain[0].x) < 0.01 &&
    Math.abs(snapTarget.y - wallChain[0].y) < 0.01

  return (
    <div
      className="relative w-full h-full bg-gray-50"
      style={{ cursor: mode === 'select' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (mode === 'draw-room' && isDrawing) {
            onFinishDrawing()
          } else if (mode !== 'draw-wall') {
            // Don't cancel wall chain on mouse leave
            setIsPanning(false)
            setPanStart(null)
          }
        }}
      >
        {/* Grid */}
        <g id="grid">{renderGrid()}</g>

        {/* Rooms */}
        <g id="rooms">
          {floorPlan.rooms.map((room) => {
            const isSelected = selectedElementId === room.id && selectedElementType === 'room'

            // Polygon room
            if (room.type === 'polygon' && room.vertices && room.vertices.length > 0) {
              return (
                <polygon
                  key={room.id}
                  points={room.vertices.map((v) => `${v.x},${v.y}`).join(' ')}
                  fill={isSelected ? '#3b82f6' : '#dbeafe'}
                  stroke={isSelected ? '#2563eb' : '#93c5fd'}
                  strokeWidth={isSelected ? 0.2 : 0.1}
                  opacity={0.6}
                  onClick={() => onSelectElement(room.id, 'room')}
                  style={{ cursor: 'pointer' }}
                />
              )
            }

            // Rectangle room
            return (
              <rect
                key={room.id}
                x={room.bounds.x}
                y={room.bounds.y}
                width={room.bounds.width}
                height={room.bounds.height}
                fill={isSelected ? '#3b82f6' : '#dbeafe'}
                stroke={isSelected ? '#2563eb' : '#93c5fd'}
                strokeWidth={isSelected ? 0.2 : 0.1}
                opacity={0.6}
                onClick={() => onSelectElement(room.id, 'room')}
                style={{ cursor: 'pointer' }}
              />
            )
          })}
        </g>

        {/* Walls */}
        <g id="walls">
          {floorPlan.walls.map((wall) => {
            const isSelected = selectedElementId === wall.id && selectedElementType === 'wall'
            return (
              <line
                key={wall.id}
                x1={wall.start[0]}
                y1={wall.start[1]}
                x2={wall.end[0]}
                y2={wall.end[1]}
                stroke={isSelected ? '#2563eb' : '#64748b'}
                strokeWidth={isSelected ? 0.3 : 0.2}
                onClick={() => onSelectElement(wall.id, 'wall')}
                style={{ cursor: 'pointer' }}
              />
            )
          })}
        </g>

        {/* Drawing preview */}
        <g id="drawing-preview">
          {/* Room drag preview */}
          {isDrawing && drawStartPoint && drawCurrentPoint && mode === 'draw-room' && (
            <rect
              x={Math.min(drawStartPoint.x, drawCurrentPoint.x)}
              y={Math.min(drawStartPoint.y, drawCurrentPoint.y)}
              width={Math.abs(drawCurrentPoint.x - drawStartPoint.x)}
              height={Math.abs(drawCurrentPoint.y - drawStartPoint.y)}
              fill="#3b82f6"
              fillOpacity={0.3}
              stroke="#2563eb"
              strokeWidth={0.15}
              strokeDasharray="0.2 0.2"
            />
          )}

          {/* Wall chain preview */}
          {mode === 'draw-wall' && isDrawing && wallChain.length > 0 && (
            <>
              {/* Already committed chain segments (solid preview) */}
              {wallChain.length > 1 &&
                wallChain.slice(0, -1).map((p, i) => (
                  <line
                    key={`chain-seg-${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={wallChain[i + 1].x}
                    y2={wallChain[i + 1].y}
                    stroke="#2563eb"
                    strokeWidth={0.2}
                    opacity={0.8}
                  />
                ))}

              {/* Current segment (from last chain point to cursor) */}
              {drawCurrentPoint && (
                <line
                  x1={wallChain[wallChain.length - 1].x}
                  y1={wallChain[wallChain.length - 1].y}
                  x2={drawCurrentPoint.x}
                  y2={drawCurrentPoint.y}
                  stroke="#2563eb"
                  strokeWidth={0.2}
                  strokeDasharray="0.3 0.15"
                  opacity={0.6}
                />
              )}

              {/* Close preview (dashed line to start when close-snapping) */}
              {isCloseSnap && drawCurrentPoint && (
                <polygon
                  points={[...wallChain, drawCurrentPoint]
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  fill="#22c55e"
                  fillOpacity={0.15}
                  stroke="none"
                />
              )}

              {/* Chain vertex dots */}
              {wallChain.map((p, i) => (
                <circle
                  key={`chain-pt-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={i === 0 ? 0.3 : 0.2}
                  fill={i === 0 ? '#22c55e' : '#2563eb'}
                  opacity={0.8}
                />
              ))}

              {/* Start point close indicator (glowing ring) */}
              {isCloseSnap && (
                <circle
                  cx={wallChain[0].x}
                  cy={wallChain[0].y}
                  r={0.6}
                  fill="#22c55e"
                  fillOpacity={0.25}
                  stroke="#22c55e"
                  strokeWidth={0.1}
                />
              )}

              {/* Snap indicator (existing endpoint) */}
              {snapTarget && !isCloseSnap && (
                <circle
                  cx={snapTarget.x}
                  cy={snapTarget.y}
                  r={0.4}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={0.1}
                />
              )}

              {/* Cursor point */}
              {drawCurrentPoint && !isCloseSnap && (
                <circle
                  cx={drawCurrentPoint.x}
                  cy={drawCurrentPoint.y}
                  r={0.2}
                  fill="#3b82f6"
                  opacity={0.8}
                />
              )}
            </>
          )}
        </g>
      </svg>
    </div>
  )
}
