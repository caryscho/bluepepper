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
  selectedElementId: string | null
  selectedElementType: 'room' | 'wall' | null
  onStartDrawing: (point: Point) => void
  onUpdateDrawing: (point: Point, shiftKey?: boolean) => void
  onFinishDrawing: (endPoint?: Point) => void
  onCancelDrawing: () => void
  onSelectElement: (id: string, type: 'room' | 'wall') => void
}

export default function FloorPlanEditor({
  mode,
  floorPlan,
  isDrawing,
  drawStartPoint,
  drawCurrentPoint,
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
        // Start drawing if NOT clicking on existing rooms or walls
        const isRoom = target.tagName === 'rect' && target.closest('#rooms')
        const isWall = target.tagName === 'line' && target.closest('#walls')
        
        if (!isRoom && !isWall) {
          e.preventDefault()
          e.stopPropagation()
          const point = getWorldPoint(e)
          
          if (point) {
            if (mode === 'draw-wall' && isDrawing && drawStartPoint) {
              // 두 번째 클릭: wall 완성
              console.log('Second click - finishing wall at:', point, 'start:', drawStartPoint)
              // Shift 키가 눌려있으면 직선으로 조정
              let finalPoint = point
              if (e.shiftKey) {
                const dx = Math.abs(point.x - drawStartPoint.x)
                const dy = Math.abs(point.y - drawStartPoint.y)
                if (dx > dy) {
                  // 수평선
                  finalPoint = { x: point.x, y: drawStartPoint.y }
                } else {
                  // 수직선
                  finalPoint = { x: drawStartPoint.x, y: point.y }
                }
              }
              // 끝점을 직접 전달하여 wall 생성
              onFinishDrawing(finalPoint)
            } else {
              // 첫 번째 클릭 또는 room 드래그 시작
              console.log('First click - starting drawing at:', point)
              onStartDrawing(point)
            }
          }
        }
        return
      }
      
      // Handle select mode - panning
      if (mode === 'select' && e.button === 0 && !isDrawing) {
        // Don't pan if clicking on room or wall
        if (target.tagName === 'rect' || (target.tagName === 'line' && !target.closest('#grid'))) {
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
    [mode, isDrawing, drawStartPoint, getWorldPoint, onStartDrawing, onUpdateDrawing, onFinishDrawing]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Handle drawing modes - update drawing preview
      if ((mode === 'draw-room' || mode === 'draw-wall') && isDrawing) {
        const point = getWorldPoint(e)
        if (point) {
          // Shift 키 상태 전달
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
      // Handle drawing modes
      if (mode === 'draw-room') {
        // Room은 드래그 방식이므로 mouseUp에서 완성
        if (isDrawing) {
          e.preventDefault()
          e.stopPropagation()
          onFinishDrawing()
        }
        return
      }
      // Wall은 클릭-클릭 방식이므로 mouseDown에서 처리
      
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

  // Debug: log mode changes
  useEffect(() => {
    console.log('FloorPlanEditor mode changed to:', mode)
  }, [mode])

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
        onMouseLeave={(e) => {
          if ((mode === 'draw-room' || mode === 'draw-wall') && isDrawing) {
            onFinishDrawing()
          } else {
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
        {isDrawing && drawStartPoint && drawCurrentPoint && (
          <g id="drawing-preview">
            {mode === 'draw-room' && (
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
            {mode === 'draw-wall' && (
              <>
                {/* 가이드라인 (점선) */}
                <line
                  x1={drawStartPoint.x}
                  y1={drawStartPoint.y}
                  x2={drawCurrentPoint.x}
                  y2={drawCurrentPoint.y}
                  stroke="#2563eb"
                  strokeWidth={0.3}
                  strokeDasharray="0.2 0.2"
                  opacity={0.6}
                />
                {/* 시작점 마커 */}
                <circle
                  cx={drawStartPoint.x}
                  cy={drawStartPoint.y}
                  r={0.3}
                  fill="#2563eb"
                  opacity={0.8}
                />
                {/* 현재점 마커 */}
                <circle
                  cx={drawCurrentPoint.x}
                  cy={drawCurrentPoint.y}
                  r={0.3}
                  fill="#3b82f6"
                  opacity={0.8}
                />
              </>
            )}
          </g>
        )}
      </svg>

    </div>
  )
}
