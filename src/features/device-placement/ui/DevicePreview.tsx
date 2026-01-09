import * as THREE from "three";
import { DEVICE_SIZE } from "../constants";

interface DevicePreviewProps {
  position: THREE.Vector3 | null;
  rotation: THREE.Euler | null;
  isValid: boolean; // 배치 가능한 위치인지
  deviceSize?: { width: number; height: number; depth: number }; // 커스텀 크기
}

function DevicePreview({
  position,
  rotation,
  isValid,
  deviceSize = DEVICE_SIZE, // 기본값은 표준 크기
}: DevicePreviewProps) {
  if (!position || !rotation) return null;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* 미리보기 오브젝트 */}
      <mesh>
        <boxGeometry
          args={[
            deviceSize.width,
            deviceSize.height,
            deviceSize.depth,
          ]}
        />
        <meshStandardMaterial
          color={isValid ? "#FF9800" : "#ff0000"}
          opacity={0.9}
          transparent
          wireframe={!isValid}
          emissive="#FF9800"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* 배치 가능 여부 표시 (원형 인디케이터) - 디바이스 크기에 비례 */}
      <mesh position={[0, deviceSize.height / 2 + deviceSize.height * 0.2, 0]}>
        <ringGeometry args={[deviceSize.width * 0.2, deviceSize.width * 0.3, 32]} />
        <meshBasicMaterial
          color={isValid ? "#00ff00" : "#ff0000"}
          opacity={1}
          transparent
        />
      </mesh>
      {/* 화살표 포인터 추가 - 디바이스 크기에 비례 */}
      <mesh position={[0, deviceSize.height / 2 + deviceSize.height * 0.4, 0]}>
        <coneGeometry args={[deviceSize.width * 0.16, deviceSize.height * 0.2, 8]} />
        <meshBasicMaterial
          color={isValid ? "#00ff00" : "#ff0000"}
          opacity={1}
          transparent
        />
      </mesh>
    </group>
  );
}

export default DevicePreview;

