interface ThreeDContollerProps {
  isAddDeviceMode: boolean;
  onToggleAddDeviceMode: () => void;
}

function ThreeDContoller({
  isAddDeviceMode,
  onToggleAddDeviceMode,
}: ThreeDContollerProps) {
  return (
    <div className="absolute right-8 bottom-8 z-10 p-2 border shadow-md">
      <button onClick={onToggleAddDeviceMode}>
        {isAddDeviceMode ? "Cancel" : "Add Device"}
      </button>
    </div>
  );
}

export default ThreeDContoller;
