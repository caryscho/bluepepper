import warehouseData from "@/data/warehouse-example.json";

interface DoorProps {
    door: {
        id: string;
        wallId: string;
        position: number;
        width: number;
        height: number;
    };
}

export default function Door({ door }: DoorProps) {
    // door의 wallId로 해당 벽 찾기
    const wall = warehouseData.structure.walls.find(
        (w) => w.id === door.wallId
    );
    if (!wall) return null;

    // 벽의 방향 벡터 계산
    const dx = wall.end[0] - wall.start[0];
    const dz = wall.end[1] - wall.start[1];
    const angle = Math.atan2(dz, dx);

    // 문의 위치 계산 (벽을 따라 position(0-1)을 실제 좌표로 변환)
    const doorX = wall.start[0] + (wall.end[0] - wall.start[0]) * door.position;
    const doorZ = wall.start[1] + (wall.end[1] - wall.start[1]) * door.position;
    const doorY = door.height / 2;

    // 벽의 두께를 고려해서 문을 벽 앞에 배치 (벽의 두께/2 + 약간의 여유)
    const offsetDistance = wall.thickness / 2 + 0.01;
    const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
    const offsetZ = Math.sin(angle + Math.PI / 2) * offsetDistance;

    return (
        <mesh
            position={[doorX + offsetX, doorY, doorZ + offsetZ]}
            rotation={[0, angle, 0]}
        >
            <boxGeometry args={[door.width, door.height, 0.1]} />
            <meshStandardMaterial color="#8B4513" />
        </mesh>
    );
}
