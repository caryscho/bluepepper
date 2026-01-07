import * as THREE from "three";
import { Wall } from "@/types/warehouse";

interface WallsProps {
    wall: Wall;
}

// 벽의 고정 속성: Geometry와 Material을 모듈 레벨에서 한 번만 생성하여 모든 벽이 공유
const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
const exteriorWallMaterial = new THREE.MeshStandardMaterial({
    color: "#EFEFEF",
    depthWrite: true,
});
const interiorWallMaterial = new THREE.MeshStandardMaterial({
    color: "#999999",
    depthWrite: true,
});

export default function Walls({ wall }: WallsProps) {
    const dx = wall.end[0] - wall.start[0];
    const dz = wall.end[1] - wall.start[1];
    const wallLength = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const centerX = (wall.start[0] + wall.end[0]) / 2;
    const centerZ = (wall.start[1] + wall.end[1]) / 2;
    const centerY = wall.height / 2;

    return (
        <mesh
            geometry={wallGeometry}
            material={
                wall.type === "exterior"
                    ? exteriorWallMaterial
                    : interiorWallMaterial
            }
            position={[centerX, centerY, centerZ]}
            rotation={[0, angle, 0]}
            scale={[wallLength, wall.height, wall.thickness]}
            userData={{ type: "wall", id: wall.id }}
            renderOrder={0}
        />
    );
}
