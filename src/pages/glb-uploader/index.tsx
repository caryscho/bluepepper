import { useRef, useState, useEffect } from "react";
import { Suspense } from "react";

import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFocusTarget } from "@/shared/hooks/useFocusTarget";

import { useWarehouseViewer } from "@/widgets/warehouse-viewer/model/useWarehouseViewer";
import Controls from "@/widgets/warehouse-viewer/ui/controls";

import { CanvasLoadingSpinner } from "@/shared/ui/LoadingSpinner";

import DevicePlacementHandlerGLB from "@/features/device-placement-glb";
// import DevicePreview from "@/features/device-placement/ui/DevicePreview"; // 기존 네모 노란 매치박스
import DevicePreview from "@/features/device-placement/ui/DevicePreviewMarker"; // todo => marker 모양 또는 실제 마우스 좌표 보정해서 렌더링 한것
import InstalledDevice from "@/entity/device/ui/InstalledDevice";
import DeviceSelector from "@/features/device-placement/ui/DeviceSelector";
import DeviceDetailBox from "@/features/device-detail/ui/DeviceDetailBox";
import DeviceList from "@/features/device-list/ui/DeviceList";
import { DEVICE_SIZE } from "@/features/device-placement/constants";
import HeightController from "@/features/device-placement/ui/HeightController";
import DiscController from "@/features/device-placement/ui/DiscController";


// 카메라 포커스 컨트롤러 (Canvas 내부에서 사용)
function CameraFocusController({
    focusTarget,
    controlsRef,
}: {
    focusTarget: { x: number; y: number; z: number } | null;
    controlsRef: React.RefObject<any>;
}) {
    useFocusTarget(focusTarget, controlsRef);
    return null;
}

// 클릭 가능한 GLB 모델 컴포넌트 GLB 로드해서 만든 컴포넌트이당
function ClickableGLBModel({
    url,
    onObjectClick,
    onModelInfoUpdate,
    targetSize,
    onDeviceDeselect,
}: {
    url: string;
    onObjectClick: (name: string) => void;
    onModelInfoUpdate: (info: {
        fileName: string;
        meshCount: number;
        triangleCount: number;
        size: { x: number; y: number; z: number };
        originalSize: { x: number; y: number; z: number };
        scale: number;
    }) => void;
    targetSize: number; // 목표 건물 크기 (미터)
    onDeviceDeselect: () => void; // 디바이스 선택 해제
}) {
    const { scene } = useGLTF(url);
    const { camera } = useThree();
    const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
        null
    );

    useEffect(() => {
        // 씬 초기화 (캐시된 scene의 이전 변형 제거)
        scene.position.set(0, 0, 0);
        scene.rotation.set(0, 0, 0);
        scene.scale.set(1, 1, 1);

        // 바운딩 박스 계산 (원본 크기)
        const box = new THREE.Box3().setFromObject(scene);
        const originalSize = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // 모델을 중앙으로 이동
        scene.position.sub(center);

        // 자동 스케일링: 가장 긴 변을 목표 크기에 맞춤
        const maxOriginalDim = Math.max(
            originalSize.x,
            originalSize.y,
            originalSize.z
        );
        const autoScale = targetSize / maxOriginalDim;

        // 씬 전체에 스케일 적용
        scene.scale.set(autoScale, autoScale, autoScale);

        // 스케일 적용 후 실제 크기 계산
        const scaledSize = new THREE.Vector3(
            originalSize.x * autoScale,
            originalSize.y * autoScale,
            originalSize.z * autoScale
        );

        // 카메라 위치 조정 (스케일된 크기 기준)
        const maxDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
        if (camera instanceof THREE.PerspectiveCamera) {
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 2.5;

            camera.position.set(cameraZ, cameraZ * 0.7, cameraZ);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }

        // 모델 정보 수집
        let meshCount = 0;
        let triangleCount = 0;

        // 각 메시를 클릭 가능하게 설정
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                meshCount++;

                // 삼각형 개수 계산
                if (child.geometry) {
                    const geometry = child.geometry;
                    if (geometry.index) {
                        triangleCount += geometry.index.count / 3;
                    } else if (geometry.attributes.position) {
                        triangleCount += geometry.attributes.position.count / 3;
                    }
                }

                if (child.material instanceof THREE.Material) {
                    child.userData.originalColor = (
                        child.material as any
                    ).color?.clone();
                }

                // 클릭 이벤트를 받을 수 있도록 설정
                // child.userData.clickable = true;

                // 원본 색상 저장 (hover 효과용)
            }
        });

        // 모델 정보 업데이트
        onModelInfoUpdate({
            fileName: url.includes("blob:")
                ? "Uploaded File"
                : url.split("/").pop() || "Unknown",
            meshCount,
            triangleCount: Math.round(triangleCount),
            originalSize: {
                x: Math.round(originalSize.x * 1000) / 1000,
                y: Math.round(originalSize.y * 1000) / 1000,
                z: Math.round(originalSize.z * 1000) / 1000,
            },
            size: {
                x: Math.round(scaledSize.x * 100) / 100,
                y: Math.round(scaledSize.y * 100) / 100,
                z: Math.round(scaledSize.z * 100) / 100,
            },
            scale: Math.round(autoScale * 100) / 100,
        });
    }, [scene, camera, url, onModelInfoUpdate, targetSize]);

    // 호버 효과
    useEffect(() => {
        if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
            const material =
                hoveredObject.material as THREE.MeshStandardMaterial;
            // 호버 색상 잠깐 끌꺼양
            // if (material.color) {
            //     material.color.setHex(0xffff00); // 노란색으로 변경
            // }
        }

        return () => {
            if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
                const material =
                    hoveredObject.material as THREE.MeshStandardMaterial;
                const originalColor = hoveredObject.userData.originalColor;
                if (material.color && originalColor) {
                    material.color.copy(originalColor);
                }
            }
        };
    }, [hoveredObject]);

    const handlePointerOver = (event: any) => {
        event.stopPropagation();
        setHoveredObject(event.object);
        document.body.style.cursor = "pointer";
    };

    const handlePointerOut = () => {
        setHoveredObject(null);
        document.body.style.cursor = "default";
    };

    const handleClick = (event: any) => {
        event.stopPropagation();
        const clickedObject = event.object;

        // InstalledDevice가 아니면 선택 해제
        if (clickedObject.userData?.type !== "installed-device") {
            onDeviceDeselect();
        }

        const objectInfo = `${clickedObject.name || "이름없음"} (타입: ${
            clickedObject.type
        })`;
        onObjectClick(objectInfo);
    };

    return (
        <primitive
            object={scene}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        />
    );
}

export default function GlbUploaderPage() {
    const {
        is2D,
        isDimensionLoading,
        isAddDeviceMode,
        selectedDeviceSerialNumber,
        // installedDevices, // GLB 페이지는 로컬 state 사용
        selectedDevice,
        hoveredDevice,
        editingDeviceId,
        isHeatmap,
        showDeviceList,
        handleToggleAddDeviceMode,
        handleSelectDevice,
        handleCloseModal,
        handleToggleDeviceListMode,
        handleDeviceClick,
        handleDeviceHover,
        handleCloseDeviceDetail,
        handleChangePosition,
        // handleDeleteDevice, // 로컬로 재정의
        // handleFocusDevice,
        handleResetCamera,
        handleToggleDimension,
        handleToggleHeatmap,
        handleSearchDeviceWithText,
    } = useWarehouseViewer();

    const fileInput = useRef<HTMLInputElement>(null);
    const orbitControlsRef = useRef<any>(null); // 카메라 포커스를 위한 ref
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);
    const [targetModelSize, setTargetModelSize] = useState<number>(50); // 목표 건물 크기 (미터)
    const [modelInfo, setModelInfo] = useState<{
        fileName: string;
        meshCount: number;
        triangleCount: number;
        size: { x: number; y: number; z: number };
        originalSize: { x: number; y: number; z: number };
        scale: number;
    } | null>(null);

    // 로컬 설치 기기 (GLB 업로더 페이지 전용 - useWarehouseViewer와 독립)
    const [installedDevices, setInstalledDevices] = useState<any[]>([]);

    // 디바이스 배치 미리보기 상태
    const [previewPosition, setPreviewPosition] =
        useState<THREE.Vector3 | null>(null);
    const [previewRotation, setPreviewRotation] = useState<THREE.Euler | null>(
        null
    );
    const [isPreviewValid, setIsPreviewValid] = useState(false);

    // 카메라 포커스용 상태
    const [focusTarget, setFocusTarget] = useState<{
        x: number;
        y: number;
        z: number;
    } | null>(null);

    // 로컬 디바이스 삭제 핸들러
    const handleDeleteDevice = (deviceId: string) => {
        const updatedDevices = installedDevices.filter(
            (device) => device.id !== deviceId
        );
        setInstalledDevices(updatedDevices);
        handleCloseDeviceDetail(); // 삭제 후 모달 닫기
    };

    // 디바이스 높이 변경 핸들러
    const handleHeightChange = (deviceId: string, newY: number) => {
        const updatedDevices = installedDevices.map((device) =>
            device.id === deviceId
                ? { ...device, position: { ...device.position, y: newY } }
                : device
        );
        setInstalledDevices(updatedDevices);
    };

    // 로컬 디바이스 포커스 핸들러 (로컬 installedDevices 사용)
    const handleFocusDeviceLocal = (deviceId: string) => {
        const device = installedDevices.find((d) => d.id === deviceId);
        if (device && device.position) {
            setFocusTarget({
                x: device.position.x,
                y: device.position.y,
                z: device.position.z,
            });
        }
    };

    const handleClick = () => {
        fileInput.current?.click();
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 기존 URL 해제 (메모리 누수 방지)
        if (modelUrl) {
            URL.revokeObjectURL(modelUrl);
        }

        // Blob URL 생성
        const url = URL.createObjectURL(file);
        setModelUrl(url);
        setFileName(file.name);
    };

    // 디바이스 배치 핸들러
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
                setInstalledDevices(updatedDevices);
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
                installedAt: new Date().toISOString(),
                status: "active" as const,
                temperature: 20 + Math.random() * 15, // POC: 20-35°C 랜덤
                humidity: 45 + Math.random() * 30, // POC: 45-75% 랜덤
            };

            const updatedDevices = [...installedDevices, newDevice];
            setInstalledDevices(updatedDevices);
        }

        // 배치 완료 후 모드 해제
        handleCloseModal();
        setPreviewPosition(null);
        setPreviewRotation(null);
    };

    return (
        <div className="flex flex-col h-full">
            {/* 업로드 버튼 */}
            <div className="flex gap-2 justify-center items-center p-4 bg-gray-100">
                <input
                    ref={fileInput}
                    className="hidden"
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleUpload}
                />
                <button
                    onClick={handleClick}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Upload GLB File
                </button>
                {/* <button
                    onClick={handleSampleGLBFile}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    sample glb file
                </button> */}

                {/* 목표 건물 크기 설정 */}
                <div className="flex gap-2 items-center ml-4">
                    <label className="text-sm text-gray-700">
                        건물 크기 calibration:
                    </label>
                    <input
                        type="number"
                        value={targetModelSize}
                        onChange={(e) =>
                            setTargetModelSize(Number(e.target.value))
                        }
                        className="px-2 py-1 w-20 text-sm rounded border"
                        min="1"
                        max="500"
                    />
                    <span className="text-sm text-gray-600">m</span>
                </div>

                {selectedObject && (
                    <div className="p-2 ml-4 text-sm bg-green-400 rounded-md">
                        선택 객체: <strong>{selectedObject}</strong>
                    </div>
                )}

                {modelUrl && (
                    <span className="ml-10 text-sm text-gray-600">
                        Model loaded ✓
                    </span>
                )}
            </div>

            {/* 3D 뷰어 */}
            <div className="relative flex-1 bg-[#EFEFEF]">
                <Controls
                    is2D={is2D}
                    isHeatmap={isHeatmap}
                    isDimensionLoading={isDimensionLoading}
                    isAddDeviceMode={isAddDeviceMode}
                    onToggleDimension={handleToggleDimension}
                    onToggleAddDeviceMode={handleToggleAddDeviceMode}
                    onToggleDeviceListMode={handleToggleDeviceListMode}
                    onToggleHeatmap={handleToggleHeatmap}
                    onResetCamera={handleResetCamera}
                    onSearchDeviceWithText={handleSearchDeviceWithText}
                />

                {modelUrl ? (
                    <Canvas
                        camera={{
                            position: [5, 5, 5],
                            fov: 50,
                            near: 0.01,
                            far: 10000,
                        }}
                    >
                        <CameraFocusController
                            focusTarget={focusTarget}
                            controlsRef={orbitControlsRef}
                        />

                        <gridHelper args={[100, 20]} />

                        <OrbitControls
                            ref={orbitControlsRef}
                            minDistance={0.1}
                            maxDistance={1000}
                            enablePan={true}
                            enabled={!isAddDeviceMode}
                        />

                        <ambientLight intensity={0.8} />
                        <directionalLight
                            position={[10, 10, 5]}
                            intensity={1}
                        />
                        <directionalLight
                            position={[-10, 10, -5]}
                            intensity={0.5}
                        />
                        <hemisphereLight intensity={0.4} />

                        <Suspense
                            fallback={
                                <CanvasLoadingSpinner message="Loading 3D Model..." />
                            }
                        >
                            <ClickableGLBModel
                                url={modelUrl}
                                onObjectClick={setSelectedObject}
                                onModelInfoUpdate={setModelInfo}
                                targetSize={targetModelSize}
                                onDeviceDeselect={handleCloseDeviceDetail}
                            />
                        </Suspense>

                        {/* 디바이스 배치 핸들러 및 미리보기 */}
                        {isAddDeviceMode && selectedDeviceSerialNumber && (
                            <>
                                <DevicePlacementHandlerGLB
                                    isAddDeviceMode={isAddDeviceMode}
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
                                    position={previewPosition}
                                    rotation={previewRotation}
                                    isValid={isPreviewValid}
                                    deviceSize={DEVICE_SIZE}
                                />
                            </>
                        )}

                        {/* 설치된 디바이스들 - 일반 크기 (건물이 스케일되었으므로) */}
                        {installedDevices.map((device) => (
                            <group key={device.id}>
                                <InstalledDevice
                                    device={device}
                                    onClick={handleDeviceClick}
                                    onDeviceHover={handleDeviceHover}
                                    isHovered={hoveredDevice?.id === device.id}
                                />
                                {selectedDevice &&
                                    selectedDevice.serialNumber ===
                                        device.serialNumber && (
                                        <>
                                            <HeightController
                                                devicePosition={device.position}
                                                onHeightChange={(newY) =>
                                                    handleHeightChange(
                                                        device.id,
                                                        newY
                                                    )
                                                }
                                            />
                                            <DiscController
                                                devicePosition={device.position}
                                            />
                                        </>
                                    )}
                            </group>
                        ))}
                    </Canvas>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        Upload a GLB file to view
                    </div>
                )}

                {/* 기기 선택 모달 */}
                {isAddDeviceMode && !selectedDeviceSerialNumber && (
                    <DeviceSelector
                        selectedDeviceTypeId={selectedDeviceSerialNumber}
                        onSelectDevice={handleSelectDevice}
                        onClose={handleCloseModal}
                        excludedSerialNumbers={installedDevices.map(
                            (device) => device.serialNumber
                        )}
                    />
                )}

                {/* 디바이스 상세 정보 모달 */}
                {selectedDevice && (
                    <DeviceDetailBox
                        device={selectedDevice}
                        onClose={handleCloseDeviceDetail}
                        onChangePosition={handleChangePosition}
                        onDelete={handleDeleteDevice}
                    />
                )}

                {installedDevices.length > 0 && (
                    <div
                        className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-in-out ${
                            showDeviceList
                                ? "opacity-100 translate-x-0 pointer-events-auto"
                                : "opacity-0 translate-x-4 pointer-events-none"
                        }`}
                    >
                        <DeviceList
                            installedDevices={installedDevices}
                            onClose={handleToggleDeviceListMode}
                            onFocusDevice={handleFocusDeviceLocal}
                        />
                    </div>
                )}
            </div>
            {modelUrl && modelInfo && (
                <div className="absolute bottom-0 left-0 z-10 p-4 rounded-lg shadow-lg bg-black/80">
                    <div className="pb-2 mb-3 text-lg font-bold text-white border-b border-white/30">
                        📦 GLB 파일 정보
                    </div>
                    <div className="space-y-2 text-sm text-white/90">
                        <div className="flex gap-4 justify-between">
                            <span className="text-white/70">파일명:</span>
                            <span className="font-mono text-blue-300">
                                {fileName || modelInfo.fileName}
                            </span>
                        </div>
                        <div className="flex gap-4 justify-between">
                            <span className="text-white/70">메시 개수:</span>
                            <span className="font-mono text-green-300">
                                {modelInfo.meshCount}개
                            </span>
                        </div>
                        <div className="flex gap-4 justify-between">
                            <span className="text-white/70">삼각형:</span>
                            <span className="font-mono text-yellow-300">
                                {modelInfo.triangleCount.toLocaleString()}개
                            </span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/20">
                            <div className="mb-1 text-white/70">원본 크기:</div>
                            <div className="pl-2 space-y-1 font-mono text-xs text-gray-400">
                                <div>X: {modelInfo.originalSize.x}m</div>
                                <div>Y: {modelInfo.originalSize.y}m</div>
                                <div>Z: {modelInfo.originalSize.z}m</div>
                            </div>
                        </div>
                        <div className="pt-2 mt-2 border-t border-white/20">
                            <div className="flex gap-4 justify-between mb-2">
                                <span className="text-white/70">
                                    적용 스케일:
                                </span>
                                <span className="font-mono text-cyan-300">
                                    {modelInfo.scale}x
                                </span>
                            </div>
                            <div className="mb-1 text-white/70">최종 크기:</div>
                            <div className="pl-2 space-y-1 font-mono text-xs text-purple-300">
                                <div>X: {modelInfo.size.x}m</div>
                                <div>Y: {modelInfo.size.y}m</div>
                                <div>Z: {modelInfo.size.z}m</div>
                            </div>
                        </div>
                        {installedDevices.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-white/20">
                                <div className="flex gap-4 justify-between">
                                    <span className="text-white/70">
                                        설치된 디바이스:
                                    </span>
                                    <span className="font-mono text-orange-300">
                                        {installedDevices.length}개
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
