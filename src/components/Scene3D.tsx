import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Cube() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function Scene3D() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Camera Controls */}
        <OrbitControls />
        
        {/* 3D Objects */}
        <Cube />
        
        {/* Grid Helper (optional, helps visualize space) */}
        <gridHelper args={[10, 10]} />
      </Canvas>
    </div>
  )
}

export default Scene3D

