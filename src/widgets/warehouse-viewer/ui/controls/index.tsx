import DimensionToggle from "./DimensionToggle";
import CenterModel from "./CenterModel";
import DeviceContoller from "./DeviceContoller";
import Heatmap from "./Heatmap";

interface ControlsProps {
    is2D: boolean;
    isDimensionLoading: boolean;
    isAddDeviceMode: boolean;
    onToggleDimension: () => void;
    onToggleAddDeviceMode: () => void;
    onToggleDeviceListMode: () => void;
    onResetCamera: () => void;
}

const Controls = ({
    is2D,
    isDimensionLoading,
    isAddDeviceMode,
    onToggleDimension,
    onToggleAddDeviceMode,
    onToggleDeviceListMode,
    onResetCamera,
}: ControlsProps) => {
    return (
        <>
            <div className="flex absolute bottom-8 left-8 z-10 flex-col gap-2 p-2 text-xs text-black shadow-me">
                <Heatmap />
                <CenterModel onResetCamera={onResetCamera} />
                <DimensionToggle
                    is2D={is2D}
                    isDimensionLoading={isDimensionLoading}
                    onToggleDimension={onToggleDimension}
                />
            </div>
            <DeviceContoller
                is2D={is2D}
                isAddDeviceMode={isAddDeviceMode}
                onToggleAddDeviceMode={onToggleAddDeviceMode}
                onToggleDeviceListMode={onToggleDeviceListMode}
            />
        </>
    );
};

export default Controls;
