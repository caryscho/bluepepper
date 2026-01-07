import * as THREE from "three";
import { Door, Wall } from "@/types/warehouse";

interface HumanProps {
    door: Door;
    wall: Wall;
}

// 사람의 고정 속성: Geometry와 Material을 모듈 레벨에서 한 번만 생성
const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 16);
const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const skinMaterial = new THREE.MeshStandardMaterial({ color: "#FFDBAC" });

export default function Human({ door, wall }: HumanProps) {
    const dx = wall.end[0] - wall.start[0];
    const dz = wall.end[1] - wall.start[1];
    const angle = Math.atan2(dz, dx);

    // 문의 위치 계산
    const doorX =
        wall.start[0] + (wall.end[0] - wall.start[0]) * door.position;
    const doorZ =
        wall.start[1] + (wall.end[1] - wall.start[1]) * door.position;

    // 벽의 두께를 고려한 문의 위치
    const offsetDistance = wall.thickness / 2 + 0.01;
    const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
    const offsetZ = Math.sin(angle + Math.PI / 2) * offsetDistance;

    // 문 앞에 사람 배치 (문에서 1.5m 떨어진 위치)
    const personDistance = 1.5;
    const personOffsetX = Math.cos(angle + Math.PI / 2) * personDistance;
    const personOffsetZ = Math.sin(angle + Math.PI / 2) * personDistance;

    // 두 명의 사람 (1.8m와 1.6m, 몸통+머리 합쳐서)
    const headHeight = 0.2; // 머리 높이
    const people = [
        {
            totalHeight: 1.8,
            bodyHeight: 1.8 - headHeight,
            offset: -0.8,
        }, // 왼쪽
        {
            totalHeight: 1.6,
            bodyHeight: 1.6 - headHeight,
            offset: 0.8,
        }, // 오른쪽
    ];

    return (
        <group>
            {people.map((person, index) => {
                // 사람을 나란히 배치 (문의 방향에 수직으로)
                const sideOffsetX = Math.cos(angle) * person.offset;
                const sideOffsetZ = Math.sin(angle) * person.offset;

                return (
                    <group
                        key={`person-${index}`}
                        position={[
                            doorX + offsetX + personOffsetX + sideOffsetX,
                            person.totalHeight / 2,
                            doorZ + offsetZ + personOffsetZ + sideOffsetZ,
                        ]}
                        rotation={[0, angle + Math.PI / 2, 0]}
                    >
                        {/* 몸통 */}
                        <mesh
                            geometry={bodyGeometry}
                            material={skinMaterial}
                            position={[
                                0,
                                -(person.totalHeight - person.bodyHeight) / 2,
                                0,
                            ]}
                            scale={[1, person.bodyHeight, 1]}
                        />
                        {/* 머리 */}
                        <mesh
                            geometry={headGeometry}
                            material={skinMaterial}
                            position={[
                                0,
                                person.bodyHeight / 2 + headHeight / 2,
                                0,
                            ]}
                        />
                    </group>
                );
            })}
        </group>
    );
}

