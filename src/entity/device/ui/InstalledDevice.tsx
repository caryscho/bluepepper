import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { DEVICE_SIZE } from "@/features/device-placement/constants";

// 모든 디바이스가 공유하는 Geometry (성냥갑 형태 = 박스)
const deviceGeometry = new THREE.BoxGeometry(1, 1, 1);

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
    deviceSize?: { width: number; height: number; depth: number }; // 커스텀 크기
}

export default function InstalledDevice({
    device,
    onClick,
    onDeviceHover,
    isHovered: isHoveredProp,
    deviceSize = DEVICE_SIZE, // 기본값은 표준 크기
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

    const handleClick = () => {
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


    // 호버에 따른 스케일 계산
    const baseScale = isCurrentlyHovered ? 1.3 : 1.2;
    const finalScale: [number, number, number] = [
        deviceSize.width * baseScale,
        deviceSize.height * baseScale,
        deviceSize.depth * baseScale,
    ];

    return (
        <mesh
            ref={meshRef}
            geometry={deviceGeometry}
            material={getStatusMaterial(device.status)}
            position={[device.position.x, device.position.y, device.position.z]}
            rotation={[
                device.rotation?.x || 0,
                device.rotation?.y || 0,
                device.rotation?.z || 0,
            ]}
            scale={finalScale}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
        >
            {/* 호버 시 파란색 보더 표시 - scale 제거하여 호버 영역 안정화 */}
            {isCurrentlyHovered && (
                <Edges
                    threshold={15}
                    color="#0066FF"
                />
            )}
            {/* 호버 시 Tooltip 표시 - 디바이스 오른쪽 위 모서리 기준 */}
            {isCurrentlyHovered && (
                <Html
                    position={[
                        deviceSize.width * baseScale / 2 + 0.1,  // 오른쪽 끝 + 여유
                        deviceSize.height * baseScale / 2 + 0.1,  // 위쪽 끝 + 여유
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
                            온도: {device?.temperature !== undefined ? `${device?.temperature}°C` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                            습도: {device?.humidity !== undefined ? `${device?.humidity}%` : "N/A"}
                        </div>
                    </div>
                </Html>
            )}
        </mesh>
    );
}
