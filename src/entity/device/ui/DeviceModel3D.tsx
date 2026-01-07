import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DeviceType } from "@/types/device";

interface DeviceModel3DProps {
    deviceType: DeviceType;
    autoRotate?: boolean;
    rotationSpeed?: number;
}

/**
 * 재사용 가능한 디바이스 3D 모델 컴포넌트
 * - DeviceType의 사이즈, 색상을 적용
 * - Y축 회전 애니메이션 지원
 * - 앞면에 라벨 표시
 */
export default function DeviceModel3D({
    deviceType,
    autoRotate = true,
    rotationSpeed = 0.5,
}: DeviceModel3DProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Y축 회전 애니메이션
    useFrame((state, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += rotationSpeed * delta;
        }
    });

    const { width, height, depth } = deviceType.size;

    return (
        <group ref={groupRef}>
            {/* 메인 디바이스 박스 */}
            <mesh ref={meshRef}>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color={deviceType.color} />
            </mesh>
        </group>
    );
}
