import DeviceModelT1 from "@/entity/device/ui/DeviceModelT1";
import { AVAILABLE_DEVICE_TYPES } from "@/types/device";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import shippingData from "../../../data/shipping-sample.json";
import type { ShippingData } from "../../../types/shipping";

interface DeviceTiltViewerProps {
    dataIndex?: number; // tiltData 인덱스
    deltaTiltData?: {
        roll: number;
        pitch: number;
        yaw: number;
    } | null;
}

// 카메라를 고정 위치에 유지 (기기 회전을 관찰하기 위해)
function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
        // 카메라를 고정 위치에 두고 기기만 회전하도록
        camera.position.set(0, 0.05, 0.15);
        camera.rotation.set(0, 0, 0);
        camera.lookAt(0, 0, 0); // 원점을 항상 바라보도록
    }, [camera]);

    return null;
}

export default function DeviceTiltViewer({
    dataIndex = 0,
    deltaTiltData,
}: DeviceTiltViewerProps) {
    const data = shippingData as ShippingData;
    
    // deltaTiltData가 있으면 사용, 없으면 dataIndex로 계산
    let roll = 0;
    let pitch = 0;
    let yaw = 0;
    
    if (deltaTiltData) {
        // props로 직접 전달된 값 사용
        roll = deltaTiltData.roll;
        pitch = deltaTiltData.pitch;
        yaw = deltaTiltData.yaw;
    } else {
        // dataIndex로 계산 - 시작 시점(0번 인덱스) 기준
        const tiltPoint = data.tiltData[dataIndex];
        const startPoint = data.tiltData[0]; // 첫 번째 데이터 포인트를 기준으로
        roll = tiltPoint.roll - startPoint.roll;
        pitch = tiltPoint.pitch - startPoint.pitch;
        yaw = tiltPoint.yaw - startPoint.yaw;
    }

    return (
        <>
            <p className="relative ml-2 text-xs text-gray-500">
                roll: {roll} pitch: {pitch} yaw: {yaw}
            </p>
            <Canvas
                camera={{
                    position: [0, 0.05, 0.15], // 앞면을 보기 위해 Z축 앞쪽, 약간 위에서
                    fov: 50,
                }}
            >
                <CameraController />
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} />
                <DeviceModelT1
                    deviceType={AVAILABLE_DEVICE_TYPES[0]}
                    autoRotate={false}
                    roll={roll}
                    pitch={pitch}
                    yaw={yaw}
                />
            </Canvas>
        </>
    );
}
