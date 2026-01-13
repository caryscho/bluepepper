import * as THREE from "three";
import { memo, useMemo } from "react";
import { Column as ColumnType } from "@/types/warehouse";

interface ColumnProps {
    column: ColumnType;
}

// 기둥의 고정 속성: Geometry와 Material을 모듈 레벨에서 한 번만 생성하여 모든 기둥이 공유
const columnGeometry = new THREE.BoxGeometry(1, 1, 1);
const columnMaterial = new THREE.MeshStandardMaterial({ color: "#CDCDCD" });

const Column = memo(function Column({ column }: ColumnProps) {
    // position과 scale을 메모이제이션
    const position = useMemo(() => 
        [column.position.x, column.height / 2, column.position.z] as [number, number, number],
        [column.position.x, column.height, column.position.z]
    );

    const scale = useMemo(() =>
        [column.size.width, column.height, column.size.depth] as [number, number, number],
        [column.size.width, column.height, column.size.depth]
    );
    return (
        <mesh
            geometry={columnGeometry}
            material={columnMaterial}
            position={position}
            scale={scale}
            userData={{ type: "column", id: column.id }}
        />
    );
});

export default Column;
