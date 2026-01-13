import { DeviceType } from "@/types/device";
import DeviceModelT1 from "./DeviceModelT1";
import DeviceModelV2 from "./DeviceModelV2";

interface DeviceModel3DProps {
    deviceType: DeviceType;
    diveSize?: {
        width: number;
        height: number;
        depth: number;
    };
    autoRotate?: boolean;
    rotationSpeed?: number;
}

/**
 * deviceType에 따라 적절한 디바이스 모델 컴포넌트를 반환하는 함수
 */
function TargetDeviceModel({
    deviceType,
    diveSize,
    autoRotate = true,
    rotationSpeed = 0.5,
}: DeviceModel3DProps) {
    const props = { deviceType, diveSize, autoRotate, rotationSpeed };

    switch (deviceType.id) {
        case "t1":
            return <DeviceModelT1 {...props} />;
        case "v2":
            return <DeviceModelV2 {...props} />;
        default:
            // 기본값으로 T1 사용
            return <DeviceModelT1 {...props} />;
    }
}
/**
 * 재사용 가능한 디바이스 3D 모델 컴포넌트
 * - DeviceType의 사이즈, 색상을 적용
 * - Y축 회전 애니메이션 지원
 * - 실제 디바이스 구조 반영 (T1 기기 기준)
 */
export default function DeviceModel3D(props: DeviceModel3DProps) {
    return <TargetDeviceModel {...props} />;
}
