import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import DevicePlacementHandler from "@/features/device-placement";
import InstalledDevice from "@/entity/device/ui/InstalledDevice";
import { Wall } from "@/types/warehouse";

// 정적 데이터 => 이 창고의 정보를 가져왔다는 가정하게 앞으로 모든 것을 진행 하겠음
import warehouseData from "@/data/warehouse-example.json";

// hooks
import { useCameraReset } from "@/shared/hooks/useCameraReset";
import { useFocusTarget } from "@/shared/hooks/useFocusTarget";

// components
import DevicePreview from "@/features/device-placement/ui/DevicePreview";
import HeatmapLayer from "@/widgets/warehouse-viewer/ui/controls/HeatmapLayer";

// 구조물
import { Column, Human, Walls, Shelf, Door } from "./structures";
import InstancedColumns from "./structures/InstancedColumns";
import InstancedShelves from "./structures/InstancedShelves";
import InstancedWalls from "./structures/InstancedWalls";
import HeightController from "@/features/device-placement/ui/HeightController";

interface ThreeDViewerProps {
    selectedDevice: any | null;
    centerX: number;
    centerZ: number;
    length: number;
    width: number;
    isAddDeviceMode: boolean;
    selectedDeviceSerialNumber: string | null;
    onCloseDeviceMode: () => void;
    installedDevices: any[];
    onInstalledDevicesChange: (devices: any[]) => void;
    onDeviceClick?: (device: any) => void;
    onDeviceHover?: (device: any, isHovered: boolean) => void;
    hoveredDevice?: any | null;
    editingDeviceId?: string | null;
    focusTarget?: { x: number; y: number; z: number } | null;
    resetCameraTrigger?: number;
    isHeatmap: boolean;
}

function FloorGrid({
    length,
    width,
    centerX,
    centerZ,
    divisions = 20,
}: {
    length: number;
    width: number;
    centerX: number;
    centerZ: number;
    divisions?: number;
}) {
    const gridLines = useMemo(() => {
        const lines: THREE.Vector3[][] = [];
        const halfLength = length / 2;
        const halfWidth = width / 2;

        // X축 방향 선들 (Z축을 따라)
        for (let i = 0; i <= divisions; i++) {
            const z = (i / divisions) * width - halfWidth;
            lines.push([
                new THREE.Vector3(-halfLength, 0, z),
                new THREE.Vector3(halfLength, 0, z),
            ]);
        }

        // Z축 방향 선들 (X축을 따라)
        for (let i = 0; i <= divisions; i++) {
            const x = (i / divisions) * length - halfLength;
            lines.push([
                new THREE.Vector3(x, 0, -halfWidth),
                new THREE.Vector3(x, 0, halfWidth),
            ]);
        }

        return lines;
    }, [length, width, divisions]);

    return (
        <group position={[centerX, 0.01, centerZ]}>
            {gridLines.map((points, index) => {
                const geometry = new THREE.BufferGeometry().setFromPoints(
                    points
                );
                return (
                    <primitive
                        key={index}
                        object={
                            new THREE.Line(
                                geometry,
                                new THREE.LineBasicMaterial({
                                    color: "#999",
                                    opacity: 0.5,
                                    transparent: true,
                                })
                            )
                        }
                    />
                );
            })}
        </group>
    );
}

// 초기 카메라 설정 컴포넌트 (위에서 내려다보는 각도로 강제 설정)
function InitialCameraSetup({
    controlsRef,
    centerX,
    centerZ,
    cameraHeight,
}: {
    controlsRef: React.RefObject<any>;
    centerX: number;
    centerZ: number;
    cameraHeight: number;
}) {
    const { camera } = useThree();
    const initialized = useRef(false);

    useFrame(() => {
        if (initialized.current) return;
        if (!controlsRef.current) return;

        const controls = controlsRef.current;

        // OrbitControls의 타겟 설정
        controls.target.set(centerX, 0, centerZ);

        // 카메라 위치를 위쪽에 설정
        camera.position.set(centerX, cameraHeight, centerZ);

        // 카메라가 정확히 아래를 보도록 설정 (Rotation: -90°, 0°, 0°)
        camera.lookAt(centerX, 0, centerZ);

        // OrbitControls 업데이트
        controls.update();

        initialized.current = true;
    });

    return null;
}

// 카메라 디버그 정보 컴포넌트
function CameraDebugInfo({
    controlsRef,
    onUpdate,
}: {
    controlsRef: React.RefObject<any>;
    onUpdate: (info: {
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        target: { x: number; y: number; z: number };
        fov: number;
    }) => void;
}) {
    const { camera } = useThree();

    useFrame(() => {
        if (!controlsRef.current) return;

        const controls = controlsRef.current;
        const position = camera.position;
        const rotation = camera.rotation;
        const target = controls.target || new THREE.Vector3(0, 0, 0);
        const fov = (camera as THREE.PerspectiveCamera).fov || 0;

        onUpdate({
            position: {
                x: Math.round(position.x * 100) / 100,
                y: Math.round(position.y * 100) / 100,
                z: Math.round(position.z * 100) / 100,
            },
            rotation: {
                x: Math.round(((rotation.x * 180) / Math.PI) * 100) / 100,
                y: Math.round(((rotation.y * 180) / Math.PI) * 100) / 100,
                z: Math.round(((rotation.z * 180) / Math.PI) * 100) / 100,
            },
            target: {
                x: Math.round(target.x * 100) / 100,
                y: Math.round(target.y * 100) / 100,
                z: Math.round(target.z * 100) / 100,
            },
            fov: Math.round(fov * 100) / 100,
        });
    });

    return null;
}

function SpaceThreeDViewer({
    selectedDevice,
    centerX,
    centerZ,
    length,
    width,
    isAddDeviceMode,
    selectedDeviceSerialNumber,
    onCloseDeviceMode,
    installedDevices,
    onInstalledDevicesChange,
    onDeviceClick,
    onDeviceHover,
    hoveredDevice,
    editingDeviceId,
    focusTarget,
    resetCameraTrigger,
    isHeatmap,
}: ThreeDViewerProps) {
    // 미리보기 위치 및 회전
    const [previewPosition, setPreviewPosition] =
        useState<THREE.Vector3 | null>(null);
    const [previewRotation, setPreviewRotation] = useState<THREE.Euler | null>(
        null
    );
    const [isPreviewValid, setIsPreviewValid] = useState(false);
    // OrbitControls ref
    const controlsRef = useRef<any>(null);
    // 카메라 디버그 정보 상태
    const [cameraDebug, setCameraDebug] = useState<{
        position: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
        target: { x: number; y: number; z: number };
        fov: number;
    } | null>(null);

    // 카메라 높이 계산
    const cameraHeight = useMemo(
        () => Math.max(length, width) * 1.5,
        [length, width]
    );

    // focusTarget이 변경되면 카메라를 해당 위치로 이동
    useFocusTarget(focusTarget, controlsRef);

    // 카메라 리셋 hook 사용
    useCameraReset(
        resetCameraTrigger,
        controlsRef,
        centerX,
        centerZ,
        length,
        width
    );

    // 디바이스 배치 핸들러 - 실제로 디바이스 정보 업데이트 하는 함수
    const handlePlaceDevice = (
        position: THREE.Vector3,
        rotation: THREE.Euler,
        attachedTo: string,
        attachedToId: string
    ) => {
        if (editingDeviceId) {
            // 위치 변경 모드: 기존 디바이스 업데이트
            const existingDevice = installedDevices.find(
                (d) => d.id === editingDeviceId
            );
            if (existingDevice) {
                const updatedDevice = {
                    ...existingDevice,
                    position: {
                        x: position.x,
                        y: position.y,
                        z: position.z,
                    },
                    rotation: {
                        x: rotation.x,
                        y: rotation.y,
                        z: rotation.z,
                    },
                    attachedTo,
                    attachedToId,
                };
                const updatedDevices = installedDevices.map((d) =>
                    d.id === editingDeviceId ? updatedDevice : d
                );
                onInstalledDevicesChange(updatedDevices);
            }
        } else {
            // 새 디바이스 추가
            const newDevice = {
                id: `device-${Date.now()}`,
                serialNumber: selectedDeviceSerialNumber,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                },
                rotation: {
                    x: rotation.x,
                    y: rotation.y,
                    z: rotation.z,
                },
                attachedTo,
                attachedToId,
                installedAt: new Date(),
                status: "active" as const,
                temperature: 20 + Math.random() * 15, // POC: 20-35°C 랜덤
                humidity: 45 + Math.random() * 30, // POC: 45-75% 랜덤
            };

            const updatedDevices = [...installedDevices, newDevice];
            onInstalledDevicesChange(updatedDevices);
        }

        // 배치 완료 후 모드 해제
        onCloseDeviceMode();
        setPreviewPosition(null);
        setPreviewRotation(null);
    };

    // 미리보기 위치 변경 핸들러 (useCallback으로 메모이제이션하여 무한 재렌더링 방지)
    const handlePreviewPositionChange = useCallback(
        (
            pos: THREE.Vector3 | null,
            rot: THREE.Euler | null,
            isValid: boolean
        ) => {
            setPreviewPosition(pos);
            setPreviewRotation(rot);
            setIsPreviewValid(isValid);
        },
        []
    );

    // 디바이스 높이 변경 핸들러
    const handleHeightChange = (deviceId: string, newY: number) => {
        const updatedDevices = installedDevices.map((device) =>
            device.id === deviceId
                ? { ...device, position: { ...device.position, y: newY } }
                : device
        );
        onInstalledDevicesChange(updatedDevices);
    };

    return (
        <div className="relative flex-1 w-full h-full bg-[#EFEFEF] overflow-hidden">
            {/* 카메라 디버그 정보 */}
            {/* {cameraDebug && (
                <div className="  absolute top-6 right-6 z-20 p-4 font-mono text-xs text-white rounded-lg bg-black/80 w-[300px]">
                    <p className="mb-2 font-bold">Camera Debug Info</p>
                    <p>
                        Position: ({cameraDebug.position.x},{" "}
                        {cameraDebug.position.y}, {cameraDebug.position.z})
                    </p>
                    <p>
                        Rotation: ({cameraDebug.rotation.x}°,{" "}
                        {cameraDebug.rotation.y}°, {cameraDebug.rotation.z}°)
                    </p>
                    <p>
                        Target: ({cameraDebug.target.x}, {cameraDebug.target.y},{" "}
                        {cameraDebug.target.z})
                    </p>
                    <p>FOV: {cameraDebug.fov}°</p>
                </div>
            )} */}
            <Canvas
                camera={{
                    position: [centerX, Math.max(length, width) * 1.5, centerZ],
                    fov: 50,
                }}
            >
                {/* 조명: 없으면 아무것도 안 보임! */}
                <ambientLight intensity={1.2} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, 10, -5]} intensity={0.8} />
                <hemisphereLight intensity={0.6} />‰
                {/* 카메라 컨트롤: 마우스로 드래그해서 회전, 휠로 줌, Shift+드래그로 이동 */}
                <OrbitControls
                    ref={controlsRef}
                    target={[centerX, 0, centerZ]}
                    minDistance={10}
                    maxDistance={200}
                    enabled={!isAddDeviceMode} // 기기 배치 모드일 때는 컨트롤 비활성화
                    enablePan={true} // Pan 기능 활성화
                    panSpeed={1.0} // Pan 속도
                    screenSpacePanning={false} // 카메라 평면 기준으로 pan (더 자연스러움)
                    // 마우스 컨트롤:
                    // - 왼쪽 버튼 드래그: 회전
                    // - Shift + 왼쪽 버튼 드래그: Pan (이동)
                    // - 휠: 줌
                />
                <InitialCameraSetup
                    controlsRef={controlsRef}
                    centerX={centerX}
                    centerZ={centerZ}
                    cameraHeight={cameraHeight}
                />
                <CameraDebugInfo
                    controlsRef={controlsRef}
                    onUpdate={setCameraDebug}
                />
                {/* 디바이스 배치 핸들러 및 미리보기 */}
                {isAddDeviceMode &&
                    selectedDeviceSerialNumber &&
                    (() => {
                        return (
                            <>
                                <DevicePlacementHandler
                                    isAddDeviceMode={isAddDeviceMode}
                                    onPlaceDevice={handlePlaceDevice}
                                    onPreviewPositionChange={
                                        handlePreviewPositionChange
                                    }
                                />
                                <DevicePreview
                                    position={previewPosition}
                                    rotation={previewRotation}
                                    isValid={isPreviewValid}
                                />
                            </>
                        );
                    })()}
                {/* 설치된 디바이스들 */}
                {installedDevices.map((device) => {
                    return (
                        <>
                            <InstalledDevice
                                key={device.id}
                                device={device}
                                onClick={onDeviceClick}
                                onDeviceHover={onDeviceHover}
                                isHovered={hoveredDevice?.id === device.id}
                            />
                            {selectedDevice &&
                                selectedDevice.serialNumber ===
                                    device.serialNumber && (
                                    <HeightController
                                        devicePosition={device.position}
                                        onHeightChange={(newY) =>
                                            handleHeightChange(device.id, newY)
                                        }
                                    />
                                )}
                        </>
                    );
                })}
                {/* 히트맵 레이어 */}
                {isHeatmap && (
                    <HeatmapLayer
                        installedDevices={installedDevices}
                        position={[centerX, 0, centerZ]}
                        size={{ length, width }}
                        ceilingHeight={
                            warehouseData.structure.dimensions.height
                        }
                    />
                )}
                {/* 바닥: JSON의 dimensions 사용 */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[centerX, 0, centerZ]}
                >
                    <planeGeometry args={[length, width]} />
                    <meshStandardMaterial color="#C1C0C0" />
                </mesh>
                {/* 바닥 위에만 정확히 맞는 그리드 */}
                <FloorGrid
                    length={length}
                    width={width}
                    centerX={centerX}
                    centerZ={centerZ}
                    divisions={20}
                />
                {/* 기둥들 (Columns) - InstancedMesh로 최적화 */}
                {/* <InstancedColumns columns={warehouseData.structure.columns} /> */}
                {warehouseData.structure.columns.map((column) => (
                    <Column key={column.id} column={column} />
                ))}
                {/* 선반들 (Shelves) - InstancedMesh로 최적화 */}
                {/* <InstancedShelves
                    shelves={warehouseData.structure.shelves.map((shelf) => ({
                        ...shelf,
                        orientation: shelf.orientation as
                            | "north"
                            | "south"
                            | "east"
                            | "west",
                    }))}
                /> */}
                {/* 벽 - InstancedMesh로 최적화 */}
                {warehouseData.structure.walls.map((wall) => (
                    <Walls
                        key={wall.id}
                        wall={{
                            ...wall,
                            start: [wall.start[0], wall.start[1]] as [
                                number,
                                number
                            ],
                            end: [wall.end[0], wall.end[1]] as [number, number],
                            type: wall.type as "exterior" | "interior",
                        }}
                    />
                ))}
                {/* <InstancedWalls
                    walls={warehouseData.structure.walls.map((wall) => ({
                        ...wall,
                        start: [wall.start[0], wall.start[1]] as [
                            number,
                            number
                        ],
                        end: [wall.end[0], wall.end[1]] as [number, number],
                        type: wall.type as "exterior" | "interior",
                    }))}
                /> */}
                {/* 문 */}
                {warehouseData.structure.doors.map((door) => (
                    <Door key={door.id} door={door} />
                ))}
                {/* 인간 사이즈 오브젝트 (첫 번째 문 앞에 배치) */}
                {/* {(() => {
                    const firstDoor = warehouseData.structure.doors[0]; // door-main-loading
                    if (!firstDoor) return null;

                    const wall = warehouseData.structure.walls.find(
                        (w) => w.id === firstDoor.wallId
                    );
                    if (!wall) return null;

                    // 타입 변환: number[]를 [number, number]로, type을 올바른 타입으로
                    const wallWithTuple: Wall = {
                        ...wall,
                        start: [wall.start[0], wall.start[1]] as [
                            number,
                            number
                        ],
                        end: [wall.end[0], wall.end[1]] as [number, number],
                        type: wall.type as "exterior" | "interior",
                    };

                    return <Human door={firstDoor} wall={wallWithTuple} />;
                })()} */}
            </Canvas>
        </div>
    );
}

export default SpaceThreeDViewer;
