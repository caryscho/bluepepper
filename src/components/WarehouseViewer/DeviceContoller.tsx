import { List } from "lucide-react";
interface ThreeDContollerProps {
    isAddDeviceMode: boolean;
    onToggleAddDeviceMode: () => void;
    onToggleDeviceListMode: () => void;
}

function ThreeDContoller({
    isAddDeviceMode,
    onToggleAddDeviceMode,
    onToggleDeviceListMode,
}: ThreeDContollerProps) {
    return (
        <div className="flex absolute right-8 bottom-8 z-10 gap-4 p-2">
            <button
                onClick={onToggleAddDeviceMode}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg"
            >
                {isAddDeviceMode ? "Cancel" : "Add Device"}
            </button>
            <button className="px-4 py-2 text-white bg-blue-500 rounded-lg" onClick={onToggleDeviceListMode}>
                <List />
            </button>
        </div>
    );
}

export default ThreeDContoller;
