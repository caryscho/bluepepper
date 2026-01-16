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
    const boxArgs = useMemo(
        () =>
            [deviceSize.width, deviceSize.height, deviceSize.depth] as [
                number,
                number,
                number
            ],
        [deviceSize.width, deviceSize.height, deviceSize.depth]
    );

    if (!position || !rotation) return null;

    const deviceGeometry = new THREE.SphereGeometry(0.5, 24, 24);

    return (
        <group position={position} rotation={rotation}>
            <mesh geometry={deviceGeometry}>
                {/* <boxGeometry args={boxArgs} /> */}
                <meshStandardMaterial
                    color={isValid ? "#61C10E" : "#ff0000"}
                    opacity={0.8}
                    transparent
                    wireframe={!isValid}
                    // emissive="#FF9800"
                    // emissiveIntensity={0.1}
                />
            </mesh>
        </group>
    );
});

export default DevicePreview;
