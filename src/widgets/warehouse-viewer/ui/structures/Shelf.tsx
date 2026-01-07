import * as THREE from "three";
import { Shelf as ShelfType } from "@/types/warehouse";

interface ShelfProps {
    shelf: ShelfType;
}

// 선반의 고정 속성: Geometry와 Material을 모듈 레벨에서 한 번만 생성하여 모든 선반이 공유
const poleGeometry = new THREE.BoxGeometry(1, 1, 1); // 기둥
const shelfPlateGeometry = new THREE.BoxGeometry(1, 1, 1); // 선반판
const dividerGeometry = new THREE.BoxGeometry(1, 1, 1); // 중간 구분판

const poleMaterial = new THREE.MeshStandardMaterial({ color: "#4A4A4A" }); // 기둥 - 짙은 회색
const shelfPlateMaterial = new THREE.MeshStandardMaterial({ color: "#8B7355" }); // 선반판 - 목재색
const dividerMaterial = new THREE.MeshStandardMaterial({ color: "#8B7355" }); // 구분판 - 회색

export default function Shelf({ shelf }: ShelfProps) {
    // orientation에 따른 회전 각도 (north = 0°, east = 90°, south = 180°, west = 270°)
    const rotationMap = {
        north: 0,
        east: Math.PI / 2,
        south: Math.PI,
        west: (Math.PI * 3) / 2,
    };
    const rotation = rotationMap[shelf.orientation];

    // 선반 크기
    const poleWidth = 0.05; // 기둥 두께
    const shelfThickness = 0.02; // 선반판 두께
    const dividerThickness = 0.01; // 구분판 두께

    // 4개의 기둥 위치 (모서리)
    const poles = [
        { x: -shelf.size.length / 2, z: -shelf.size.width / 2 }, // 왼쪽 앞
        { x: shelf.size.length / 2, z: -shelf.size.width / 2 }, // 오른쪽 앞
        { x: -shelf.size.length / 2, z: shelf.size.width / 2 }, // 왼쪽 뒤
        { x: shelf.size.length / 2, z: shelf.size.width / 2 }, // 오른쪽 뒤
    ];

    // 각 단의 높이 계산 (균등 분배)
    const tierHeights: number[] = [];
    for (let i = 0; i <= shelf.tiers; i++) {
        tierHeights.push((shelf.size.height / shelf.tiers) * i);
    }

    return (
        <group
            position={[shelf.position.x, 0, shelf.position.z]}
            rotation={[0, rotation, 0]}
        >
            {/* 4개의 기둥 */}
            {poles.map((pole, index) => (
                <mesh
                    key={`pole-${index}`}
                    geometry={poleGeometry}
                    material={poleMaterial}
                    position={[pole.x, shelf.size.height / 2, pole.z]}
                    scale={[poleWidth, shelf.size.height, poleWidth]}
                />
            ))}

            {/* 각 단의 선반판 */}
            {tierHeights.map((height, index) => (
                <mesh
                    key={`shelf-${index}`}
                    geometry={shelfPlateGeometry}
                    material={shelfPlateMaterial}
                    position={[0, height, 0]}
                    scale={[shelf.size.length, shelfThickness, shelf.size.width]}
                    userData={{ type: "shelf", id: shelf.id, tier: index }}
                />
            ))}

            {/* 가운데 세로 구분판 (각 단마다) */}
            {tierHeights.slice(0, -1).map((height, index) => {
                const nextHeight = tierHeights[index + 1];
                const dividerHeight = nextHeight - height;
                return (
                    <mesh
                        key={`divider-${index}`}
                        geometry={dividerGeometry}
                        material={dividerMaterial}
                        position={[0, height + dividerHeight / 2, 0]}
                        scale={[
                            dividerThickness,
                            dividerHeight,
                            shelf.size.width,
                        ]}
                    />
                );
            })}
        </group>
    );
}

