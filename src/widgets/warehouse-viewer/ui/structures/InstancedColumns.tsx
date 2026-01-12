import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Column as ColumnType } from "@/types/warehouse";

interface InstancedColumnsProps {
    columns: ColumnType[];
}

export default function InstancedColumns({ columns }: InstancedColumnsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    useEffect(() => {
        if (!meshRef.current) return;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        columns.forEach((column, index) => {
            // 위치
            position.set(
                column.position.x,
                column.height / 2,
                column.position.z
            );

            // 스케일
            scale.set(
                column.size.width,
                column.height,
                column.size.depth
            );

            // Matrix 생성
            matrix.compose(position, quaternion, scale);
            
            // 인스턴스에 적용
            meshRef.current!.setMatrixAt(index, matrix);

            // userData도 설정 가능 (클릭 감지용)
            meshRef.current!.setColorAt(index, new THREE.Color("#CDCDCD"));
        });

        // 필수! 업데이트 알림
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [columns]);

    return (
        <instancedMesh 
            ref={meshRef} 
            args={[undefined, undefined, columns.length]}
            frustumCulled={false} // frustum culling 비활성화
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#CDCDCD" />
        </instancedMesh>
    );
}
