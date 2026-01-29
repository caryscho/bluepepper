import { useEffect } from 'react'

interface DrawRoomHandlerProps {
  isActive: boolean
  isDrawing: boolean
  onStartDrawing: (point: { x: number; y: number }) => void
  onUpdateDrawing: (point: { x: number; y: number }) => void
  onFinishDrawing: () => void
  onCancelDrawing: () => void
  getWorldPoint: (event: MouseEvent | React.MouseEvent) => { x: number; y: number } | null
  svgElement: SVGSVGElement | null
}

export default function DrawRoomHandler({
  isActive,
  isDrawing,
  onStartDrawing,
  onUpdateDrawing,
  onFinishDrawing,
  onCancelDrawing,
  getWorldPoint,
  svgElement,
}: DrawRoomHandlerProps) {
  useEffect(() => {
    if (!isActive || !svgElement) return

    const handleMouseDown = (e: MouseEvent) => {
      if (!isDrawing && svgElement) {
        const target = e.target as Element
        // Only start drawing if clicking on SVG background (not on existing rooms/walls)
        // Allow clicking on grid lines or empty SVG space
        if (
          target === svgElement ||
          target.tagName === 'svg' ||
          target.tagName === 'line' ||
          target.closest('#grid')
        ) {
          e.preventDefault()
          e.stopPropagation()
          const point = getWorldPoint(e)
          if (point) {
            onStartDrawing(point)
          }
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing) {
        e.preventDefault()
        const point = getWorldPoint(e)
        if (point) {
          onUpdateDrawing(point)
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (isDrawing) {
        e.preventDefault()
        e.stopPropagation()
        onFinishDrawing()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        onCancelDrawing()
      }
    }

    svgElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      svgElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, isDrawing, onStartDrawing, onUpdateDrawing, onFinishDrawing, onCancelDrawing, getWorldPoint, svgElement])

  return null
}
