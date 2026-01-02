interface DeviceSelectorProps {
  selectedDeviceTypeId: string | null;
  onSelectDevice: (deviceTypeId: string) => void;
  onClose: () => void;
}

function DeviceSelector({
  selectedDeviceTypeId,
  onSelectDevice,
  onClose,
}: DeviceSelectorProps) {
  const SNList = [
    "52751318",
    "01234567",
    "34900320",
    "34900337",
    "34900318",
    "34900229",
    "34901753",
    "34900326",
    "VC7KR13A",
    "VC7KR18F",
  ];
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 bg-white border shadow-lg rounded-lg p-4 w-64 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">기기 선택</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-600">배치할 기기를 선택하세요(Serial Number)</p>
      <div className="space-y-2">
        <select
          value={selectedDeviceTypeId || ""}
          onChange={(e) => onSelectDevice(e.target.value)}
          className="p-2 w-full rounded-lg border"
        >
          <option value="">선택하세요</option>
          {SNList.map((serialNumber) => (
            <option key={serialNumber} value={serialNumber}>
              {serialNumber}
            </option>
          ))}
        </select>
        {/* {availableDevices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelectDevice(device.id)}
            className={`w-full p-3 text-left border rounded-lg transition-colors ${
              selectedDeviceTypeId === device.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="font-medium">{device.name}</div>
            <div className="text-sm text-gray-600">{device.model}</div>
            <div className="mt-1 text-xs text-gray-500">
              {device.size.width}m × {device.size.height}m × {device.size.depth}
              m
            </div>
          </button>
        ))} */}
      </div>
      {selectedDeviceTypeId && (
        <div className="p-3 mt-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            ✓ 기기를 선택했습니다. 3D 화면에서 위치를 클릭하여 배치하세요.
          </p>
        </div>
      )}
    </div>
  );
}

export default DeviceSelector;
