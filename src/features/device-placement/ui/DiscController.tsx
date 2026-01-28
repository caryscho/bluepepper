import { useState, useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface DiscControllerProps {
    devicePosition: { x: number; y: number; z: number };
    onPositionChange?: (newPosition: { x: number; y: number; z: number }) => void;
}

export default function DiscController({
    devicePosition,
    onPositionChange,
}: DiscControllerProps) {
    const { camera, raycaster, gl } = useThree();
    const [isDragging, setIsDragging] = useState(false);
    const [dragDirection, setDragDirection] = useState<"north" | "south" | "east" | "west" | "center" | null>(null);
    const startMouseRef = useRef(new THREE.Vector2());
    const startPositionRef = useRef(new THREE.Vector3());

    // 링 Geometry
    const ringGeometry = new THREE.RingGeometry(0.4, 0.8, 32);
    
    // 핸들러 Geometry (삼각형 화살표)
    const handleGeometry = new THREE.ConeGeometry(0.08, 0.15, 3);

    // 마우스 위치를 3D 공간으로 변환
    const getWorldPosition = (mouseX: number, mouseY: number) => {
        const mouse = new THREE.Vector2(
            (mouseX / gl.domElement.clientWidth) * 2 - 1,
            -(mouseY / gl.domElement.clientHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, camera);
        
        // 바닥 평면과 교차점 계산 (Y = devicePosition.y)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -devicePosition.y);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        
        return intersectPoint;
    };

    const handlePointerDown = (e: any, direction?: "north" | "south" | "east" | "west" | "center") => {
        e.stopPropagation();
        setIsDragging(true);
        setDragDirection(direction || "center");
        
        const rect = gl.domElement.getBoundingClientRect();
        startMouseRef.current.set(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        startPositionRef.current.set(
            devicePosition.x,
            devicePosition.y,
            devicePosition.z
        );
    };

    const handlePointerMove = (e: MouseEvent) => {
        if (!isDragging || !onPositionChange) return;

        const rect = gl.domElement.getBoundingClientRect();
        const currentMouse = new THREE.Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );

        const startWorldPos = getWorldPosition(startMouseRef.current.x, startMouseRef.current.y);
        const currentWorldPos = getWorldPosition(currentMouse.x, currentMouse.y);
        
        const delta = new THREE.Vector3().subVectors(currentWorldPos, startWorldPos);
        
        let newPosition = { ...startPositionRef.current };
        
        if (dragDirection === "center") {
            // 링 전체 드래그: X, Z 평행이동
            newPosition.x = startPositionRef.current.x + delta.x;
            newPosition.z = startPositionRef.current.z + delta.z;
        } else if (dragDirection === "north") {
            // 북쪽 핸들러: Z축 이동
            newPosition.z = startPositionRef.current.z + delta.z;
        } else if (dragDirection === "south") {
            // 남쪽 핸들러: Z축 이동
            newPosition.z = startPositionRef.current.z + delta.z;
        } else if (dragDirection === "east") {
            // 동쪽 핸들러: X축 이동
            newPosition.x = startPositionRef.current.x + delta.x;
        } else if (dragDirection === "west") {
            // 서쪽 핸들러: X축 이동
            newPosition.x = startPositionRef.current.x + delta.x;
        }

        onPositionChange(newPosition);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setDragDirection(null);
    };

    // 전역 마우스 이벤트 리스너
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e: MouseEvent) => {
            handlePointerMove(e);
        };
        const handleUp = () => {
            handlePointerUp();
        };
        
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [isDragging, dragDirection, onPositionChange]);

    // 핸들러 위치 계산
    const handleDistance = 0.9; // 링 바깥쪽에서 약간 떨어진 위치
    const handlePositions = {
        north: [0, 0, handleDistance],
        south: [0, 0, -handleDistance],
        east: [handleDistance, 0, 0],
        west: [-handleDistance, 0, 0],
    };

    return (
        <group
            position={[devicePosition.x, devicePosition.y, devicePosition.z]}
            rotation={[-Math.PI / 2, 0, 0]}
        >
            {/* 투명한 회색 원형 링 */}
            <mesh geometry={ringGeometry}>
                <meshStandardMaterial
                    color="#808080"
                    opacity={0.3}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 동서남북 핸들러 */}
            {/* 북쪽 */}
            <mesh
                position={handlePositions.north as [number, number, number]}
                rotation={[0, 0, 0]}
                geometry={handleGeometry}
                onPointerDown={(e) => handlePointerDown(e, "north")}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 남쪽 */}
            <mesh
                position={handlePositions.south as [number, number, number]}
                rotation={[Math.PI, 0, 0]}
                geometry={handleGeometry}
                onPointerDown={(e) => handlePointerDown(e, "south")}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 동쪽 */}
            <mesh
                position={handlePositions.east as [number, number, number]}
                rotation={[0, 0, -Math.PI / 2]}
                geometry={handleGeometry}
                onPointerDown={(e) => handlePointerDown(e, "east")}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 서쪽 */}
            <mesh
                position={handlePositions.west as [number, number, number]}
                rotation={[0, 0, Math.PI / 2]}
                geometry={handleGeometry}
                onPointerDown={(e) => handlePointerDown(e, "west")}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 링 자체도 드래그 가능 */}
            <mesh
                geometry={ringGeometry}
                onPointerDown={(e) => handlePointerDown(e, "center")}
                visible={false} // 보이지 않지만 클릭 가능
            >
                <meshStandardMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
}
