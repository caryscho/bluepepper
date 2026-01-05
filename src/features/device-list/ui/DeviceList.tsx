import { X } from "lucide-react";
interface DeviceListProps {
    installedDevices: any[];
    onClose: () => void;
}

export default function DeviceList({
    installedDevices,
    onClose,
}: DeviceListProps) {
    // 상태별 색상
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-green-600 bg-green-50";
            case "inactive":
                return "text-yellow-600 bg-yellow-50";
            case "error":
                return "text-red-600 bg-red-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "정상";
            case "inactive":
                return "경고";
            case "error":
                return "오류";
            default:
                return status;
        }
    };
    return (
        <div className="bg-white border shadow-lg rounded-lg p-4 w-[380px] max-h-[80vh] overflow-y-auto">
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
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 bg-white"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                    {installedDevices.map((device) => (
                        <div
                            key={device.id}
                            className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50"
                        >
                            <div>
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
                                    {new Date(
                                        device.installedAt
                                    ).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            device.status
                                        )}`}
                                    >
                                        {getStatusText(device.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
