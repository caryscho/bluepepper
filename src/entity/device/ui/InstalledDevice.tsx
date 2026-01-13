import { Html } from "@react-three/drei";
import * as THREE from "three";
import { memo, useEffect, useRef, useState, useMemo } from "react";
import { DEVICE_SIZE } from "@/features/device-placement/constants";

// 모든 디바이스가 공유하는 Geometry (구 형태)
const deviceGeometry = new THREE.SphereGeometry(0.5, 32, 32);

// 상태별 Material (색상만 다름)
const activeMaterial = new THREE.MeshStandardMaterial({ color: "#61C10E" });
const inactiveMaterial = new THREE.MeshStandardMaterial({ color: "#FF0000" });
const errorMaterial = new THREE.MeshStandardMaterial({ color: "#FF0000" });
const defaultMaterial = new THREE.MeshStandardMaterial({ color: "#000000" });

interface InstalledDeviceProps {
    device: {
        id: string;
        serialNumber: string;
        position: {
            x: number;
            y: number;
            z: number;
        };
        rotation?: {
            x: number;
            y: number;
            z: number;
        };
        attachedTo?: "floor" | "wall" | "column";
        attachedToId?: string;
        installedAt: Date | string;
        status: "active" | "inactive" | "error";
        temperature?: number;
        humidity?: number;
    };
    onClick?: (device: InstalledDeviceProps["device"]) => void;
    onDeviceHover?: (device: InstalledDeviceProps["device"], isHovered: boolean) => void;
    isHovered?: boolean;
}

const InstalledDevice = memo(function InstalledDevice({
    device,
    onClick,
    onDeviceHover,
    isHovered: isHoveredProp,
}: InstalledDeviceProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    // prop으로 받은 isHovered와 내부 상태를 병합
    const isCurrentlyHovered = isHoveredProp ?? isHovered;

    // 상태별 Material 선택
    const getStatusMaterial = (status: string) => {
        switch (status) {
            case "active":
                return activeMaterial;
            case "inactive":
                return inactiveMaterial;
            case "error":
                return errorMaterial;
            default:
                return defaultMaterial;
        }
    };

    // 호버 이벤트 핸들러 (React Three Fiber 내장 이벤트 사용)
    const handlePointerEnter = () => {
        setIsHovered(true);
        if (onDeviceHover) {
            onDeviceHover(device, true);
        }
    };

    const handlePointerLeave = () => {
        setIsHovered(false);
        if (onDeviceHover) {
            onDeviceHover(device, false);
        }
    };

    const handleClick = (e: any) => {
        console.log("무슨클릭임 1111")
        e.stopPropagation(); // GLB 모델 클릭으로 전파 방지
        if (onClick) {
            onClick(device);
        }
    };

    // 커서 스타일 변경
    useEffect(() => {
        if (meshRef.current) {
            const element = document.body;
            element.style.cursor = isHovered ? "pointer" : "default";
        }
    }, [isHovered]);


    // 호버에 따른 스케일 계산 (구는 균일한 크기) - useMemo로 최적화
    const finalScale = useMemo(() => {
        const baseScale = isCurrentlyHovered ? 1.3 : 1.2;
        const radius = Math.max(DEVICE_SIZE.width, DEVICE_SIZE.height, DEVICE_SIZE.depth);
        return radius * baseScale;
    }, [isCurrentlyHovered]);

    // position을 Vector3로 메모이제이션
    const position = useMemo(() => 
        [device.position.x, device.position.y, device.position.z] as [number, number, number],
        [device.position.x, device.position.y, device.position.z]
    );

    return (
        <mesh
            ref={meshRef}
            geometry={deviceGeometry}
            material={getStatusMaterial(device.status)}
            position={position}
            scale={finalScale}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
            userData={{ type: "installed-device", deviceId: device.id }}
        >
            {/* 호버 시 Tooltip 표시 - 구 오른쪽 위 기준 */}
            {isCurrentlyHovered && (
                <Html
                    position={[
                        finalScale + 0.1,  // 구 반지름 + 여유
                        finalScale + 0.1,  // 구 반지름 + 여유
                        0
                    ]}
                    distanceFactor={10}
                    style={{
                        pointerEvents: "none",
                        userSelect: "none",
                        transform: "translate(0, -100%)", // 왼쪽 위 정렬
                    }}
                >
                    <div className="bg-white border shadow-lg rounded-lg p-2 min-w-[150px]">
                        <div className="text-sm font-semibold text-black">
                            {device.serialNumber}
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                            온도: {device?.temperature !== undefined ? `${device?.temperature.toFixed(1)}°C` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                            습도: {device?.humidity !== undefined ? `${device?.humidity.toFixed(1)}%` : "N/A"}
                        </div>
                    </div>
                </Html>
            )}
        </mesh>
    );
});

export default InstalledDevice;
