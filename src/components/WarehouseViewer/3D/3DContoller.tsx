interface ThreeDContollerProps {
  isAddDeviceMode: boolean;
  onToggleAddDeviceMode: () => void;
}

function ThreeDContoller({
  isAddDeviceMode,
  onToggleAddDeviceMode,
}: ThreeDContollerProps) {
  return (
    <div className="absolute right-8 bottom-8 z-10 p-2">
        <button onClick={onToggleAddDeviceMode} className="px-4 py-2 text-white bg-blue-500 rounded-lg">
        {isAddDeviceMode ? "Cancel" : "Add Device"}
        </button>
    </div>
  );
}

export default ThreeDContoller;
