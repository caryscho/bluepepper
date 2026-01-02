interface DeviceDetailModalProps {
    device: {
        id: string;
        serialNumber: string;
        position: {
            x: number;
            y: number;
            z: number;
        };
        attachedTo?: "floor" | "wall" | "column";
        attachedToId?: string;
        installedAt: Date | string;
        status: "active" | "inactive" | "error";
        temperature?: number;
        humidity?: number;
    };
    onClose: () => void;
    onChangePosition: () => void;
}

export default function DeviceDetailModal({
    device,
    onClose,
    onChangePosition,
}: DeviceDetailModalProps) {
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
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-black">
                        디바이스 상세 정보
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-0 w-8 h-8 text-gray-500 bg-white outline-none hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 시리얼 넘버 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            시리얼 넘버
                        </label>
                        <p className="text-lg text-black">
                            {device.serialNumber}
                        </p>
                    </div>

                    {/* 상태 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            상태
                        </label>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                device.status
                            )}`}
                        >
                            {getStatusText(device.status)}
                        </span>
                    </div>

                    {/* 온도 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            온도
                        </label>
                        <p className="text-lg text-black">
                            {device.temperature !== undefined
                                ? `${device.temperature}°C`
                                : "데이터 없음"}
                        </p>
                    </div>

                    {/* 습도 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            습도
                        </label>
                        <p className="text-lg text-black">
                            {device.humidity !== undefined
                                ? `${device.humidity}%`
                                : "데이터 없음"}
                        </p>
                    </div>

                    {/* 위치 정보 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            위치
                            <span
                                onClick={onChangePosition}
                                className="ml-2 text-blue-500 cursor-pointer"
                            >
                                위치 변경
                            </span>
                        </label>
                        <p className="text-sm text-gray-600">
                            {device.attachedTo === "wall"
                                ? "벽"
                                : device.attachedTo === "column"
                                ? "기둥"
                                : "바닥"}
                            {device.attachedToId && ` (${device.attachedToId})`}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            좌표: ({device.position.x.toFixed(2)},{" "}
                            {device.position.y.toFixed(2)},{" "}
                            {device.position.z.toFixed(2)})
                        </p>
                    </div>

                    {/* 설치일 */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            설치일
                        </label>
                        <p className="text-sm text-gray-600">
                            {new Date(device.installedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
