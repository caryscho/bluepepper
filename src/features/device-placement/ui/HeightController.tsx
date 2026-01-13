import { useState, useRef } from "react";
import { Html } from "@react-three/drei";

interface HeightControllerProps {
    devicePosition: { x: number; y: number; z: number };
    onHeightChange: (newY: number) => void;
}

export default function HeightController({
    devicePosition,
    onHeightChange,
}: HeightControllerProps) {
    const [isDragging, setIsDragging] = useState(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        startYRef.current = e.clientY;
        startHeightRef.current = devicePosition.y;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        e.stopPropagation();

        // 마우스 Y 변화량 → 3D 높이 변화량
        const deltaY = (startYRef.current - e.clientY) * 0.01; // 민감도 조절
        const newY = Math.max(0, startHeightRef.current + deltaY);
        onHeightChange(newY);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    return (
        <group
            position={[devicePosition.x, devicePosition.y, devicePosition.z]}
        >
            <Html center distanceFactor={10} position={[0, 0, 0]}>
                <div
                    className="flex flex-col justify-center items-center w-8 h-8 text-gray-400 bg-white rounded-full border-2 border-gray-200 shadow-xl select-none overflow1-hidden"
                    style={{
                        cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    {Array.from({ length: 2 }, (_, index) => (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onHeightChange(devicePosition.y + 0.5);
                            }}
                            className="p-0 text-sm leading-none transition-colors cursor"
                        >
                            {index % 2 === 0 ? "▲" : "▼"}
                        </span>
                    ))}
                </div>
            </Html>
        </group>
    );
}
