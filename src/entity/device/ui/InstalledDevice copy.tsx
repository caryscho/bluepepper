import { useThree } from "@react-three/fiber";
import { Edges, Html } from "@react-three/drei";
import * as THREE from "three";
import { DeviceType } from "@/types/device";
import { useEffect, useRef, useState } from "react";

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
    deviceType: DeviceType;
    onClick?: (device: InstalledDeviceProps["device"]) => void;
    onDeviceHover?: (device: InstalledDeviceProps["device"], isHovered: boolean) => void;
    isHovered?: boolean;
}

export default function InstalledDevice({
    device,
    deviceType,
    onClick,
    onDeviceHover,
    isHovered: isHoveredProp,
}: InstalledDeviceProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const { raycaster, camera, gl } = useThree();
    const [isHovered, setIsHovered] = useState(false);
    
    // prop으로 받은 isHovered와 내부 상태를 병합
    const isCurrentlyHovered = isHoveredProp ?? isHovered;

    // 상태별 색상 결정 함수
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "#00FF00";
            case "inactive":
                return "#FF0000";
            case "error":
                return "#FF0000";
            default:
                return "#000000";
        }
    };

    // 호버 감지
    useEffect(() => {
        if (!meshRef.current) return;

        const handleMouseMove = (event: MouseEvent) => {
            // 마우스 위치를 정규화된 좌표로 변환
            const rect = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Raycasting으로 호버된 오브젝트 확인
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(meshRef.current!);

            setIsHovered(intersects.length > 0);
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, [raycaster, camera, gl]);

    // 클릭 이벤트
    useEffect(() => {
        if (!onClick || !meshRef.current) return;
        setIsHovered(false);

        const handleClick = (event: MouseEvent) => {
            // 마우스 위치를 정규화된 좌표로 변환
            const rect = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Raycasting으로 클릭된 오브젝트 확인
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(meshRef.current!);

            if (intersects.length > 0) {
                onClick(device);
            }
        };

        gl.domElement.addEventListener("click", handleClick);
        return () => {
            gl.domElement.removeEventListener("click", handleClick);
        };
    }, [onClick, device, raycaster, camera, gl]);

    // 호버 시 커서 스타일 변경 및 이벤트 전파
    useEffect(() => {
        if (gl.domElement) {
            gl.domElement.style.cursor = isHovered ? "pointer" : "default";
        }
        // 상위로 호버 이벤트 전파
        if (onDeviceHover) {
            onDeviceHover(device, isHovered);
        }
    }, [isHovered, gl, device, onDeviceHover]);


    return (
        <mesh
            ref={meshRef}
            position={[device.position.x, device.position.y, device.position.z]}
            rotation={[
                device.rotation?.x || 0,
                device.rotation?.y || 0,
                device.rotation?.z || 0,
            ]}
            scale={isCurrentlyHovered ? 1.3 : 1.2} // 기본 크기 1.2배, 호버 시 1.3배
        >
            <boxGeometry
                args={[
                    deviceType.size.width,
                    deviceType.size.height,
                    deviceType.size.depth,
                ]}
            />
            <meshStandardMaterial
                ref={materialRef}
                color={getStatusColor(device.status)}
            />
            {/* 호버 시 파란색 보더 표시 */}
            {isCurrentlyHovered && (
                <Edges
                    scale={1.01}
                    threshold={15}
                    color="#0066FF"
                />
            )}
            {/* 호버 시 Tooltip 표시 */}
            {isCurrentlyHovered && (
                <Html
                    position={[deviceType.size.width / 2 + 0.2, deviceType.size.height / 2 + 0.1, 0]}
                    distanceFactor={10}
                    style={{
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                    center
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
