import { useState } from "react";

import warehouseData from "../../data/warehouse-example.json";
import Contoller from "./DimContoller";
import ThreeDViewer from "./3D/index.tsx";
import TwoDViewer from "./2D/index.tsx";
import DeviceContoller from "./DeviceContoller.tsx";
import DeviceSelector from "./3D/DeviceSelector";

function WarehouseViewer() {
    // 2차원 <-> 3차원 전환 상태
    const [is2D, setIs2D] = useState(false);
    // JSON에서 dimensions 가져오기
    const { length, width } = warehouseData.structure.dimensions;
    const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);
    // 선택된 디바이스 시리얼 넘버
    const [selectedDeviceSerialNumber, setSelectedDeviceSerialNumber] =
        useState<string | null>(null);
    // 바닥의 중심점 계산 (원점 기준으로 창고가 0,0부터 시작한다고 가정)
    const centerX = length / 2;
    const centerZ = width / 2;
    const [isDeviceListMode, setIsDeviceListMode] = useState(false);
    // 모드 토글 핸들러
    const handleToggleAddDeviceMode = () => {
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
    };

    const handleToggleDeviceListMode = () => {
        setIsDeviceListMode(!isDeviceListMode);
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
                />
            )}
            {/* 기기 선택 모달 */}
            {isAddDeviceMode && !selectedDeviceSerialNumber && (
                <DeviceSelector
                    selectedDeviceTypeId={selectedDeviceSerialNumber}
                    onSelectDevice={handleSelectDevice}
                    onClose={handleCloseModal}
                />
            )}
            <DeviceContoller
                isAddDeviceMode={isAddDeviceMode}
                onToggleAddDeviceMode={handleToggleAddDeviceMode}
                onToggleDeviceListMode={handleToggleDeviceListMode}
            />
        </div>
    );
}

export default WarehouseViewer;
