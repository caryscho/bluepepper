interface DimensionToggleProps {
    is2D: boolean;
    onToggleDimension: () => void;
}
export default function DimensionToggle({
    is2D,
    onToggleDimension,
}: DimensionToggleProps) {
    return <button className="hover:bg-blue-200" onClick={onToggleDimension}>{is2D ? "3D" : "2D"}</button>;
}
