import DimensionToggle from "./DimensionToggle";
import DeviceContoller from "./DeviceContoller";

interface ControlsProps {
    is2D: boolean;
    isAddDeviceMode: boolean;
    onToggleDimension: () => void;
    onToggleAddDeviceMode: () => void;
    onToggleDeviceListMode: () => void;
}

const Controls = ({
    is2D,
    isAddDeviceMode,
    onToggleDimension,
    onToggleAddDeviceMode,
    onToggleDeviceListMode,
}: ControlsProps) => {
    return (
        <>
            <DimensionToggle is2D={is2D} onToggleDimension={onToggleDimension} />
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
