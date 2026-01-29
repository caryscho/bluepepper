import { useState, useRef } from "react";
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
    const { camera, raycaster } = useThree();
    const [isDragging, setIsDragging] = useState(false);
    const [dragDirection, setDragDirection] = useState<"north" | "south" | "east" | "west" | "center" | null>(null);
    const startPointerRef = useRef<THREE.Vector2 | null>(null);
    const startPositionRef = useRef(new THREE.Vector3());

    // 링 Geometry
    const ringGeometry = new THREE.RingGeometry(0.4, 0.8, 32);
    
    // 핸들러 Geometry (삼각형 화살표)
    const handleGeometry = new THREE.ConeGeometry(0.08, 0.15, 3);

    // 마우스 위치를 3D 공간으로 변환 (바닥 평면과 교차)
    const getWorldPositionOnPlane = (pointer: THREE.Vector2) => {
        raycaster.setFromCamera(pointer, camera);
        
        // 바닥 평면과 교차점 계산 (Y = devicePosition.y)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -devicePosition.y);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        
        return intersectPoint;
    };

    const handlePointerDown = (e: any, direction?: "north" | "south" | "east" | "west" | "center") => {
        e.stopPropagation(); // 선택 해제 방지
        
        setIsDragging(true);
        setDragDirection(direction || "center");
        
        // 시작 포인터 위치 저장
        startPointerRef.current = e.pointer.clone();
        startPositionRef.current.set(
            devicePosition.x,
            devicePosition.y,
            devicePosition.z
        );
        
        // 포인터 캡처 (HeightController 참고)
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: any) => {
        if (!isDragging || !onPositionChange || !startPointerRef.current) return;
        
        e.stopPropagation(); // 선택 해제 방지

        const currentPointer = e.pointer.clone();
        const startWorldPos = getWorldPositionOnPlane(startPointerRef.current);
        const currentWorldPos = getWorldPositionOnPlane(currentPointer);
        
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

    const handlePointerUp = (e: any) => {
        setIsDragging(false);
        setDragDirection(null);
        startPointerRef.current = null;
        
        // 포인터 캡처 해제 (HeightController 참고)
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    // onClick 이벤트도 막아야 함 (React Three Fiber에서 별도로 처리됨)
    const handleClick = (e: any) => {
        e.stopPropagation(); // ClickableGLBModel의 handleClick으로 전파 방지
    };

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
            onClick={handleClick}
        >
            {/* 투명한 회색 원형 링 (드래그 가능) */}
            <mesh
                geometry={ringGeometry}
                onClick={handleClick}
                onPointerDown={(e) => handlePointerDown(e, "center")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
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
                onClick={handleClick}
                onPointerDown={(e) => handlePointerDown(e, "north")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 남쪽 */}
            <mesh
                position={handlePositions.south as [number, number, number]}
                rotation={[Math.PI, 0, 0]}
                geometry={handleGeometry}
                onClick={handleClick}
                onPointerDown={(e) => handlePointerDown(e, "south")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 동쪽 */}
            <mesh
                position={handlePositions.east as [number, number, number]}
                rotation={[0, 0, -Math.PI / 2]}
                geometry={handleGeometry}
                onClick={handleClick}
                onPointerDown={(e) => handlePointerDown(e, "east")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

            {/* 서쪽 */}
            <mesh
                position={handlePositions.west as [number, number, number]}
                rotation={[0, 0, Math.PI / 2]}
                geometry={handleGeometry}
                onClick={handleClick}
                onPointerDown={(e) => handlePointerDown(e, "west")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                <meshStandardMaterial color="#FFFFFF" />
            </mesh>

        </group>
    );
}
