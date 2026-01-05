import { useState, useEffect } from "react";
import warehouseData from "@/data/warehouse-example.json";

export function useWarehouseViewer() {
    // 2차원 <-> 3차원 전환 상태
    const [is2D, setIs2D] = useState(false);
    // JSON에서 dimensions 가져오기
    const { length, width } = warehouseData.structure.dimensions;
    const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);
    // 선택된 디바이스 시리얼 넘버
    const [selectedDeviceSerialNumber, setSelectedDeviceSerialNumber] =
        useState<string | null>(null);
    // 설치된 디바이스 목록
    const [installedDevices, setInstalledDevices] = useState<any[]>([
        {
            id: "device-1767337870239",
            serialNumber: "52751318(T70)",
            position: {
                x: 29.526240007844812,
                y: 8.14631127217582,
                z: 25.017180901645762,
            },
            rotation: {
                x: 0,
                y: Math.PI / 2,
                z: Math.PI / 2,
            },
            attachedTo: "column",
            attachedToId: "col-10",
            installedAt: "2026-01-02T07:11:10.239Z",
            status: "active",
        },
    ]);
    // 바닥의 중심점 계산
    const centerX = length / 2;
    const centerZ = width / 2;

    // 기기 목록 모드
    const [isDeviceListMode, setIsDeviceListMode] = useState(false);
    // 선택된 디바이스 (상세 정보 모달용)
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
    // 위치 변경 중인 디바이스 ID
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

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
        setIsDeviceListMode(false);
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
        setIsDeviceListMode(!isDeviceListMode);
    };

    // 디바이스 클릭 핸들러
    const handleDeviceClick = (device: any) => {
        setSelectedDevice(device);
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
        isDeviceListMode,
        selectedDevice,
        editingDeviceId,
        // 핸들러
        handleToggleAddDeviceMode,
        handleSelectDevice,
        handleCloseModal,
        handleToggleDeviceListMode,
        handleDeviceClick,
        handleCloseDeviceDetail,
        handleChangePosition,
    };
}

