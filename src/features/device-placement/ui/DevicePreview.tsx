import * as THREE from "three";
import { DeviceType } from "../../../types/device";

interface DevicePreviewProps {
  deviceType: DeviceType | null;
  position: THREE.Vector3 | null;
  rotation: THREE.Euler | null;
  isValid: boolean; // 배치 가능한 위치인지
}

function DevicePreview({
  deviceType,
  position,
  rotation,
  isValid,
}: DevicePreviewProps) {
  if (!deviceType || !position || !rotation) return null;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* 미리보기 오브젝트 */}
      <mesh>
        <boxGeometry
          args={[
            deviceType.size.width,
            deviceType.size.height,
            deviceType.size.depth,
          ]}
        />
        <meshStandardMaterial
          color={isValid ? deviceType.color : "#ff0000"}
          opacity={0.9}
          transparent
          wireframe={!isValid}
          emissive={deviceType.color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* 배치 가능 여부 표시 (원형 인디케이터) */}
      <mesh position={[0, deviceType.size.height / 2 + 0.15, 0]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial
          color={isValid ? "#00ff00" : "#ff0000"}
          opacity={1}
          transparent
        />
      </mesh>
      {/* 화살표 포인터 추가 */}
      <mesh position={[0, deviceType.size.height / 2 + 0.3, 0]}>
        <coneGeometry args={[0.08, 0.15, 8]} />
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

