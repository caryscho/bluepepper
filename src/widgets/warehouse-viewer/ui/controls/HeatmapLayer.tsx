import { useMemo } from "react";
import * as THREE from "three";

export default function HeatmapLayer({
    installedDevices,
    size,
    position,
    ceilingHeight,
}: {
    installedDevices: any[];
    size: { length: number; width: number };
    position: [number, number, number];
    ceilingHeight: number;
}) {
    // 온도에 따른 색상 반환
    const getTempColor = (temperature: number) => {
        if (temperature < 15) return "#0000FF"; // 파란색
        if (temperature < 20) return "#00FFFF"; // 하늘색
        if (temperature < 25) return "#00FF00"; // 초록색
        if (temperature < 30) return "#FFFF00"; // 노란색
        return "#FF0000"; // 빨간색
    };

    // Canvas로 radial gradient 텍스처 생성
    const createGradientTexture = (temperature: number) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d")!;


        const centerColor = getTempColor(temperature);

        // ctx.fillStyle = centerColor
        // ctx.beginPath();
        // ctx.arc(256, 256, 256, 0, Math.PI * 2);
        // ctx.fill();
        // return  new THREE.CanvasTexture(canvas)
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, centerColor + "60"); // 중심: 온도 색상 (더 어둡게)
        gradient.addColorStop(0.4, centerColor + "40"); // 중간: 더 투명
        gradient.addColorStop(0.7, centerColor + "20"); // 바깥: 더욱 투명
        gradient.addColorStop(0.85, centerColor + "20"); // 바깥: 더욱 투명
        gradient.addColorStop(0.95, centerColor + "10"); // 바깥: 더욱 투명
        gradient.addColorStop(1, "transparent"); // 가장자리: 완전 투명

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        return new THREE.CanvasTexture(canvas);
    };

    return (
        <>
            {/* 천장 레이어 (배경) */}
            {/* <mesh 
                position={[position[0], (ceilingHeight - 0.1), position[2]]} 
                rotation={[-Math.PI / 2, 0, 0]} // XZ 평면으로 회전
            >
                <planeGeometry args={[size.length, size.width]} />
                <meshStandardMaterial 
                    color="#EFEFEF"
                    transparent 
                    opacity={0.2}
                    side={2} // DoubleSide: 양면 렌더링
                />
            </mesh> */}

            {/* 디바이스 위치 표시 (월드 좌표) - 그라디언트 원 */}
            {installedDevices.map((device) => {
                const radius = 8; // 실제 원형 사이즈
                const texture = useMemo(
                    () => createGradientTexture(device.temperature || 20),
                    [device.temperature]
                );

                return (
                    // rotation={[-Math.PI / 2, 0, 0]} // XZ 평면으로 회전 (평평하게) plane일땐 필요 왜죠
                    <mesh
                        key={device.id}
                        position={[
                            device.position.x,
                            ceilingHeight - 0.05, // 천장 레이어보다 약간 아래
                            device.position.z,
                        ]}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >
                        {/* <cylinderGeometry args={[radius, radius, 2, 64]} /> */}
                        <planeGeometry args={[radius * 2, radius * 2]} />
                        <meshBasicMaterial
                            map={texture}
                            transparent
                            opacity={1}
                            depthWrite={false}
                            blending={THREE.NormalBlending} // 일반 블렌딩으로 변경
                        />
                    </mesh>
                );
            })}
        </>
    );
}
