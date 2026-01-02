import { useState } from "react";

import warehouseData from "../../data/warehouse-example.json";
import Contoller from "./DimContoller";
import ThreeDViewer from "./3D/index.tsx";
import TwoDViewer from "./2D/index.tsx";
import DeviceContoller from "./DeviceContoller.tsx";
import DeviceSelector from "./3D/DeviceSelector";
import DeviceList from "./3D/DeviceList.tsx";
import DeviceDetailModal from "./3D/DeviceDetailModal";

function WarehouseViewer() {
    // 2차원 <-> 3차원 전환 상태
    const [is2D, setIs2D] = useState(false);
    // JSON에서 dimensions 가져오기
    const { length, width } = warehouseData.structure.dimensions;
    const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);
    // 선택된 디바이스 시리얼 넘버
    const [selectedDeviceSerialNumber, setSelectedDeviceSerialNumber] =
        useState<string | null>(null);
    // 설치된 디바이스 목록 (시리얼 넘버 추출용)
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
                x: 0, // 넓은 면이 벽에 붙도록 X축으로 90도 회전
                y: Math.PI / 2,
                z: Math.PI / 2,
            },
            attachedTo: "column",
            attachedToId: "col-10",
            installedAt: "2026-01-02T07:11:10.239Z",
            status: "active",
        },
    ]);
    // 바닥의 중심점 계산 (원점 기준으로 창고가 0,0부터 시작한다고 가정)
    const centerX = length / 2;
    const centerZ = width / 2;

    // 기기 목록 모드
    const [isDeviceListMode, setIsDeviceListMode] = useState(false);
    // 선택된 디바이스 (상세 정보 모달용)
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
    // 위치 변경 중인 디바이스 ID (null이면 새로 추가, 있으면 위치 변경)
    const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
    // 모드 토글 핸들러
    const handleToggleAddDeviceMode = () => {
        // 리스트는 꺼버림
        setIsDeviceListMode(false);
        if (isAddDeviceMode) {
            // 모드 해제 시 초기화
            setSelectedDeviceSerialNumber(null);
        }
        setIsAddDeviceMode(!isAddDeviceMode);
    };

    // 디바이스 선택 핸들러
    const handleSelectDevice = (serialNumber: string) => {
        if (serialNumber === "") {
            return; // 빈 문자열이면 선택 취소하지 않음
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
        // 위치 변경 모드 활성화
        setEditingDeviceId(selectedDevice.id);
        setSelectedDeviceSerialNumber(selectedDevice.serialNumber);
        setIsAddDeviceMode(true);
        // 상세 모달 닫기
        setSelectedDevice(null);
    };

    return (
        <div className="relative" style={{ width: "100%", height: "100vh" }}>
            <Contoller is2D={is2D} onToggleDimension={() => setIs2D(!is2D)} />
            {is2D ? (
                <TwoDViewer />
            ) : (
                <ThreeDViewer
                    centerX={centerX}
                    centerZ={centerZ}
                    length={length}
                    width={width}
                    isAddDeviceMode={isAddDeviceMode}
                    selectedDeviceSerialNumber={selectedDeviceSerialNumber}
                    onCloseDeviceMode={handleCloseModal}
                    installedDevices={installedDevices}
                    onInstalledDevicesChange={setInstalledDevices}
                    onDeviceClick={handleDeviceClick}
                    editingDeviceId={editingDeviceId}
                />
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
            <DeviceContoller
                isAddDeviceMode={isAddDeviceMode}
                onToggleAddDeviceMode={handleToggleAddDeviceMode}
                onToggleDeviceListMode={handleToggleDeviceListMode}
            />
            {/* CSS transition으로 fade in/out 애니메이션 - 항상 렌더링하여 exit 애니메이션 보장 */}
            <div
                className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-in-out ${
                    isDeviceListMode
                        ? "opacity-100 translate-x-0 pointer-events-auto"
                        : "opacity-0 translate-x-4 pointer-events-none"
                }`}
            >
                <DeviceList
                    installedDevices={installedDevices}
                    onClose={handleToggleDeviceListMode}
                />
            </div>
            {/* 디바이스 상세 정보 모달 */}
            {selectedDevice && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={handleCloseDeviceDetail}
                    onChangePosition={handleChangePosition}
                />
            )}
        </div>
    );
}

export default WarehouseViewer;
