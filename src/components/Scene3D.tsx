import { useRef, useMemo } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import warehouseData from "../data/warehouse-example.json";

// 예제 1: 기본 큐브 컴포넌트
function Cube() {
  return (
    <mesh position={[0, 0.5, 0]}>
      {/* geometry: 형태 정의 (박스) */}
      <boxGeometry args={[1, 1, 1]} />
      {/* material: 재질 정의 (주황색) */}
      <meshStandardMaterial color="tan" />
    </mesh>
  );
}

function AnimatedBox() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // delta만큼 회전 (프레임레이트와 무관하게 일정한 속도)
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta;

      // 비교: delta 없이 하면 프레임레이트에 따라 속도가 달라짐
      // meshRef.current.rotation.x += 0.01  // ❌ 나쁜 방법
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="royalblue" />
    </mesh>
  );
}

// 바닥 위에만 그리드를 그리는 커스텀 컴포넌트
function FloorGrid({
  length,
  width,
  centerX,
  centerZ,
  divisions = 20,
}: {
  length: number;
  width: number;
  centerX: number;
  centerZ: number;
  divisions?: number;
}) {
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const halfLength = length / 2;
    const halfWidth = width / 2;

    // X축 방향 선들 (Z축을 따라)
    for (let i = 0; i <= divisions; i++) {
      const z = (i / divisions) * width - halfWidth;
      lines.push([
        new THREE.Vector3(-halfLength, 0, z),
        new THREE.Vector3(halfLength, 0, z),
      ]);
    }

    // Z축 방향 선들 (X축을 따라)
    for (let i = 0; i <= divisions; i++) {
      const x = (i / divisions) * length - halfLength;
      lines.push([
        new THREE.Vector3(x, 0, -halfWidth),
        new THREE.Vector3(x, 0, halfWidth),
      ]);
    }

    return lines;
  }, [length, width, divisions]);

  return (
    <group position={[centerX, 0.01, centerZ]}>
      {gridLines.map((points, index) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <primitive
            key={index}
            object={
              new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: "#888888",
                  opacity: 0.5,
                  transparent: true,
                })
              )
            }
          />
        );
      })}
    </group>
  );
}

function Scene3D() {
  // JSON에서 dimensions 가져오기
  const { length, width } = warehouseData.structure.dimensions;

  // 바닥의 중심점 계산 (원점 기준으로 창고가 0,0부터 시작한다고 가정)
  const centerX = length / 2;
  const centerZ = width / 2;

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {/* Canvas: 3D 씬의 시작점 */}
      <Canvas
      // 카메라 설정 예제 (주석 해제해서 실험해보세요)
      // camera={{ position: [5, 5, 5], fov: 75 }}
      >
        {/* 조명: 없으면 아무것도 안 보임! */}
        {/* <ambientLight intensity={0.5} /> */}
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* 카메라 컨트롤: 마우스로 드래그해서 회전, 휠로 줌 */}
        <OrbitControls
          target={[centerX, 0, centerZ]}
          minDistance={10}
          maxDistance={200}
        />

        {/* 바닥: JSON의 dimensions 사용 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, centerZ]}>
          <planeGeometry args={[length, width]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>

        {/* 벽 */}
        {warehouseData.structure.walls.map((wall) => {
          const dx = wall.end[0] - wall.start[0];
          const dz = wall.end[1] - wall.start[1];
          const wallLength = Math.sqrt(dx * dx + dz * dz);
          const angle = Math.atan2(dz, dx);
          const centerX = (wall.start[0] + wall.end[0]) / 2;
          const centerZ = (wall.start[1] + wall.end[1]) / 2;
          const centerY = wall.height / 2;

          return (
            <mesh
              key={wall.id}
              position={[centerX, centerY, centerZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[wallLength, wall.height, wall.thickness]} />
              <meshStandardMaterial
                color={wall.type === "exterior" ? "#666666" : "#999999"}
              />
            </mesh>
          );
        })}

        {/* 바닥 위에만 정확히 맞는 그리드 */}
        <FloorGrid
          length={length}
          width={width}
          centerX={centerX}
          centerZ={centerZ}
          divisions={20}
        />
      </Canvas>
    </div>
  );
}

export default Scene3D;
