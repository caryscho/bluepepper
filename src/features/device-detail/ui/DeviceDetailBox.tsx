import { CopyIcon } from "lucide-react";

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
    onDelete?: (deviceId: string) => void;
}

export default function DeviceDetailModal({
    device,
    onClose,
    onChangePosition,
    onDelete,
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
        <div className="absolute right-0 top-0 bg-white rounded-lg shadow-xl p-6 w-[220px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-black">
                    {device.serialNumber}
                </h2>
                <button
                    onClick={onClose}
                    className="p-0 w-8 h-8 text-gray-500 bg-white outline-none hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {/* 상태 */}
                <div className="flex gap-2 items-center">
                    <label className="block text-sm font-medium text-gray-700">
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
                <div className="flex gap-2 items-center">
                    <label className="block text-sm font-medium text-gray-700">
                        온도
                    </label>
                    <p className="text-lg text-black">
                        {device.temperature !== undefined
                            ? `${device.temperature.toFixed(1)}°C`
                            : "데이터 없음"}
                    </p>
                </div>

                {/* 습도 */}
                <div className="flex gap-2 items-center">
                    <label className="block text-sm font-medium text-gray-700">
                        습도
                    </label>
                    <p className="text-lg text-black">
                        {device.humidity !== undefined
                            ? `${device.humidity.toFixed(1)}%`
                            : "데이터 없음"}
                    </p>
                </div>

                {/* 위치 정보 */}
                <div className="">
                    <label className="block text-sm font-medium text-gray-700">
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
                <div className="">
                    <label className="block text-sm font-medium text-gray-700 shrink-0">
                        설치일
                    </label>
                    <p className="text-sm text-gray-600">
                        {new Date(device.installedAt).toLocaleString()}
                    </p>
                </div>

                {/* button area */}
                <div className="flex justify-end mt-2">
                    <button
                        onClick={() => {
                            if (onDelete) {
                                onDelete(device.id);
                            }
                        }}
                        className="px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        디바이스를 제거
                    </button>
                </div>
            </div>
        </div>
    );
}
