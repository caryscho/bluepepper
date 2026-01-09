import { ThermometerSun, Thermometer } from "lucide-react";

interface HeatmapProps {
    isHeatmap: boolean;
    onToggleHeatmap: () => void;
}

export default function Heatmap({ isHeatmap, onToggleHeatmap }: HeatmapProps) {
    return (
        <button className="hover:bg-blue-200" onClick={onToggleHeatmap}>
            {isHeatmap ? <ThermometerSun className="w-4 h-4" /> : <Thermometer className="w-4 h-4" />}
        </button>
    );
}