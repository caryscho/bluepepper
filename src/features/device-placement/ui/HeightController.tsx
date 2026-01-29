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
  const hasMovedRef = useRef(false); // 실제로 드래그가 발생했는지 추적

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    hasMovedRef.current = false; // 드래그 시작 시 초기화
    startYRef.current = e.clientY;
    startHeightRef.current = devicePosition.y;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();

    // 최소 이동 거리 체크 (클릭만 했을 때의 작은 움직임 무시)
    const deltaY = startYRef.current - e.clientY;
    const absDeltaY = Math.abs(deltaY);

    // 2픽셀 이상 움직였을 때만 드래그로 간주하고 위치 변경
    if (absDeltaY > 2) {
      hasMovedRef.current = true;
      // 마우스 Y 변화량 → 3D 높이 변화량
      const deltaY3D = deltaY * 0.01; // 민감도 조절
      const newY = Math.max(0, startHeightRef.current + deltaY3D);
      onHeightChange(newY);
      // 시작 위치를 업데이트하여 누적 오차 방지
      startYRef.current = e.clientY;
      startHeightRef.current = newY;
    }
    // 2픽셀 이하의 움직임은 무시 (클릭만 했을 때)
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // 드래그가 실제로 발생하지 않았다면 아무것도 하지 않음
    // (handlePointerMove에서 이미 이동이 없으면 onHeightChange를 호출하지 않았으므로)
    setIsDragging(false);
    hasMovedRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <group
      position={[devicePosition.x, devicePosition.y, devicePosition.z]}
    >
      <Html center distanceFactor={8} position={[0, 0, 0]}>
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
              className="p-0 text-sm leading-none"
            >
              {index % 2 === 0 ? "▲" : "▼"}
            </span>
          ))}
        </div>
      </Html>
    </group>
  );
}
