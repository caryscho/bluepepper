import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import warehouseData from "../../../data/warehouse-example.json";
import * as THREE from "three";
import { useMemo, useState } from "react";
import ThreeDContoller from "./3DContoller";
import DeviceSelector from "./DeviceSelector";
import DevicePreview from "./DevicePreview";
import DevicePlacementHandler from "./DevicePlacementHandler";
import { AVAILABLE_DEVICE_TYPES, DeviceType } from "../../../types/device";
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
function ThreeDViewer({
  centerX,
  centerZ,
  length,
  width,
}: {
  centerX: number;
  centerZ: number;
  length: number;
  width: number;
}) {
  // 디바이스 추가 모드 상태
  const [isAddDeviceMode, setIsAddDeviceMode] = useState(false);
  // 선택된 디바이스 타입
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<string | null>(null);
  // 미리보기 위치
  const [previewPosition, setPreviewPosition] = useState<THREE.Vector3 | null>(null);
  const [isPreviewValid, setIsPreviewValid] = useState(false);
  // 설치된 디바이스 목록 (나중에 상태 관리로 이동)
  const [installedDevices, setInstalledDevices] = useState<any[]>([]);

  const selectedDeviceType = selectedDeviceTypeId
    ? AVAILABLE_DEVICE_TYPES.find((d) => d.id === selectedDeviceTypeId) || null
    : null;

  // 디바이스 배치 핸들러
  const handlePlaceDevice = (position: THREE.Vector3, deviceType: DeviceType) => {
    // 시리얼 넘버 입력 받기 (간단하게 prompt 사용, 나중에 모달로 변경)
    const serialNumber = prompt(`기기 시리얼 넘버를 입력하세요:\n${deviceType.name} (${deviceType.model})`);
    if (!serialNumber) return;

    const newDevice = {
      id: `device-${Date.now()}`,
      deviceTypeId: deviceType.id,
      serialNumber,
      position: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      attachedTo: "floor" as const,
      installedAt: new Date(),
      status: "active" as const,
    };

    setInstalledDevices([...installedDevices, newDevice]);
    // 배치 완료 후 모드 해제
    setIsAddDeviceMode(false);
    setSelectedDeviceTypeId(null);
    setPreviewPosition(null);
  };

  // 모드 토글 시 선택 초기화
  const handleToggleMode = () => {
    if (isAddDeviceMode) {
      // 모드 해제 시 초기화
      setSelectedDeviceTypeId(null);
      setPreviewPosition(null);
    }
    setIsAddDeviceMode(!isAddDeviceMode);
  };

  return (
    <div className="relative w-full h-full">
      {/* 기기 선택 사이드바 */}
      {isAddDeviceMode && (
        <DeviceSelector
          selectedDeviceTypeId={selectedDeviceTypeId}
          onSelectDevice={setSelectedDeviceTypeId}
          onClose={handleToggleMode}
        />
      )}

      <ThreeDContoller
        isAddDeviceMode={isAddDeviceMode}
        onToggleAddDeviceMode={handleToggleMode}
      />
      <Canvas
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
          enabled={!isAddDeviceMode || !selectedDeviceType} // 기기 배치 모드일 때는 컨트롤 비활성화
        />

        {/* 디바이스 배치 핸들러 */}
        {isAddDeviceMode && selectedDeviceType && (
          <DevicePlacementHandler
            isAddDeviceMode={isAddDeviceMode}
            selectedDeviceType={selectedDeviceType}
            onPlaceDevice={handlePlaceDevice}
            onPreviewPositionChange={(pos, isValid) => {
              setPreviewPosition(pos);
              setIsPreviewValid(isValid);
            }}
            floorCenter={{ x: centerX, z: centerZ }}
            floorSize={{ length, width }}
          />
        )}

        {/* 디바이스 미리보기 */}
        {isAddDeviceMode && selectedDeviceType && (
          <DevicePreview
            deviceType={selectedDeviceType}
            position={previewPosition}
            isValid={isPreviewValid}
          />
        )}

        {/* 설치된 디바이스들 */}
        {installedDevices.map((device) => {
          const deviceType = AVAILABLE_DEVICE_TYPES.find(
            (d) => d.id === device.deviceTypeId
          );
          if (!deviceType) return null;

          return (
            <mesh
              key={device.id}
              position={[device.position.x, device.position.y, device.position.z]}
            >
              <boxGeometry
                args={[
                  deviceType.size.width,
                  deviceType.size.height,
                  deviceType.size.depth,
                ]}
              />
              <meshStandardMaterial color={deviceType.color} />
            </mesh>
          );
        })}

        {/* 바닥: JSON의 dimensions 사용 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, centerZ]}>
          <planeGeometry args={[length, width]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>

        {/* 기둥들 (Columns) */}
        {warehouseData.structure.columns.map((column) => (
          <mesh
            key={column.id}
            position={[column.position.x, column.height / 2, column.position.z]}
          >
            <boxGeometry
              args={[column.size.width, column.height, column.size.depth]}
            />
            <meshStandardMaterial color="#888888" />
          </mesh>
        ))}

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

        {/* 문 */}
        {warehouseData.structure.doors.map((door) => {
          // door의 wallId로 해당 벽 찾기
          const wall = warehouseData.structure.walls.find(
            (w) => w.id === door.wallId
          );
          if (!wall) return null;

          // 벽의 방향 벡터 계산
          const dx = wall.end[0] - wall.start[0];
          const dz = wall.end[1] - wall.start[1];
          const wallLength = Math.sqrt(dx * dx + dz * dz);
          const angle = Math.atan2(dz, dx);

          // 문의 위치 계산 (벽을 따라 position(0-1)을 실제 좌표로 변환)
          const doorX =
            wall.start[0] + (wall.end[0] - wall.start[0]) * door.position;
          const doorZ =
            wall.start[1] + (wall.end[1] - wall.start[1]) * door.position;
          const doorY = door.height / 2;

          // 벽의 두께를 고려해서 문을 벽 앞에 배치 (벽의 두께/2 + 약간의 여유)
          const offsetDistance = wall.thickness / 2 + 0.01;
          const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
          const offsetZ = Math.sin(angle + Math.PI / 2) * offsetDistance;

          return (
            <mesh
              key={door.id}
              position={[doorX + offsetX, doorY, doorZ + offsetZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[door.width, door.height, 0.1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          );
        })}

        {/* 창문 */}
        {warehouseData.structure.windows.map((window) => {
          // window의 wallId로 해당 벽 찾기
          const wall = warehouseData.structure.walls.find(
            (w) => w.id === window.wallId
          );
          if (!wall) return null;

          // 벽의 방향 벡터 계산
          const dx = wall.end[0] - wall.start[0];
          const dz = wall.end[1] - wall.start[1];
          const angle = Math.atan2(dz, dx);

          // 창문의 위치 계산 (벽을 따라 position(0-1)을 실제 좌표로 변환)
          const windowX =
            wall.start[0] + (wall.end[0] - wall.start[0]) * window.position;
          const windowZ =
            wall.start[1] + (wall.end[1] - wall.start[1]) * window.position;
          // yPosition은 바닥에서의 높이, 창문의 중심은 yPosition + height/2
          const windowY = window.yPosition + window.height / 2;

          // 벽의 두께를 고려해서 창문을 벽 앞에 배치 (벽의 두께/2 + 약간의 여유)
          const offsetDistance = wall.thickness / 2 + 0.01;
          const offsetX = Math.cos(angle + Math.PI / 2) * offsetDistance;
          const offsetZ = Math.sin(angle + Math.PI / 2) * offsetDistance;

          return (
            <mesh
              key={window.id}
              position={[windowX + offsetX, windowY, windowZ + offsetZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[window.width, window.height, 0.05]} />
              <meshStandardMaterial color="#87CEEB" opacity={0.6} transparent />
            </mesh>
          );
        })}

        {/* 인간 사이즈 오브젝트 (첫 번째 문 앞에 배치) */}
        {(() => {
          const firstDoor = warehouseData.structure.doors[0]; // door-main-loading
          if (!firstDoor) return null;

          const wall = warehouseData.structure.walls.find(
            (w) => w.id === firstDoor.wallId
          );
          if (!wall) return null;

          const dx = wall.end[0] - wall.start[0];
          const dz = wall.end[1] - wall.start[1];
          const angle = Math.atan2(dz, dx);

          // 문의 위치 계산
          const doorX =
            wall.start[0] + (wall.end[0] - wall.start[0]) * firstDoor.position;
          const doorZ =
            wall.start[1] + (wall.end[1] - wall.start[1]) * firstDoor.position;

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
            { totalHeight: 1.8, bodyHeight: 1.8 - headHeight, offset: -0.8 }, // 왼쪽
            { totalHeight: 1.6, bodyHeight: 1.6 - headHeight, offset: 0.8 }, // 오른쪽
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
                      position={[
                        0,
                        -(person.totalHeight - person.bodyHeight) / 2,
                        0,
                      ]}
                    >
                      <cylinderGeometry
                        args={[0.2, 0.2, person.bodyHeight, 16]}
                      />
                      <meshStandardMaterial color="#FFDBAC" />
                    </mesh>
                    {/* 머리 */}
                    <mesh
                      position={[0, person.bodyHeight / 2 + headHeight / 2, 0]}
                    >
                      <sphereGeometry args={[0.15, 16, 16]} />
                      <meshStandardMaterial color="#FFDBAC" />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })()}

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

export default ThreeDViewer;
