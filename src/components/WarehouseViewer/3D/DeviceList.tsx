interface DeviceListProps {
    installedDevices: any[];
}

export default function DeviceList({ installedDevices }: DeviceListProps) {
    return (
        <div className="absolute right-8  top-1/2 -translate-y-1/2 z-10 bg-white border shadow-lg rounded-lg p-4 w-[380px]  max-h-[80vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-black">
                설치된 기기 목록
            </h3>
            {/* JSON 데이터 표시 (디버깅용) */}
            <details className="mb-4">
                <summary className="mb-2 text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    JSON 데이터 보기
                </summary>
                <pre className="overflow-auto p-2 mt-2 max-h-60 text-xs text-black bg-gray-100 rounded border">
                    {JSON.stringify(installedDevices, null, 2)}
                </pre>
            </details>
            {installedDevices.length === 0 ? (
                <p className="text-sm text-gray-500">설치된 기기가 없습니다.</p>
            ) : (
                <div className="space-y-2 cursor-pointer">
                    {installedDevices.map((device) => (
                        <div
                            key={device.id}
                            className="p-3 rounded-lg border hover:bg-gray-50"
                        >
                            <div className="font-medium text-black">
                                {device.serialNumber}
                            </div>
                            <div className="text-sm text-gray-600">
                                {device.attachedTo === "wall"
                                    ? "벽"
                                    : device.attachedTo === "column"
                                    ? "기둥"
                                    : "바닥"}
                                ({device.attachedToId})
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(device.installedAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
