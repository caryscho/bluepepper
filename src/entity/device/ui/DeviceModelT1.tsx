import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { DeviceType } from "@/types/device";

interface DeviceModel3DProps {
    deviceType: DeviceType;
    diveSize?: {
        width: number;
        height: number;
        depth: number;
    };
    autoRotate?: boolean;
    rotationSpeed?: number;
}

/**
 * 재사용 가능한 디바이스 3D 모델 컴포넌트
 * - DeviceType의 사이즈, 색상을 적용
 * - Y축 회전 애니메이션 지원
 * - 실제 디바이스 구조 반영 (T1 기기 기준)
 */
export default function DeviceModel3D({
    deviceType,
    diveSize,
    autoRotate = true,
    rotationSpeed = 0.5,
}: DeviceModel3DProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Y축 회전 애니메이션
    useFrame((_, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += rotationSpeed * delta;
        }
    });

    const { width, height, depth } = diveSize || deviceType.size;

    // 둥근 모서리 반경
    const radius = Math.min(width, height, depth) * 0.4;

    // 플라스틱 재질 설정
    const plasticMaterial = {
        color: "#ffffff", // 흰색
        roughness: 0.2,
        metalness: 0.1,
    };

    // 패널 재질 설정
    const panelMaterial = {
        color: "#e5e7eb", // 회색 패널
        roughness: 0.5,
        metalness: 0.05,
    };

    // 패널 패딩 계산 (앞면에서 약간 들어간 느낌)
    const panelMargin = Math.min(width) * 0.14; // 8% 패딩
    const panelWidth = width - panelMargin * 2;
    const panelHeight = height - panelMargin * 2;
    const panelRadius = Math.min(panelWidth, panelHeight) * 0.15; // 패널 둥근 모서리 반경

    // 둥근 모서리를 가진 평면 geometry 생성
    const roundedPanelGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        const w = panelWidth / 2;
        const h = panelHeight / 2;
        const r = panelRadius;

        // 둥근 사각형 path 생성
        shape.moveTo(-w + r, -h);
        shape.lineTo(w - r, -h);
        shape.quadraticCurveTo(w, -h, w, -h + r);
        shape.lineTo(w, h - r);
        shape.quadraticCurveTo(w, h, w - r, h);
        shape.lineTo(-w + r, h);
        shape.quadraticCurveTo(-w, h, -w, h - r);
        shape.lineTo(-w, -h + r);
        shape.quadraticCurveTo(-w, -h, -w + r, -h);
        shape.closePath();

        return new THREE.ShapeGeometry(shape);
    }, [panelWidth, panelHeight, panelRadius]);

    return (
        <group ref={groupRef}>
            {/* 메인 흰색 케이스 (둥근 모서리) */}
            <RoundedBox
                args={[width, height, depth]}
                radius={radius}
                smoothness={4}
            >
                <meshStandardMaterial {...plasticMaterial} />
            </RoundedBox>

            {/* 회색 패널 (둥근 모서리 평면) */}
            <mesh
                position={[0, 0, depth / 2 + 0.0001]}
                rotation={[0, 0, 0]}
                renderOrder={1}
                geometry={roundedPanelGeometry}
            >
                <meshStandardMaterial {...panelMaterial} depthWrite={false} />
            </mesh>

            {/* 검은색 화면 (직사각형, 회색 패널 위에 위치) */}
            <mesh
                position={[
                    0,                          // X: 중앙
                    height * 0.2,               // Y: 약간 위 (높이의 20% 위치)
                    depth / 2 + 0.001           // Z: 패널보다 확실히 앞으로
                ]}
                rotation={[0, 0, 0]}
                renderOrder={2}
            >
                <planeGeometry args={[panelWidth * 0.7, panelHeight * 0.4]} />
                <meshStandardMaterial 
                    color="#000000" 
                    depthWrite={false} 
                />
            </mesh>

            {/* 스티커/라벨 (회색 패널 위에 붙인 것처럼) */}
            <mesh
                position={[
                    0,                          // X: 중앙
                    -height * 0.1,              // Y: 아래쪽 (라벨 위치)
                    depth / 2 + 0.001           // Z: 패널보다 확실히 앞으로
                ]}
                rotation={[0, 0, 0]}
                renderOrder={3}
            >
                <planeGeometry args={[panelWidth * 0.8, panelHeight * 0.1]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    depthWrite={false} 
                />
            </mesh>
        </group>
    );
}
