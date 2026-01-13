import { useState, useEffect } from "react";
import warehouseData from "@/data/warehouse-example.json";

/**
 *
 *  warehouse model
 * 상태값
 * 핸들러
 * 훅 반환
 */

export function useWarehouseViewer() {
    // 창고 사이즈 가져오기
    const { length, width } = warehouseData.structure.dimensions;
    // 바닥의 중심점 계산
    const centerX = length / 2;
    const centerZ = width / 2;

    // 2차원 <-> 3차원 전환 상태
    const [is2D, setIs2D] = useState(false);

    // 2D/3D 전환 로딩 상태
    const [isDimensionLoading, setIsDimensionLoading] = useState(false);

    // 기기 추가 모드 상태
    const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);

    // 선택된 디바이스 시리얼 넘버
    const [selectedDeviceSerialNumber, setSelectedDeviceSerialNumber] =
        useState<string | null>(null);

    // 설치된 디바이스 목록 (POC용 온습도 데이터 포함) - 2026-01-09 업데이트
    const [installedDevices, setInstalledDevices] = useState<any[]>([
        {
            id: "device-52751318",
            serialNumber: "52751318(T70)",
            position: {
                x: 29.526240007844812,
                y: 8.14631127217582,
                z: 25.017180901645762,
            },
            rotation: {
                x: 0,
                y: 1.5707963267948966,
                z: 0,
            },
            attachedTo: "column",
            attachedToId: "col-10",
            installedAt: "2026-01-02T07:11:10.239Z",
            status: "active",
            temperature: 28.5,
            humidity: 65,
        }
    ]);

    // 기기 목록 표시 여부
    const [showDeviceList, setShowDeviceList] = useState(false);

    // 호버된 디바이스
    const [hoveredDevice, setHoveredDevice] = useState<any | null>(null);

    // 선택된 디바이스 (상세 정보 모달용)
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

    // 위치 변경 중인 디바이스 ID
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

    // 포커스할 디바이스 위치 (카메라 이동용)
    const [focusTarget, setFocusTarget] = useState<{
        x: number;
        y: number;
        z: number;
    } | null>(null);

    const [isHeatmap, setIsHeatmap] = useState(false);

    // 카메라 리셋 트리거
    const [resetCameraTrigger, setResetCameraTrigger] = useState(0);

    const handleToggleDimension = () => {
        // 이미 로딩 중이면 무시 (연속 클릭 방지)
        if (isDimensionLoading) return;

        setIsDimensionLoading(true);

        // Fiber 크래시 방지를 위한 딜레이
        setTimeout(() => {
            setIs2D(!is2D);
            // 전환 후 로딩 해제
            setTimeout(() => {
                setIsDimensionLoading(false);
            }, 300); // 전환 후 추가 딜레이
        }, 100); // 전환 전 딜레이
    };

    // 모드 토글 핸들러
    const handleToggleAddDeviceMode = () => {
        setShowDeviceList(false);
        if (isAddDeviceMode) {
            setSelectedDeviceSerialNumber(null);
        }
        setIsAddDeviceMode(!isAddDeviceMode);
    };

    // 디바이스 선택 핸들러
    const handleSelectDevice = (serialNumber: string) => {
        if (serialNumber === "") {
            return;
        }
        setSelectedDeviceSerialNumber(serialNumber);
    };

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setSelectedDeviceSerialNumber(null);
        setIsAddDeviceMode(false);
        setEditingDeviceId(null);
    };

    const handleToggleDeviceListMode = () => {
        setShowDeviceList(!showDeviceList);
    };

    // 디바이스 클릭 핸들러
    const handleDeviceClick = (device: any) => {
        setSelectedDevice(device);
        setHoveredDevice(null); // 클릭 시 hover 상태 해제
    };

    // 디바이스 호버 핸들러
    const handleDeviceHover = (device: any, isHovered: boolean) => {
        if (isHovered) {
            setHoveredDevice(device);
        } else {
            setHoveredDevice(null);
        }
    };

    // 디바이스 상세 모달 닫기
    const handleCloseDeviceDetail = () => {
        setSelectedDevice(null);
    };

    // 위치 변경 핸들러
    const handleChangePosition = () => {
        if (!selectedDevice) return;
        setEditingDeviceId(selectedDevice.id);
        setSelectedDeviceSerialNumber(selectedDevice.serialNumber);
        setIsAddDeviceMode(true);
        setSelectedDevice(null);
    };

    // 디바이스 삭제 핸들러
    const handleDeleteDevice = (deviceId: string) => {
        const updatedDevices = installedDevices.filter(
            (device) => device.id !== deviceId
        );
        setInstalledDevices(updatedDevices);
        setSelectedDevice(null); // 삭제 후 모달 닫기
    };

    // 디바이스 포커스 핸들러 (카메라를 해당 디바이스 위치로 이동)
    const handleFocusDevice = (deviceId: string) => {
        const device = installedDevices.find((d) => d.id === deviceId);
        if (device && device.position) {
            setFocusTarget({
                x: device.position.x,
                y: device.position.y,
                z: device.position.z,
            });
        }
    };

    // 시리얼넘버 검색 핸들러
    const handleSearchDeviceWithText = (serialNumber: string) => {
        const device = installedDevices.find(
            (d) => d.serialNumber === serialNumber
        );
        if (device) {
            handleFocusDevice(device.id);
        }
    };

    // 카메라 리셋 핸들러
    const handleResetCamera = () => {
        setResetCameraTrigger((prev) => prev + 1);
    };

    // 열지도 토글 핸들러
    const handleToggleHeatmap = () => {
        setIsHeatmap(!isHeatmap);
    };

    return {
        // 상태
        is2D,
        setIs2D,
        isDimensionLoading,
        length,
        width,
        centerX,
        centerZ,
        isAddDeviceMode,
        selectedDeviceSerialNumber,
        installedDevices,
        setInstalledDevices,
        showDeviceList,
        selectedDevice,
        hoveredDevice,
        editingDeviceId,
        focusTarget,
        resetCameraTrigger,
        isHeatmap,
        // 핸들러
        handleToggleDimension,
        handleToggleAddDeviceMode,
        handleSelectDevice,
        handleCloseModal,
        handleToggleDeviceListMode,
        handleDeviceClick,
        handleDeviceHover,
        handleCloseDeviceDetail,
        handleChangePosition,
        handleDeleteDevice,
        handleFocusDevice,
        handleResetCamera,
        handleToggleHeatmap,
        handleSearchDeviceWithText,
    };
}
