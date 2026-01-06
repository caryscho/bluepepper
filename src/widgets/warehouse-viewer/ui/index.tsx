// widgets ui
import ThreeDViewer from "@/widgets/warehouse-viewer/ui/ThreeDViewer";
import TwoDViewer from "@/widgets/warehouse-viewer/ui/TwoDViewer";

// model
import { useWarehouseViewer } from "@/widgets/warehouse-viewer/model/useWarehouseViewer.ts";

// features ui
import DeviceList from "@/features/device-list/ui/DeviceList";
import DeviceSelector from "@/features/device-placement/ui/DeviceSelector";
import DeviceDetailModal from "@/features/device-detail/ui/DeviceDetailModal";

// ui components
import DimContoller from "@/widgets/warehouse-viewer/ui/DimContoller";
import DeviceContoller from "@/widgets/warehouse-viewer/ui/DeviceContoller";

// types
import { DeviceType } from "@/types/device";

const WarehouseViewer = () => {
    const {
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
    } = useWarehouseViewer();

    // TODO: 실제 메타정보 소스에서 deviceType을 가져오도록 구현 필요
    const getDeviceType = (serialNumber: string): DeviceType | null => {
        // 임시 구현: serialNumber를 기반으로 deviceType을 반환
        // 실제로는 API나 메타정보 서비스에서 가져와야 함
        // 예: return deviceMetadataService.getDeviceType(serialNumber);

        // 기본값 반환 (나중에 실제 구현으로 교체)
        return {
            id: "T200-001",
            name: "T200",
            model: "T200",
            size: { width: 0.3, height: 0.2, depth: 0.05 },
            color: "#FF9800",
        };
    };

    return (
        <div className="relative" style={{ width: "100%", height: "calc(100vh - 56px)" }}>
            <DimContoller
                is2D={is2D}
                onToggleDimension={() => setIs2D(!is2D)}
            />
            <DeviceContoller
                isAddDeviceMode={isAddDeviceMode}
                onToggleAddDeviceMode={handleToggleAddDeviceMode}
                onToggleDeviceListMode={handleToggleDeviceListMode}
            />
            {is2D ? (
                <TwoDViewer
                    installedDevices={installedDevices}
                    getDeviceType={getDeviceType}
                />
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
                    onDeviceHover={handleDeviceHover}
                    hoveredDevice={hoveredDevice}
                    editingDeviceId={editingDeviceId}
                    focusTarget={focusTarget}
                    getDeviceType={getDeviceType}
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

            {/* CSS transition으로 fade in/out 애니메이션 - 항상 렌더링하여 exit 애니메이션 보장 */}
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
                    onFocusDevice={handleFocusDevice}
                />
            </div>
            {/* 디바이스 상세 정보 모달 */}
            {selectedDevice && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={handleCloseDeviceDetail}
                    onChangePosition={handleChangePosition}
                    onDelete={handleDeleteDevice}
                />
            )}
        </div>
    );
};

export default WarehouseViewer;
