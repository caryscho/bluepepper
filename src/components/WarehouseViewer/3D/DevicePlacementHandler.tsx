import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DeviceType } from "../../../types/device";

interface DevicePlacementHandlerProps {
    isAddDeviceMode: boolean;
    selectedDeviceType: DeviceType | null;
    onPlaceDevice: (
        position: THREE.Vector3,
        rotation: THREE.Euler,
        deviceType: DeviceType,
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
    selectedDeviceType,
    onPlaceDevice,
    onPreviewPositionChange,
}: DevicePlacementHandlerProps) {
    const { camera, raycaster, gl, scene } = useThree();
    const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
    const wallsRef = useRef<THREE.Mesh[]>([]);
    const columnsRef = useRef<THREE.Mesh[]>([]);

    // 마우스 위치 업데이트
    useEffect(() => {
            if (!isAddDeviceMode || !selectedDeviceType) {
                onPreviewPositionChange(null, null, false);
                return;
            }

        const handleMouseMove = (event: MouseEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            setMousePosition(new THREE.Vector2(x, y));
        };

        gl.domElement.addEventListener("mousemove", handleMouseMove);
        return () => {
            gl.domElement.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isAddDeviceMode, selectedDeviceType, gl, onPreviewPositionChange]);

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
    }, [isAddDeviceMode, scene]);

    // Raycasting으로 벽/기둥 위치 계산
    useFrame(() => {
        if (!isAddDeviceMode || !selectedDeviceType) {
            return;
        }

        raycaster.setFromCamera(mousePosition, camera);

        // 벽과 기둥 모두 체크
        const allTargets = [...wallsRef.current, ...columnsRef.current];
        const intersects = raycaster.intersectObjects(allTargets, false);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const point = intersect.point;
            const normal = intersect.face?.normal.clone() || new THREE.Vector3(0, 0, 1);

            // 월드 좌표계로 변환
            if (intersect.object instanceof THREE.Mesh) {
                intersect.object.localToWorld(normal);
                normal.normalize();
            }

            // 기기 크기 (핸드폰 사이즈: 약 0.15m x 0.07m x 0.01m)
            const deviceDepth = selectedDeviceType.size.depth || 0.01;

            // 면에서 약간 떨어진 위치 (벽/기둥 표면에서)
            const offset = normal.clone().multiplyScalar(deviceDepth / 2 + 0.01);
            const position = point.clone().add(offset);

            // 회전 계산: 면의 법선 벡터에 수직으로
            // 벽/기둥의 면에 평행하게 배치 (Y축은 위를 향함)
            const wallNormal = normal.clone();
            wallNormal.y = 0; // Y 성분 제거 (수평면만 고려)
            wallNormal.normalize();

            // Y축 회전만 계산 (기기는 항상 수직)
            const angle = Math.atan2(wallNormal.x, wallNormal.z);
            const finalRotation = new THREE.Euler(0, angle, 0);

            onPreviewPositionChange(position, finalRotation, true);
        } else {
            onPreviewPositionChange(null, null, false);
        }
    });

    // 클릭 이벤트 처리
    useEffect(() => {
        if (!isAddDeviceMode || !selectedDeviceType) return;

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

                const deviceDepth = selectedDeviceType.size.depth || 0.01;
                const offset = normal.clone().multiplyScalar(deviceDepth / 2 + 0.01);
                const position = point.clone().add(offset);

                // 회전 계산: 벽/기둥의 면에 평행하게
                const wallNormal = normal.clone();
                wallNormal.y = 0;
                wallNormal.normalize();
                const angle = Math.atan2(wallNormal.x, wallNormal.z);
                const rotation = new THREE.Euler(0, angle, 0);

                // 부착된 오브젝트 정보
                const attachedToId = intersect.object.userData.id || "";
                const attachedTo = intersect.object.userData.type === "wall" ? "wall" : "column";

                onPlaceDevice(position, rotation, selectedDeviceType, attachedTo, attachedToId);
            }
        };

        gl.domElement.addEventListener("click", handleClick);
        return () => {
            gl.domElement.removeEventListener("click", handleClick);
        };
    }, [
        isAddDeviceMode,
        selectedDeviceType,
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
