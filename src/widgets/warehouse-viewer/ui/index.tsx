// widgets ui
import SpaceThreeDViewer from "@/widgets/warehouse-viewer/ui/SpaceThreeDViewer";
import TwoDViewer from "@/widgets/warehouse-viewer/ui/SpaceTwoDViewer";

// model
import { useWarehouseViewer } from "@/widgets/warehouse-viewer/model/useWarehouseViewer.ts";

// features ui
import DeviceList from "@/features/device-list/ui/DeviceList";
import DeviceSelector from "@/features/device-placement/ui/DeviceSelector";
import DeviceDetailBox from "@/features/device-detail/ui/DeviceDetailBox";

// ui components
import Controls from "@/widgets/warehouse-viewer/ui/controls";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";

const WarehouseViewer = () => {
    const {
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
        handleToggleDimension,
        handleToggleHeatmap,
        handleSearchDeviceWithText,
    } = useWarehouseViewer();

    return (
        <div
            className="relative"
            style={{ width: "100%", height: "calc(100vh - 56px)" }}
        >
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
            {isDimensionLoading ? (
                <LoadingSpinner message="Switching dimension..." />
            ) : is2D ? (
                <TwoDViewer installedDevices={installedDevices} />
            ) : (
                <SpaceThreeDViewer
                    selectedDevice={selectedDevice}
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
                    resetCameraTrigger={resetCameraTrigger}
                    isHeatmap={isHeatmap}   
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
                <DeviceDetailBox
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
