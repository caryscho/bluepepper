import { useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import warehouseData from "@/data/warehouse-example.json";

// 2D 그리드 컴포넌트
function FloorGrid2D({
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
				new THREE.Vector3(-halfLength, 0.01, z),
				new THREE.Vector3(halfLength, 0.01, z),
			]);
		}

		// Z축 방향 선들 (X축을 따라)
		for (let i = 0; i <= divisions; i++) {
			const x = (i / divisions) * length - halfLength;
			lines.push([
				new THREE.Vector3(x, 0.01, -halfWidth),
				new THREE.Vector3(x, 0.01, halfWidth),
			]);
		}

		return lines;
	}, [length, width, divisions]);

	return (
		<group position={[centerX, 0, centerZ]}>
			{gridLines.map((points, index) => {
				const geometry = new THREE.BufferGeometry().setFromPoints(
					points
				);
				return (
					<primitive
						key={index}
						object={
							new THREE.Line(
								geometry,
								new THREE.LineBasicMaterial({
									color: "#e5e7eb",
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

// 카메라 고정 컴포넌트
function CameraLock() {
	const { camera } = useThree();

	useEffect(() => {
		// 위에서 정확히 내려다보는 각도로 카메라 고정
		const centerX = warehouseData.structure.dimensions.length / 2;
		const centerZ = warehouseData.structure.dimensions.width / 2;
		const cameraHeight =
			Math.max(
				warehouseData.structure.dimensions.length,
				warehouseData.structure.dimensions.width
			) * 1.5;

		camera.position.set(centerX, cameraHeight, centerZ);
		camera.lookAt(centerX, 0, centerZ);
		camera.updateProjectionMatrix();
	}, [camera]);

	return null;
}

// 2D 디바이스 마커 컴포넌트 (삼각형 마커)
function Device2D({ device }: { device: any }) {
	// 3D 위치를 2D로 변환: x, z는 그대로 사용, y는 0.05로 고정 (눈에 잘 보이도록)
	const position = [device.position.x, 0.05, device.position.z] as [
		number,
		number,
		number
	];

	// 상태별 색상 (빨강/파랑)
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "#52a0ff"; // 파란색
			case "inactive":
				return "#f59e0b"; // 노란색
			case "error":
				return "#ef4444"; // 빨간색
			default:
				return "#6b7280"; // 회색
		}
	};

	// 마커 크기 (눈에 잘 보이는 크기로 설정)
	const markerSize = 1.5; // 1미터 크기로 충분히 크게
	const markerHeight = 0.5; // 삼각형 높이

	// 회전 각도 (디바이스의 방향에 따라)
	const rotationY = device.rotation?.y || 0;

	return (
		<group position={position} rotation={[0, rotationY, 0]}>
			{/* 바닥 원  */}
			<mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<circleGeometry args={[markerSize / 2, 32]} />
				<meshStandardMaterial
					color={getStatusColor(device.status)}
					opacity={1}
					transparent
				/>
			</mesh>
		</group>
	);
}

function TwoDViewer({ installedDevices }: { installedDevices: any[] }) {
	const { length, width } = warehouseData.structure.dimensions;
	const centerX = length / 2;
	const centerZ = width / 2;

	return (
		<div className="relative w-full h-full bg-[#EFEFEF]">
			<Canvas camera={{ position: [centerX, 100, centerZ], fov: 50 }}>
				{/* 조명 */}
				<ambientLight intensity={1.5} />
				<directionalLight position={[0, 100, 0]} intensity={1.0} />

				{/* 카메라 고정 */}
				<CameraLock />

				{/* 카메라 컨트롤: 회전 비활성화, Pan과 Zoom만 허용 */}
				<OrbitControls
					target={[centerX, 0, centerZ]}
					minDistance={50}
					maxDistance={300}
					enableRotate={false} // 회전 완전 비활성화
					enablePan={true} // Pan 허용
					panSpeed={1.0}
					screenSpacePanning={true} // 2D에서는 화면 공간 기준으로 pan
				// 마우스 컨트롤:
				// - 드래그: Pan (이동)
				// - 휠: Zoom
				/>

				{/* 바닥 */}
				<mesh
					rotation={[-Math.PI / 2, 0, 0]}
					position={[centerX, 0, centerZ]}
				>
					<planeGeometry args={[length, width]} />
					<meshBasicMaterial
						color={new THREE.Color("#FFFFFF")}
						toneMapped={false}
					/>
				</mesh>

				{/* 그리드 */}
				<FloorGrid2D
					length={length}
					width={width}
					centerX={centerX}
					centerZ={centerZ}
					divisions={20}
				/>

				{/* 기둥들 */}
				{warehouseData.structure.columns.map((column) => (
					<mesh
						key={column.id}
						position={[column.position.x, 0.02, column.position.z]}
					>
						<boxGeometry
							args={[column.size.width, 0.01, column.size.depth]}
						/>
						<meshStandardMaterial color="#807e7e" />
					</mesh>
				))}

				{/* 벽들 (위에서 본 뷰) */}
				{warehouseData.structure.walls.map((wall) => {
					const dx = wall.end[0] - wall.start[0];
					const dz = wall.end[1] - wall.start[1];
					const wallLength = Math.sqrt(dx * dx + dz * dz);
					const angle = Math.atan2(dz, dx);
					const centerX = (wall.start[0] + wall.end[0]) / 2;
					const centerZ = (wall.start[1] + wall.end[1]) / 2;

					return (
						<mesh
							key={wall.id}
							position={[centerX, 0.02, centerZ]}
							rotation={[0, angle, 0]}
						>
							<boxGeometry
								args={[wallLength, 0.01, wall.thickness * 0.2]}
							/>
							<meshStandardMaterial color={"#CCC"} />
						</mesh>
					);
				})}

				{/* 선반들 */}
				{warehouseData.structure.shelves.map((shelf) => {
					const angle =
						shelf.orientation === "north" ||
							shelf.orientation === "south"
							? 0
							: Math.PI / 2;

					return (
						<mesh
							key={shelf.id}
							position={[
								shelf.position.x,
								0.01,
								shelf.position.z,
							]}
							rotation={[0, angle, 0]}
						>
							<boxGeometry
								args={[
									shelf.size.length,
									0.01,
									shelf.size.width,
								]}
							/>
							<meshStandardMaterial
								color="#CCC"
								opacity={0.5}
								transparent
							/>
						</mesh>
					);
				})}

				{/* 문들 (점선으로 표시) */}
				{warehouseData.structure.doors.map((door) => {
					const wall = warehouseData.structure.walls.find(
						(w) => w.id === door.wallId
					);
					if (!wall) return null;

					const dx = wall.end[0] - wall.start[0];
					const dz = wall.end[1] - wall.start[1];
					const angle = Math.atan2(dz, dx);

					const doorX =
						wall.start[0] +
						(wall.end[0] - wall.start[0]) * door.position;
					const doorZ =
						wall.start[1] +
						(wall.end[1] - wall.start[1]) * door.position;

					return (
						<mesh
							key={door.id}
							position={[doorX, 0.015, doorZ]}
							rotation={[0, angle + Math.PI / 2, 0]}
						>
							<boxGeometry args={[door.width, 0.01, 0.1]} />
							<meshStandardMaterial
								color="#059669"
								opacity={0.7}
								transparent
							/>
						</mesh>
					);
				})}

				{/* 설치된 디바이스들 (2D 뷰) */}
				{installedDevices.map((device) => {
					return <Device2D key={device.id} device={device} />;
				})}
			</Canvas>
		</div>
	);
}

export default TwoDViewer;
