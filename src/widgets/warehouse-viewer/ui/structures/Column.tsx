import * as THREE from "three";
import { Column as ColumnType } from "@/types/warehouse";

interface ColumnProps {
    column: ColumnType;
}

// 기둥의 고정 속성: Geometry와 Material을 모듈 레벨에서 한 번만 생성하여 모든 기둥이 공유
const columnGeometry = new THREE.BoxGeometry(1, 1, 1);
const columnMaterial = new THREE.MeshStandardMaterial({ color: "#CDCDCD" });

export default function Column({ column }: ColumnProps) {
    return (
        <mesh
            geometry={columnGeometry}
            material={columnMaterial}
            position={[column.position.x, column.height / 2, column.position.z]}
            scale={[column.size.width, column.height, column.size.depth]}
            userData={{ type: "column", id: column.id }}
        />
    );
}
