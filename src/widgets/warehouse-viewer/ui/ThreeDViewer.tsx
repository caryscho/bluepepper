import { useMemo, useState, useRef, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DeviceType } from "@/types/device";
import { OrbitControls } from "@react-three/drei";
import DevicePlacementHandler from "@/features/device-placement";
import InstalledDevice from "@/entity/device/ui/InstalledDevice";

// 정적 데이터 => 이 창고의 정보를 가져왔다는 가정하게 앞으로 모든 것을 진행 하겠음
import warehouseData from "@/data/warehouse-example.json";

// components
import DevicePreview from "@/features/device-placement/ui/DevicePreview";
import { SearchIcon } from "lucide-react";

interface ThreeDViewerProps {
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
    getDeviceType?: (serialNumber: string) => DeviceType | null;
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
                                    color: "#888888",
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
                x: Math.round((rotation.x * 180) / Math.PI * 100) / 100,
                y: Math.round((rotation.y * 180) / Math.PI * 100) / 100,
                z: Math.round((rotation.z * 180) / Math.PI * 100) / 100,
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

function ThreeDViewer({
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
    getDeviceType,
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
    const cameraHeight = useMemo(() => Math.max(length, width) * 1.5, [length, width]);

    // focusTarget이 변경되면 카메라를 해당 위치로 이동
    useEffect(() => {
        if (focusTarget && controlsRef.current) {
            const controls = controlsRef.current;
            // 부드러운 애니메이션을 위해 lerp 사용
            const target = new THREE.Vector3(
                focusTarget.x,
                focusTarget.y,
                focusTarget.z
            );

            // OrbitControls의 target을 부드럽게 이동
            const animate = () => {
                const currentTarget = controls.target;
                const distance = currentTarget.distanceTo(target);

                if (distance > 0.01) {
                    // lerp를 사용하여 부드럽게 이동
                    currentTarget.lerp(target, 0.1);
                    controls.update();
                    requestAnimationFrame(animate);
                } else {
                    // 목표 위치에 도달
                    controls.target.copy(target);
                    controls.update();
                }
            };

            animate();
        }
    }, [focusTarget]);

    // 디바이스 배치 핸들러 - 실제로 디바이스 정보 업데이트 하는 함수
    const handlePlaceDevice = (
        position: THREE.Vector3,
        rotation: THREE.Euler,
        deviceType: DeviceType | null,
        attachedTo: "wall" | "column",
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
            };

            const updatedDevices = [...installedDevices, newDevice];
            onInstalledDevicesChange(updatedDevices);
        }

        // 배치 완료 후 모드 해제
        onCloseDeviceMode();
        setPreviewPosition(null);
        setPreviewRotation(null);
    };

    return (
        <div className="relative flex-1 w-full h-full bg-[#EFEFEF] overflow-hidden">
            {/* 카메라 디버그 정보 */}
            {cameraDebug && (
                <div className="absolute top-6 right-6 z-20 p-4 font-mono text-xs text-white rounded-lg bg-black/80 w-[300px]">
                    <p className="mb-2 font-bold">Camera Debug Info</p>
                    <p>Position: ({cameraDebug.position.x}, {cameraDebug.position.y}, {cameraDebug.position.z})</p>
                    <p>Rotation: ({cameraDebug.rotation.x}°, {cameraDebug.rotation.y}°, {cameraDebug.rotation.z}°)</p>
                    <p>Target: ({cameraDebug.target.x}, {cameraDebug.target.y}, {cameraDebug.target.z})</p>
                    <p>FOV: {cameraDebug.fov}°</p>
                </div>
            )}
            {/* device 검색 */}
            <div className="flex overflow-hidden gap-1 bg-white rounded-lg w-[240px] absolute top-6 left-1/2 -translate-x-1/2 z-10 text-black">
                <button className="text-black">
                    <SearchIcon className="w-4 h-4" />
                </button>
                <input
                    className="mr-2 bg-white outline-none grow focus:outline-none"
                    type="text"
                    placeholder="Device Serial Number"
                />
            </div>  
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
                <CameraDebugInfo controlsRef={controlsRef} onUpdate={setCameraDebug} />
                {/* 디바이스 배치 핸들러 및 미리보기 */}
                {isAddDeviceMode &&
                    selectedDeviceSerialNumber &&
                    getDeviceType &&
                    (() => {
                        const deviceType = getDeviceType(
                            selectedDeviceSerialNumber
                        );
                        if (!deviceType) return null;

                        return (
                            <>
                                <DevicePlacementHandler
                                    isAddDeviceMode={isAddDeviceMode}
                                    selectedDeviceType={deviceType}
                                    onPlaceDevice={handlePlaceDevice}
                                    onPreviewPositionChange={(
                                        pos: THREE.Vector3 | null,
                                        rot: THREE.Euler | null,
                                        isValid: boolean
                                    ) => {
                                        setPreviewPosition(pos);
                                        setPreviewRotation(rot);
                                        setIsPreviewValid(isValid);
                                    }}
                                />
                                <DevicePreview
                                    deviceType={deviceType}
                                    position={previewPosition}
                                    rotation={previewRotation}
                                    isValid={isPreviewValid}
                                />
                            </>
                        );
                    })()}
                {/* 설치된 디바이스들 */}
                {installedDevices.map((device) => {
                    const deviceType =
                        getDeviceType?.(device.serialNumber) || null;
                    if (!deviceType) return null;

                    return (
                        <InstalledDevice
                            key={device.id}
                            device={device}
                            deviceType={deviceType}
                            onClick={onDeviceClick}
                            onDeviceHover={onDeviceHover}
                            isHovered={hoveredDevice?.id === device.id}
                        />
                    );
                })}
                {/* 바닥: JSON의 dimensions 사용 */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[centerX, 0, centerZ]}
                >
                    <planeGeometry args={[length, width]} />
                    <meshStandardMaterial color="#cccccc" />
                </mesh>
                {/* 창고 데이터 MESH RENDERING */}
                {/* 기둥들 (Columns) */}
                {warehouseData.structure.columns.map((column) => (
                    <mesh
                        key={column.id}
                        position={[
                            column.position.x,
                            column.height / 2,
                            column.position.z,
                        ]}
                        userData={{ type: "column", id: column.id }}
                    >
                        <boxGeometry
                            args={[
                                column.size.width,
                                column.height,
                                column.size.depth,
                            ]}
                        />
                        <meshStandardMaterial color="#888888" />
                    </mesh>
                ))}
                {/* 벽 */}
                {warehouseData.structure.walls.map((wall) => {
                    const dx = wall.end[0] - wall.start[0];
                    const dz = wall.end[1] - wall.start[1];
                    const wallLength = Math.sqrt(dx * dx + dz * dz);
                    const angle = Math.atan2(dz, dx);
                    const centerX = (wall.start[0] + wall.end[0]) / 2;
                    const centerZ = (wall.start[1] + wall.end[1]) / 2;
                    const centerY = wall.height / 2;

                    return (
                        <mesh
                            key={wall.id}
                            position={[centerX, centerY, centerZ]}
                            rotation={[0, angle, 0]}
                            userData={{ type: "wall", id: wall.id }}
                            renderOrder={0}
                        >
                            <boxGeometry
                                args={[wallLength, wall.height, wall.thickness]}
                            />
                            <meshStandardMaterial
                                color={
                                    wall.type === "exterior"
                                        ? "#666666"
                                        : "#999999"
                                }
                                depthWrite={true}
                            />
                        </mesh>
                    );
                })}
                {/* 문 */}
                {warehouseData.structure.doors.map((door) => {
                    // door의 wallId로 해당 벽 찾기
                    const wall = warehouseData.structure.walls.find(
                        (w) => w.id === door.wallId
                    );
                    if (!wall) return null;

                    // 벽의 방향 벡터 계산
                    const dx = wall.end[0] - wall.start[0];
                    const dz = wall.end[1] - wall.start[1];
                    const wallLength = Math.sqrt(dx * dx + dz * dz);
                    const angle = Math.atan2(dz, dx);

                    // 문의 위치 계산 (벽을 따라 position(0-1)을 실제 좌표로 변환)
                    const doorX =
                        wall.start[0] +
                        (wall.end[0] - wall.start[0]) * door.position;
                    const doorZ =
                        wall.start[1] +
                        (wall.end[1] - wall.start[1]) * door.position;
                    const doorY = door.height / 2;

                    // 벽의 두께를 고려해서 문을 벽 앞에 배치 (벽의 두께/2 + 약간의 여유)
                    const offsetDistance = wall.thickness / 2 + 0.01;
                    const offsetX =
                        Math.cos(angle + Math.PI / 2) * offsetDistance;
                    const offsetZ =
                        Math.sin(angle + Math.PI / 2) * offsetDistance;

                    return (
                        <mesh
                            key={door.id}
                            position={[doorX + offsetX, doorY, doorZ + offsetZ]}
                            rotation={[0, angle, 0]}
                        >
                            <boxGeometry
                                args={[door.width, door.height, 0.1]}
                            />
                            <meshStandardMaterial color="#8B4513" />
                        </mesh>
                    );
                })}
                {/* 창문 */}
                {warehouseData.structure.windows.map((window) => {
                    // window의 wallId로 해당 벽 찾기
                    const wall = warehouseData.structure.walls.find(
                        (w) => w.id === window.wallId
                    );
                    if (!wall) return null;

                    // 벽의 방향 벡터 계산
                    const dx = wall.end[0] - wall.start[0];
                    const dz = wall.end[1] - wall.start[1];
                    const angle = Math.atan2(dz, dx);

                    // 창문의 위치 계산 (벽을 따라 position(0-1)을 실제 좌표로 변환)
                    const windowX =
                        wall.start[0] +
                        (wall.end[0] - wall.start[0]) * window.position;
                    const windowZ =
                        wall.start[1] +
                        (wall.end[1] - wall.start[1]) * window.position;
                    // yPosition은 바닥에서의 높이, 창문의 중심은 yPosition + height/2
                    const windowY = window.yPosition + window.height / 2;

                    // 벽의 두께를 고려해서 창문을 벽 앞에 배치 (벽의 두께/2 + 약간의 여유)
                    const offsetDistance = wall.thickness / 2 + 0.01;
                    const offsetX =
                        Math.cos(angle + Math.PI / 2) * offsetDistance;
                    const offsetZ =
                        Math.sin(angle + Math.PI / 2) * offsetDistance;

                    return (
                        <mesh
                            key={window.id}
                            position={[
                                windowX + offsetX,
                                windowY,
                                windowZ + offsetZ,
                            ]}
                            rotation={[0, angle, 0]}
                            renderOrder={1}
                        >
                            <boxGeometry
                                args={[window.width, window.height, 0.05]}
                            />
                            <meshStandardMaterial
                                color="#87CEEB"
                                opacity={0.6}
                                transparent
                                depthWrite={false}
                            />
                        </mesh>
                    );
                })}
                {/* 인간 사이즈 오브젝트 (첫 번째 문 앞에 배치) */}
                {(() => {
                    const firstDoor = warehouseData.structure.doors[0]; // door-main-loading
                    if (!firstDoor) return null;

                    const wall = warehouseData.structure.walls.find(
                        (w) => w.id === firstDoor.wallId
                    );
                    if (!wall) return null;

                    const dx = wall.end[0] - wall.start[0];
                    const dz = wall.end[1] - wall.start[1];
                    const angle = Math.atan2(dz, dx);

                    // 문의 위치 계산
                    const doorX =
                        wall.start[0] +
                        (wall.end[0] - wall.start[0]) * firstDoor.position;
                    const doorZ =
                        wall.start[1] +
                        (wall.end[1] - wall.start[1]) * firstDoor.position;

                    // 벽의 두께를 고려한 문의 위치
                    const offsetDistance = wall.thickness / 2 + 0.01;
                    const offsetX =
                        Math.cos(angle + Math.PI / 2) * offsetDistance;
                    const offsetZ =
                        Math.sin(angle + Math.PI / 2) * offsetDistance;

                    // 문 앞에 사람 배치 (문에서 1.5m 떨어진 위치)
                    const personDistance = 1.5;
                    const personOffsetX =
                        Math.cos(angle + Math.PI / 2) * personDistance;
                    const personOffsetZ =
                        Math.sin(angle + Math.PI / 2) * personDistance;

                    // 두 명의 사람 (1.8m와 1.6m, 몸통+머리 합쳐서)
                    const headHeight = 0.2; // 머리 높이
                    const people = [
                        {
                            totalHeight: 1.8,
                            bodyHeight: 1.8 - headHeight,
                            offset: -0.8,
                        }, // 왼쪽
                        {
                            totalHeight: 1.6,
                            bodyHeight: 1.6 - headHeight,
                            offset: 0.8,
                        }, // 오른쪽
                    ];

                    return (
                        <group>
                            {people.map((person, index) => {
                                // 사람을 나란히 배치 (문의 방향에 수직으로)
                                const sideOffsetX =
                                    Math.cos(angle) * person.offset;
                                const sideOffsetZ =
                                    Math.sin(angle) * person.offset;

                                return (
                                    <group
                                        key={`person-${index}`}
                                        position={[
                                            doorX +
                                                offsetX +
                                                personOffsetX +
                                                sideOffsetX,
                                            person.totalHeight / 2,
                                            doorZ +
                                                offsetZ +
                                                personOffsetZ +
                                                sideOffsetZ,
                                        ]}
                                        rotation={[0, angle + Math.PI / 2, 0]}
                                    >
                                        {/* 몸통 */}
                                        <mesh
                                            position={[
                                                0,
                                                -(
                                                    person.totalHeight -
                                                    person.bodyHeight
                                                ) / 2,
                                                0,
                                            ]}
                                        >
                                            <cylinderGeometry
                                                args={[
                                                    0.2,
                                                    0.2,
                                                    person.bodyHeight,
                                                    16,
                                                ]}
                                            />
                                            <meshStandardMaterial color="#FFDBAC" />
                                        </mesh>
                                        {/* 머리 */}
                                        <mesh
                                            position={[
                                                0,
                                                person.bodyHeight / 2 +
                                                    headHeight / 2,
                                                0,
                                            ]}
                                        >
                                            <sphereGeometry
                                                args={[0.15, 16, 16]}
                                            />
                                            <meshStandardMaterial color="#FFDBAC" />
                                        </mesh>
                                    </group>
                                );
                            })}
                        </group>
                    );
                })()}
                {/* 바닥 위에만 정확히 맞는 그리드 */}
                <FloorGrid
                    length={length}
                    width={width}
                    centerX={centerX}
                    centerZ={centerZ}
                    divisions={20}
                />
            </Canvas>
        </div>
    );
}

export default ThreeDViewer;
