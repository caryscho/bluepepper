import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Wall } from "@/types/warehouse";

interface InstancedWallsProps {
    walls: Wall[];
}

const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
const exteriorWallMaterial = new THREE.MeshStandardMaterial({
    color: "#EFEFEF",
    depthWrite: true,
});
const interiorWallMaterial = new THREE.MeshStandardMaterial({
    color: "#999999",
    depthWrite: true,
});

export default function InstancedWalls({ walls }: InstancedWallsProps) {
    const exteriorRef = useRef<THREE.InstancedMesh>(null);
    const interiorRef = useRef<THREE.InstancedMesh>(null);

    const exteriorWalls = walls.filter((w) => w.type === "exterior");
    const interiorWalls = walls.filter((w) => w.type === "interior");

    useEffect(() => {
        if (!exteriorRef.current || !interiorRef.current) return;

        // userData 설정
        exteriorRef.current.userData.type = "wall";
        interiorRef.current.userData.type = "wall";

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        // Exterior 벽 처리
        exteriorWalls.forEach((wall, index) => {
            const dx = wall.end[0] - wall.start[0];
            const dz = wall.end[1] - wall.start[1];
            const wallLength = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            const centerX = (wall.start[0] + wall.end[0]) / 2;
            const centerZ = (wall.start[1] + wall.end[1]) / 2;
            const centerY = wall.height / 2;

            position.set(centerX, centerY, centerZ);
            quaternion.setFromEuler(new THREE.Euler(0, angle, 0));
            scale.set(wallLength, wall.height, wall.thickness);

            matrix.compose(position, quaternion, scale);
            exteriorRef.current!.setMatrixAt(index, matrix);
        });

        // Interior 벽 처리
        interiorWalls.forEach((wall, index) => {
            const dx = wall.end[0] - wall.start[0];
            const dz = wall.end[1] - wall.start[1];
            const wallLength = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            const centerX = (wall.start[0] + wall.end[0]) / 2;
            const centerZ = (wall.start[1] + wall.end[1]) / 2;
            const centerY = wall.height / 2;

            position.set(centerX, centerY, centerZ);
            quaternion.setFromEuler(new THREE.Euler(0, angle, 0));
            scale.set(wallLength, wall.height, wall.thickness);

            matrix.compose(position, quaternion, scale);
            interiorRef.current!.setMatrixAt(index, matrix);
        });

        if (exteriorWalls.length > 0) {
            exteriorRef.current.instanceMatrix.needsUpdate = true;
        }
        if (interiorWalls.length > 0) {
            interiorRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [walls, exteriorWalls, interiorWalls]);

    return (
        <>
            {exteriorWalls.length > 0 && (
                <instancedMesh
                    ref={exteriorRef}
                    args={[wallGeometry, exteriorWallMaterial, exteriorWalls.length]}
                    frustumCulled={false}
                    renderOrder={0}
                />
            )}
            {interiorWalls.length > 0 && (
                <instancedMesh
                    ref={interiorRef}
                    args={[wallGeometry, interiorWallMaterial, interiorWalls.length]}
                    frustumCulled={false}
                    renderOrder={0}
                />
            )}
        </>
    );
}
