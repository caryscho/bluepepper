import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { DEVICE_SIZE } from "./constants";

interface DevicePlacementHandlerProps {
    isAddDeviceMode: boolean;
    onPlaceDevice: (
        position: THREE.Vector3,
        rotation: THREE.Euler,
        attachedTo: "wall" | "column",
        attachedToId: string
    ) => void;
    onPreviewPositionChange: (
        position: THREE.Vector3 | null,
        rotation: THREE.Euler | null,
        isValid: boolean
    ) => void;
}

function DevicePlacementHandler({
    isAddDeviceMode,
    onPlaceDevice,
    onPreviewPositionChange,
}: DevicePlacementHandlerProps) {
    
    const { camera, raycaster, gl, scene } = useThree();
    const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
    const wallsRef = useRef<THREE.Mesh[]>([]);
    const columnsRef = useRef<THREE.Mesh[]>([]);
    
    // 재사용 가능한 객체들 (매 프레임마다 생성하지 않음)
    const tempVector = useRef(new THREE.Vector3());
    const tempVector2 = useRef(new THREE.Vector3());
    const tempNormal = useRef(new THREE.Vector3());
    const allTargetsRef = useRef<THREE.Mesh[]>([]);
    const lastPositionRef = useRef<THREE.Vector3 | null>(null);

    // 마우스 위치 업데이트
    useEffect(() => {
            if (!isAddDeviceMode) {
                onPreviewPositionChange(null, null, false);
                return;
            }

        // 마우스 이동 이벤트 throttling (성능 최적화)
        let rafId: number | null = null;
        const handleMouseMove = (event: MouseEvent) => {
            if (rafId !== null) return; // 이미 예약된 업데이트가 있으면 스킵
            
            rafId = requestAnimationFrame(() => {
                const rect = gl.domElement.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                setMousePosition(new THREE.Vector2(x, y));
                rafId = null;
            });
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isAddDeviceMode, gl, onPreviewPositionChange]);

    // 벽과 기둥 mesh 참조 수집
    useEffect(() => {
        if (!isAddDeviceMode) return;

        const walls: THREE.Mesh[] = [];
        const columns: THREE.Mesh[] = [];

        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.userData.type === "wall") {
                    walls.push(object);
                } else if (object.userData.type === "column") {
                    columns.push(object);
                }
            }
        });

        wallsRef.current = walls;
        columnsRef.current = columns;
        // allTargets 배열도 미리 생성 (매 프레임마다 생성하지 않음)
        allTargetsRef.current = [...walls, ...columns];
    }, [isAddDeviceMode, scene]);

    // Raycasting으로 벽/기둥 위치 계산 (최적화됨)
    useFrame(() => {
        if (!isAddDeviceMode) {
            return;
        }

        // Raycasting 설정 (threshold 조정으로 성능 향상)
        raycaster.setFromCamera(mousePosition, camera);
        raycaster.params.Line = { threshold: 0.1 };
        
        // 미리 생성된 배열 사용 (매 프레임마다 새 배열 생성하지 않음)
        const intersects = raycaster.intersectObjects(allTargetsRef.current, false);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const point = intersect.point;
            
            // 재사용 가능한 객체 사용
            const normal = tempNormal.current;
            if (intersect.face?.normal) {
                normal.copy(intersect.face.normal);
            } else {
                normal.set(0, 0, 1);
            }

            // 월드 좌표계로 변환
            if (intersect.object instanceof THREE.Mesh) {
                intersect.object.localToWorld(normal);
                normal.normalize();
            }

            // 기기 크기
            const deviceDepth = DEVICE_SIZE.depth || 0.01;

            // 면에서 약간 떨어진 위치 (벽/기둥 표면에서) - 재사용 가능한 객체 사용
            const offset = tempVector.current;
            offset.copy(normal).multiplyScalar(deviceDepth / 2 + 0.01);
            
            const position = tempVector2.current;
            position.copy(point).add(offset);

            // 위치가 크게 변경되지 않았으면 업데이트 스킵 (성능 최적화)
            if (lastPositionRef.current) {
                const distance = position.distanceTo(lastPositionRef.current);
                if (distance < 0.01) {
                    return; // 거의 변화가 없으면 스킵
                }
            }
            lastPositionRef.current = position.clone();

            // 성냥갑의 얇은 부분(depth)이 앞을 향하도록 Y축 기준 90도 회전
            const finalRotation = new THREE.Euler(0, Math.PI / 2, 0);

            onPreviewPositionChange(position.clone(), finalRotation, true);
        } else {
            if (lastPositionRef.current !== null) {
                lastPositionRef.current = null;
                onPreviewPositionChange(null, null, false);
            }
        }
    });

    // 클릭 이벤트 처리
    useEffect(() => {
        if (!isAddDeviceMode) return;

        const handleClick = (event: MouseEvent) => {
            // UI 요소 클릭은 무시 (사이드바 등)
            const target = event.target as HTMLElement;
            if (target.closest(".absolute") || target.closest("button")) {
                return;
            }

            raycaster.setFromCamera(mousePosition, camera);
            const allTargets = [...wallsRef.current, ...columnsRef.current];
            const intersects = raycaster.intersectObjects(allTargets, false);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const point = intersect.point;
                const normal = intersect.face?.normal.clone() || new THREE.Vector3(0, 0, 1);

                if (intersect.object instanceof THREE.Mesh) {
                    intersect.object.localToWorld(normal);
                    normal.normalize();
                }

                const deviceDepth = DEVICE_SIZE.depth || 0.01;
                const offset = normal.clone().multiplyScalar(deviceDepth / 2 + 0.01);
                const position = point.clone().add(offset);

                // 성냥갑의 얇은 부분(depth)이 앞을 향하도록 Y축 기준 90도 회전
                const rotation = new THREE.Euler(0, Math.PI / 2, 0);

                // 부착된 오브젝트 정보
                const attachedToId = intersect.object.userData.id || "";
                const attachedTo = intersect.object.userData.type === "wall" ? "wall" : "column";

                onPlaceDevice(position, rotation, attachedTo, attachedToId);
            }
        };

        gl.domElement.addEventListener("click", handleClick);
        return () => {
            gl.domElement.removeEventListener("click", handleClick);
        };
    }, [
        isAddDeviceMode,
        camera,
        raycaster,
        mousePosition,
        gl,
        onPlaceDevice,
    ]);

    // ESC 키로 취소
    useEffect(() => {
        if (!isAddDeviceMode) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onPreviewPositionChange(null, null, false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isAddDeviceMode, onPreviewPositionChange]);

    return null; // 이 컴포넌트는 렌더링하지 않음
}

export default DevicePlacementHandler;
