// widgets ui
import ThreeDViewer from "@/widgets/warehouse-viewer/ui/ThreeDViewer";
import TwoDViewer from "@/widgets/warehouse-viewer/ui/TwoDViewer";

// model
import { useWarehouseViewer } from "@/widgets/warehouse-viewer/model/useWarehouseViewer.ts";

// components
import DimContoller from "@/components/WarehouseViewer/DimContoller";
import DeviceContoller from "@/components/WarehouseViewer/DeviceContoller.tsx";
import DeviceSelector from "@/components/WarehouseViewer/3D/DeviceSelector";
import DeviceList from "@/components/WarehouseViewer/3D/DeviceList.tsx";
import DeviceDetailModal from "@/components/WarehouseViewer/3D/DeviceDetailModal";

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
        handleToggleAddDeviceMode,
        handleSelectDevice,
        handleCloseModal,
        handleToggleDeviceListMode,
        handleDeviceClick,
        handleDeviceHover,
        handleCloseDeviceDetail,
        handleChangePosition,
    } = useWarehouseViewer();

    return (
        <div className="relative" style={{ width: "100%", height: "100vh" }}>
            <DimContoller is2D={is2D} onToggleDimension={() => setIs2D(!is2D)} />
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
                    onDeviceHover={handleDeviceHover}
                    hoveredDevice={hoveredDevice}
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
                    showDeviceList
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
};

export default WarehouseViewer;
