import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Shelf as ShelfType } from "@/types/warehouse";

interface InstancedShelvesProps {
    shelves: ShelfType[];
}

const poleGeometry = new THREE.BoxGeometry(1, 1, 1);
const shelfPlateGeometry = new THREE.BoxGeometry(1, 1, 1);
const dividerGeometry = new THREE.BoxGeometry(1, 1, 1);

const poleMaterial = new THREE.MeshStandardMaterial({ color: "#CDCDCD" });
const shelfPlateMaterial = new THREE.MeshStandardMaterial({ color: "#CDCDCD" });
const dividerMaterial = new THREE.MeshStandardMaterial({ color: "#CDCDCD" });

export default function InstancedShelves({ shelves }: InstancedShelvesProps) {
    const polesRef = useRef<THREE.InstancedMesh>(null);
    const platesRef = useRef<THREE.InstancedMesh>(null);
    const dividersRef = useRef<THREE.InstancedMesh>(null);

    const poleWidth = 0.05;
    const shelfThickness = 0.02;
    const dividerThickness = 0.01;

    const rotationMap = {
        north: 0,
        east: Math.PI / 2,
        south: Math.PI,
        west: (Math.PI * 3) / 2,
    };

    // 총 개수 계산
    const totalPoles = shelves.length * 4;
    const totalPlates = shelves.reduce((sum, shelf) => sum + (shelf.tiers + 1), 0);
    const totalDividers = shelves.reduce((sum, shelf) => sum + shelf.tiers, 0);

    useEffect(() => {
        if (!polesRef.current || !platesRef.current || !dividersRef.current) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        let poleIndex = 0;
        let plateIndex = 0;
        let dividerIndex = 0;

        shelves.forEach((shelf) => {
            const rotation = rotationMap[shelf.orientation];
            const shelfQuat = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(0, rotation, 0)
            );

            // 기둥 4개
            const polePositions = [
                { x: -shelf.size.length / 2, z: -shelf.size.width / 2 },
                { x: shelf.size.length / 2, z: -shelf.size.width / 2 },
                { x: -shelf.size.length / 2, z: shelf.size.width / 2 },
                { x: shelf.size.length / 2, z: shelf.size.width / 2 },
            ];

            polePositions.forEach((polePos) => {
                const localPos = new THREE.Vector3(polePos.x, shelf.size.height / 2, polePos.z);
                localPos.applyQuaternion(shelfQuat);
                
                position.set(
                    shelf.position.x + localPos.x,
                    localPos.y,
                    shelf.position.z + localPos.z
                );
                scale.set(poleWidth, shelf.size.height, poleWidth);
                matrix.compose(position, shelfQuat, scale);
                polesRef.current!.setMatrixAt(poleIndex++, matrix);
            });

            // 선반판
            const tierHeights: number[] = [];
            for (let i = 0; i <= shelf.tiers; i++) {
                tierHeights.push((shelf.size.height / shelf.tiers) * i);
            }

            tierHeights.forEach((height) => {
                position.set(shelf.position.x, height, shelf.position.z);
                scale.set(shelf.size.length, shelfThickness, shelf.size.width);
                matrix.compose(position, shelfQuat, scale);
                platesRef.current!.setMatrixAt(plateIndex++, matrix);
            });

            // 구분판
            tierHeights.slice(0, -1).forEach((height, index) => {
                const nextHeight = tierHeights[index + 1];
                const dividerHeight = nextHeight - height;
                
                position.set(shelf.position.x, height + dividerHeight / 2, shelf.position.z);
                scale.set(dividerThickness, dividerHeight, shelf.size.width);
                matrix.compose(position, shelfQuat, scale);
                dividersRef.current!.setMatrixAt(dividerIndex++, matrix);
            });
        });

        polesRef.current.instanceMatrix.needsUpdate = true;
        platesRef.current.instanceMatrix.needsUpdate = true;
        dividersRef.current.instanceMatrix.needsUpdate = true;
    }, [shelves]);

    return (
        <>
            <instancedMesh 
                ref={polesRef} 
                args={[poleGeometry, poleMaterial, totalPoles]}
                frustumCulled={false}
            />
            <instancedMesh 
                ref={platesRef} 
                args={[shelfPlateGeometry, shelfPlateMaterial, totalPlates]}
                frustumCulled={false}
            />
            <instancedMesh 
                ref={dividersRef} 
                args={[dividerGeometry, dividerMaterial, totalDividers]}
                frustumCulled={false}
            />
        </>
    );
}
