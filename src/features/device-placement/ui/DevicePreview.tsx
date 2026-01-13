import * as THREE from "three";
import { memo, useMemo } from "react";
import { DEVICE_SIZE } from "../constants";

interface DevicePreviewProps {
  position: THREE.Vector3 | null;
  rotation: THREE.Euler | null;
  isValid: boolean; // 배치 가능한 위치인지
  deviceSize?: { width: number; height: number; depth: number }; // 커스텀 크기
}

const DevicePreview = memo(function DevicePreview({
  position,
  rotation,
  isValid,
  deviceSize = DEVICE_SIZE, // 기본값은 표준 크기
}: DevicePreviewProps) {
  // boxGeometry args를 메모이제이션
  const boxArgs = useMemo(() => 
    [deviceSize.width, deviceSize.height, deviceSize.depth] as [number, number, number],
    [deviceSize.width, deviceSize.height, deviceSize.depth]
  );

  if (!position || !rotation) return null;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* 미리보기 오브젝트 */}
      <mesh>
        <boxGeometry args={boxArgs} />
        <meshStandardMaterial
          color={isValid ? "#FF9800" : "#ff0000"}
          opacity={0.9}
          transparent
          wireframe={!isValid}
          emissive="#FF9800"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
});

export default DevicePreview;

