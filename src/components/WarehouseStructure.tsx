import { useMemo } from 'react'
import type { WarehouseStructure } from '../types/warehouse'

interface WarehouseStructureProps {
  structure: WarehouseStructure
}

export default function WarehouseStructure({ structure }: WarehouseStructureProps) {
  const { dimensions, columns, walls, shelves, lights } = structure

  return (
    <group>
      {/* 바닥 (Floor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[dimensions.length / 2, 0, dimensions.width / 2]}>
        <planeGeometry args={[dimensions.length, dimensions.width]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* 기둥들 (Columns) */}
      {columns.map((column) => (
        <mesh
          key={column.id}
          position={[column.position.x, column.height / 2, column.position.z]}
        >
          <boxGeometry args={[column.size.width, column.height, column.size.depth]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      ))}

      {/* 벽들 (Walls) */}
      {walls.map((wall) => {
        const dx = wall.end[0] - wall.start[0]
        const dz = wall.end[1] - wall.start[1]
        const length = Math.sqrt(dx * dx + dz * dz)
        const angle = Math.atan2(dz, dx)
        const centerX = (wall.start[0] + wall.end[0]) / 2
        const centerZ = (wall.start[1] + wall.end[1]) / 2

        return (
          <mesh
            key={wall.id}
            position={[centerX, wall.height / 2, centerZ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[length, wall.height, wall.thickness]} />
            <meshStandardMaterial color={wall.type === 'exterior' ? '#666666' : '#999999'} />
          </mesh>
        )
      })}

      {/* 선반들 (Shelves) */}
      {shelves.map((shelf) => (
        <group key={shelf.id} position={[shelf.position.x, shelf.size.height / 2, shelf.position.z]}>
          {/* 선반 프레임 */}
          <mesh>
            <boxGeometry args={[shelf.size.length, shelf.size.height, shelf.size.width]} />
            <meshStandardMaterial color="#8B4513" wireframe />
          </mesh>
          {/* 선반 단들 */}
          {Array.from({ length: shelf.tiers }).map((_, tier) => (
            <mesh
              key={tier}
              position={[0, (tier * shelf.size.height) / shelf.tiers - shelf.size.height / 2 + shelf.size.height / shelf.tiers, 0]}
            >
              <boxGeometry args={[shelf.size.length, 0.05, shelf.size.width]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          ))}
        </group>
      ))}

      {/* 조명들 (Lights) */}
      {lights.map((light) => (
        <mesh
          key={light.id}
          position={[light.position.x, light.position.y, light.position.z]}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffffaa" emissive="#ffffaa" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

