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

    // 기기 추가 모드 상태
    const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);

    // 선택된 디바이스 시리얼 넘버
    const [selectedDeviceSerialNumber, setSelectedDeviceSerialNumber] =
        useState<string | null>(null);

    // 설치된 디바이스 목록
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
                y: Math.PI / 2,
                z: 0,
            },
            attachedTo: "column",
            attachedToId: "col-10",
            installedAt: "2026-01-02T07:11:10.239Z",
            status: "active",
        },
        {
            id: "device-01234567",
            serialNumber: "01234567(T70)",
            position: {
                x: 19.520860339199963,
                y: 9.133884921529493,
                z: 24.916233830056985,
            },
            rotation: {
                x: 0,
                y: Math.PI / 2,
                z: 0,
            },
            attachedTo: "column",
            attachedToId: "col-10",
            installedAt: "2026-01-02T07:11:10.239Z",
            status: "active",
        },
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

    // 카메라 리셋 트리거
    const [resetCameraTrigger, setResetCameraTrigger] = useState(0);

    // Apidog Mock API 호출 예시
    useEffect(() => {
        const requestOptions = {
            method: "GET",
            redirect: "follow" as RequestRedirect,
        };

        fetch(
            "http://127.0.0.1:3658/m1/1168288-1161801-1029717/device/1234567890/status",
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                console.log("API 응답:", result);
                // setInstalledDevices(result);
            })
            .catch((error) => console.log("error", error));
    }, []);

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

    // 카메라 리셋 핸들러
    const handleResetCamera = () => {
        setResetCameraTrigger((prev) => prev + 1);
    };

    return {
        // 상태
        is2D,
        setIs2D,
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
        // 핸들러
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
    };
}

