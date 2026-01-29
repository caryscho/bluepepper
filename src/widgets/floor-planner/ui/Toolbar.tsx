import { Square, Move, Minus } from 'lucide-react'
import { EditorMode } from '@/types/floor-plan'

interface ToolbarProps {
  mode: EditorMode
  onModeChange: (mode: EditorMode) => void
  onExport: () => void
  onImport: () => void
}

export default function Toolbar({
  mode,
  onModeChange,
  onExport,
  onImport,
}: ToolbarProps) {
  return (
    <div className="flex absolute top-4 left-4 z-20 flex-col gap-2 p-2 bg-white rounded-lg shadow-lg">
      <button
        onClick={() => onModeChange('select')}
        className={`p-2 rounded transition-colors ${
          mode === 'select'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title="Select/Move"
      >
        <Move className="w-5 h-5" />
      </button>
      <button
        onClick={() => onModeChange('draw-room')}
        className={`p-2 rounded transition-colors ${
          mode === 'draw-room'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title="Draw Room"
      >
        <Square className="w-5 h-5" />
        
      </button>
      <button
        onClick={() => onModeChange('draw-wall')}
        className={`p-2 rounded transition-colors ${
          mode === 'draw-wall'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        title="Draw Wall"
      >
        <Minus className="w-5 h-5" />
      </button>
      <div className="my-1 border-t" />
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 rounded transition-colors"
        title="Export JSON"
      >
        Export
      </button>
      <button
        onClick={onImport}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 rounded transition-colors"
        title="Import JSON"
      >
        Import
      </button>
    </div>
  )
}
