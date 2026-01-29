import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { FloorPlan, Room, FloorPlanWall } from '@/types/floor-plan'

interface FloorPlan3DViewerProps {
  floorPlan: FloorPlan
}

// Room의 기본 벽 높이 (미터) - 상식적인 실내 높이
const DEFAULT_ROOM_WALL_HEIGHT = 2.5
const DEFAULT_WALL_THICKNESS = 0.2

function Room3D({ room }: { room: Room }) {
  if (room.type !== 'rectangle') return null

  // Convert 2D coordinates (x, y) to 3D (x, z)
  // In 2D: x is horizontal, y is vertical
  // In 3D: x is horizontal, z is depth (y is height)
  const { x, y, width, height } = room.bounds
  
  // Room의 중심점 (3D 좌표)
  const centerX = x + width / 2
  const centerZ = y + height / 2
  
  // 벽 높이의 절반 (중심점 계산용)
  const wallHeightHalf = DEFAULT_ROOM_WALL_HEIGHT / 2

  return (
    <group>
      {/* 바닥 */}
      <mesh
        position={[centerX, 0.01, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#dbeafe" opacity={0.8} transparent />
      </mesh>

      {/* 북쪽 벽 (z = y, 작은 z 값) */}
      <mesh
        position={[centerX, wallHeightHalf, y]}
        scale={[width, DEFAULT_ROOM_WALL_HEIGHT, DEFAULT_WALL_THICKNESS]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>

      {/* 남쪽 벽 (z = y + height, 큰 z 값) */}
      <mesh
        position={[centerX, wallHeightHalf, y + height]}
        scale={[width, DEFAULT_ROOM_WALL_HEIGHT, DEFAULT_WALL_THICKNESS]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>

      {/* 서쪽 벽 (x = x, 작은 x 값) */}
      <mesh
        position={[x, wallHeightHalf, centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[height, DEFAULT_ROOM_WALL_HEIGHT, DEFAULT_WALL_THICKNESS]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>

      {/* 동쪽 벽 (x = x + width, 큰 x 값) */}
      <mesh
        position={[x + width, wallHeightHalf, centerZ]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[height, DEFAULT_ROOM_WALL_HEIGHT, DEFAULT_WALL_THICKNESS]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>
    </group>
  )
}

function Wall3D({ wall }: { wall: FloorPlanWall }) {
  // Convert 2D coordinates (x, y) to 3D (x, z)
  // wall.start and wall.end are [x, y] in 2D, map to [x, z] in 3D
  const dx = wall.end[0] - wall.start[0]
  const dy = wall.end[1] - wall.start[1] // This is Y in 2D, becomes Z in 3D
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) // Angle in XZ plane
  const centerX = (wall.start[0] + wall.end[0]) / 2
  const centerZ = (wall.start[1] + wall.end[1]) / 2 // Y in 2D -> Z in 3D
  const centerY = wall.height / 2

  return (
    <mesh
      position={[centerX, centerY, centerZ]}
      rotation={[0, angle, 0]}
      scale={[length, wall.height, wall.thickness]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={wall.type === 'exterior' ? '#EFEFEF' : '#999999'}
      />
    </mesh>
  )
}

function FloorPlanScene({ floorPlan }: { floorPlan: FloorPlan }) {
  const bounds = useMemo(() => {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    floorPlan.rooms.forEach((room) => {
      if (room.type === 'rectangle') {
        minX = Math.min(minX, room.bounds.x)
        maxX = Math.max(maxX, room.bounds.x + room.bounds.width)
        minY = Math.min(minY, room.bounds.y)
        maxY = Math.max(maxY, room.bounds.y + room.bounds.height)
      }
    })

    floorPlan.walls.forEach((wall) => {
      minX = Math.min(minX, wall.start[0], wall.end[0])
      maxX = Math.max(maxX, wall.start[0], wall.end[0])
      minY = Math.min(minY, wall.start[1], wall.end[1])
      maxY = Math.max(maxY, wall.start[1], wall.end[1])
    })

    if (minX === Infinity) {
      return { centerX: 0, centerZ: 0, width: 20, length: 20 }
    }

    const width = maxX - minX || 20
    const length = maxY - minY || 20
    const centerX = (minX + maxX) / 2
    const centerZ = (minY + maxY) / 2

    return { centerX, centerZ, width, length }
  }, [floorPlan])

  const cameraHeight = Math.max(bounds.width, bounds.length) * 1.5

  return (
    <Canvas
      camera={{
        position: [bounds.centerX, cameraHeight, bounds.centerZ],
        fov: 50,
      }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[0, 100, 0]} intensity={1.0} />

      <OrbitControls
        target={[bounds.centerX, 0, bounds.centerZ]}
        minDistance={10}
        maxDistance={500}
      />

      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[bounds.centerX, 0, bounds.centerZ]}
      >
        <planeGeometry args={[bounds.width * 2, bounds.length * 2]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Rooms */}
      {floorPlan.rooms.map((room) => (
        <Room3D key={room.id} room={room} />
      ))}

      {/* Walls */}
      {floorPlan.walls.map((wall) => (
        <Wall3D key={wall.id} wall={wall} />
      ))}
    </Canvas>
  )
}

export default function FloorPlan3DViewer({
  floorPlan,
}: FloorPlan3DViewerProps) {
  return (
    <div className="w-full h-full bg-gray-100">
      <FloorPlanScene floorPlan={floorPlan} />
    </div>
  )
}
