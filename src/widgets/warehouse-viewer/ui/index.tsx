// widgets ui
import SpaceThreeDViewer from "@/widgets/warehouse-viewer/ui/SpaceThreeDViewer";
import TwoDViewer from "@/widgets/warehouse-viewer/ui/SpaceTwoDViewer";

// model
import { useWarehouseViewer } from "@/widgets/warehouse-viewer/model/useWarehouseViewer.ts";

// features ui
import DeviceList from "@/features/device-list/ui/DeviceList";
import DeviceSelector from "@/features/device-placement/ui/DeviceSelector";
import DeviceDetailModal from "@/features/device-detail/ui/DeviceDetailModal";

// ui components
import Controls from "@/widgets/warehouse-viewer/ui/controls";

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

    return (
        <div
            className="relative"
            style={{ width: "100%", height: "calc(100vh - 56px)" }}
        >
            <Controls
                is2D={is2D}
                isAddDeviceMode={isAddDeviceMode}
                onToggleDimension={() => setIs2D(!is2D)}
                onToggleAddDeviceMode={handleToggleAddDeviceMode}
                onToggleDeviceListMode={handleToggleDeviceListMode}
            />
            {is2D ? (
                <TwoDViewer installedDevices={installedDevices} />
            ) : (
                <SpaceThreeDViewer
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
