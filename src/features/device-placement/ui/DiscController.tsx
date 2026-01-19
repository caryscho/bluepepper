import * as THREE from "three";
interface DiscControllerProps {
    devicePosition: { x: number; y: number; z: number };
}
export default function DiscController({ devicePosition }: DiscControllerProps) {
    // RingGeometry: 도넛 모양 (가운데 구멍)
    // innerRadius: 안쪽 반지름 (구멍 크기)
    // outerRadius: 바깥쪽 반지름 (전체 크기)
    // thetaSegments: 원주 방향 세그먼트 수 (숫자가 클수록 더 부드러움)
    const discGeometry = new THREE.RingGeometry(0.3, 0.5, 32);

    return (
        <>
            <mesh 
                geometry={discGeometry} 
                position={[devicePosition.x, devicePosition.y,  devicePosition.z]}
                rotation={[-Math.PI / 2, 0, 0]} // X축으로 -90도 회전하여 바닥과 평행하게
            >
                <meshStandardMaterial color="red" side={THREE.DoubleSide} />
            </mesh>
        </>
    );
}
