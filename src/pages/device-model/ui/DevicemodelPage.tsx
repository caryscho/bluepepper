import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AVAILABLE_DEVICE_TYPES } from "@/types/device";
import DeviceModel3D from "@/entity/device/ui/DeviceModel3D";

/**
 * 디바이스 모델 페이지
 * - 모든 디바이스 타입을 그리드로 표시
 * - 각 모델은 자동으로 회전
 */
export default function DevicemodelPage() {
    return (
        <div className="p-8 w-full h-full bg-gray-50">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">
                Device Models
            </h1>
            {/* 개발용 */}
            {/* <Canvas
                camera={{
                    position: [0.15, 0.15, 0.15],
                    fov: 50,
                }}
                gl={{ antialias: true }}
            >
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.8} />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    enableRotate={true}
                    minDistance={0.05}
                    maxDistance={0.5}
                />
                <DeviceModel3D
                    deviceType={AVAILABLE_DEVICE_TYPES[0]}
                    diveSize={{ width: 0.065, height: 0.115, depth: 0.02 }}
                    autoRotate={false}
                />
            </Canvas> */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {AVAILABLE_DEVICE_TYPES.map((deviceType) => (
                    <DeviceModelCard
                        key={deviceType.id}
                        deviceType={deviceType}
                    />
                ))}
            </div>
        </div>
    );
}

interface DeviceModelCardProps {
    deviceType: (typeof AVAILABLE_DEVICE_TYPES)[number];
}

/* 일단 여기다 구현 카드 아이템 */
function DeviceModelCard({ deviceType }: DeviceModelCardProps) {
    return (
        <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
            <div className="overflow-hidden mb-4 h-72 bg-gradient-to-b from-gray-100 to-gray-300 rounded-lg">
                <Canvas
                    camera={{
                        position: [0.15, 0.15, 0.15],
                        fov: 50,
                    }}
                    gl={{ antialias: true }}
                >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <pointLight position={[-5, -5, -5]} intensity={0.5} />
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        enableRotate={true}
                        minDistance={0.05}
                        maxDistance={0.5}
                    />
                    {/* 디폴트 디바이스 바디 */}
                    <DeviceModel3D deviceType={deviceType} autoRotate={true} />
                </Canvas>
            </div>
            {/* info */}
            <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                    {deviceType.name}
                </h3>
                <p className="mb-2 text-sm text-gray-600">{deviceType.model}</p>
                <div className="space-y-1 text-xs text-gray-500">
                    <p>
                        규격: {deviceType.size.width * 100} × {deviceType.size.height * 100}{" "}
                        × {deviceType.size.depth * 100}
                    </p>
                    <p>배터리 수명: {deviceType.battery}</p>
                </div>
            </div>
        </div>
    );
}
