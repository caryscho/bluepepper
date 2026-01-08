interface DimensionToggleProps {
    is2D: boolean;
    isDimensionLoading: boolean;
    onToggleDimension: () => void;
}
export default function DimensionToggle({
    is2D,
    isDimensionLoading,
    onToggleDimension,
}: DimensionToggleProps) {
    return (
        <button 
            className="hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onToggleDimension}
            disabled={isDimensionLoading}
        >
            { is2D ? "3D" : "2D"}
        </button>
    );
}
