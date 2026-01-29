import { useState } from 'react'
import FloorPlanEditor from './FloorPlanEditor'
import FloorPlan3DViewer from './FloorPlan3DViewer'
import Toolbar from './Toolbar'
import { useFloorPlanEditor } from '../model/useFloorPlanEditor'

export default function FloorPlanner() {
  const [is3D, setIs3D] = useState(false)
  const {
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
  } = useFloorPlanEditor()

  const handleExport = () => {
    const json = exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `floor-plan-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string
            importFromJSON(json)
          } catch (error) {
            alert('Failed to import floor plan')
            console.error(error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Delete key handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete') {
      handleDeleteSelected()
    }
  }

  return (
    <div
      className="relative w-full h-full"
      style={{ height: 'calc(100vh - 56px)' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      { !is3D && (
        <Toolbar
          mode={mode}
          onModeChange={handleModeChange}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}


      {/* 2D/3D Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setIs3D(!is3D)}
          className="px-4 py-2 text-gray-500 bg-white rounded-lg shadow-lg transition-colors hover:bg-gray-50"
        >
          {is3D ? ' Build' : '3D View'}
        </button>
      </div>

      {is3D ? (
        <FloorPlan3DViewer floorPlan={floorPlan} />
      ) : (
        <FloorPlanEditor
          mode={mode}
          floorPlan={floorPlan}
          isDrawing={isDrawing}
          drawStartPoint={drawStartPoint}
          drawCurrentPoint={drawCurrentPoint}
          selectedElementId={selectedElementId}
          selectedElementType={selectedElementType}
          onStartDrawing={handleStartDrawing}
          onUpdateDrawing={handleUpdateDrawing}
          onFinishDrawing={handleFinishDrawing}
          onCancelDrawing={handleCancelDrawing}
          onSelectElement={handleSelectElement}
        />
      )}
    </div>
  )
}
