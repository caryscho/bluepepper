import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DeviceType } from "../../../types/device";
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
    };
    deviceType: DeviceType;
    onClick?: (device: InstalledDeviceProps["device"]) => void;
}

export default function InstalledDevice({
    device,
    deviceType,
    onClick,
}: InstalledDeviceProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const { raycaster, camera, gl } = useThree();
    const [isHovered, setIsHovered] = useState(false);

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

    // 호버 시 색상 변경 및 커서 스타일 변경
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.set(
                isHovered ? "#FF0000" : deviceType.color
            );
        }
        // 호버 시 커서를 pointer로 변경
        if (gl.domElement) {
            gl.domElement.style.cursor = isHovered ? "pointer" : "default";
        }
    }, [isHovered, deviceType.color, gl]);

    return (
        <mesh
            ref={meshRef}
            position={[device.position.x, device.position.y, device.position.z]}
            rotation={[
                device.rotation?.x || 0,
                device.rotation?.y || 0,
                device.rotation?.z || 0,
            ]}
            scale={isHovered ? 1.5 : 1.2} // 기본 크기 1.2배, 호버 시 1.5배
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
                color={deviceType.color}
            />
        </mesh>
    );
}

