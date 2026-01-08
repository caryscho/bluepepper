import { List } from "lucide-react";
interface DeviceContollerProps {
    is2D: boolean;
    isAddDeviceMode: boolean;
    onToggleAddDeviceMode: () => void;
    onToggleDeviceListMode: () => void;
}

function DeviceContoller({
    is2D,
    isAddDeviceMode,
    onToggleAddDeviceMode,
    onToggleDeviceListMode,
}: DeviceContollerProps) {
    return (
        <div className="flex absolute right-8 bottom-8 z-10 gap-4 p-2 text-xs text-black shadow-me">
            {!is2D && (
                <button
                    onClick={onToggleAddDeviceMode}
                    className="hover:bg-blue-200"
                >
                    {isAddDeviceMode ? "Cancel" : "Install Device"}
                </button>
            )}
            <button
                className="hover:bg-blue-200"
                onClick={onToggleDeviceListMode}
            >
                <List className="w-4 h-4" />
            </button>
        </div>
    );
}

export default DeviceContoller;
