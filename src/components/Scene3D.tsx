import { useRef } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * R3F 학습 가이드
 * 
 * 1. Canvas: 3D 씬의 컨테이너 (HTML의 <div> 같은 역할)
 *    - 자동으로 Scene, Camera, Renderer를 생성해줌
 *    - 안에 넣는 모든 것이 3D 공간에 렌더링됨
 * 
 * 2. mesh: 3D 객체의 기본 단위
 *    - geometry (형태) + material (재질) = mesh
 *    - position: [x, y, z] 좌표로 위치 지정
 * 
 * 3. Geometry: 3D 형태를 정의
 *    - boxGeometry: 박스 형태
 *    - args: [width, height, depth] 크기 지정
 * 
 * 4. Material: 표면 재질 (색상, 반사, 질감 등)
 *    - meshStandardMaterial: 표준 재질 (빛 반응함)
 *    - color: 색상 지정
 * 
 * 5. Light: 조명 (없으면 아무것도 안 보임!)
 *    - ambientLight: 전체적인 환경광 (어디서나 비춤)
 *    - directionalLight: 방향성 빛 (태양처럼 한 방향에서)
 * 
 * 6. OrbitControls: 마우스로 카메라 회전/줌 (drei 라이브러리)
 */

// 예제 1: 기본 큐브 컴포넌트
function Cube() {
  return (
    <mesh position={[0, 0.5, 0]}>
      {/* geometry: 형태 정의 (박스) */}
      <boxGeometry args={[1, 1, 1]} />
      {/* material: 재질 정의 (주황색) */}
      <meshStandardMaterial color="tan" />
    </mesh>
  )
}

function AnimatedBox(){
  const meshRef = useRef<THREE.Mesh>(null)
  
  /**
   * useFrame 작동 원리:
   * 
   * useFrame은 R3F가 자동으로 매 프레임마다(초당 60회) 이 함수를 호출해줍니다.
   * 
   * 파라미터 설명:
   * - 첫 번째 파라미터 (_): state 객체 (카메라, 마우스 등 씬 정보) - 사용 안 함
   * - 두 번째 파라미터 (delta): 이전 프레임과 현재 프레임 사이의 시간 차이 (초 단위)
   * 
   * delta 예시:
   * - 60fps면 delta ≈ 0.016초 (1/60)
   * - 30fps면 delta ≈ 0.033초 (1/30)
   * 
   * 왜 delta를 사용하나요?
   * - delta를 사용하면 프레임레이트와 상관없이 항상 같은 속도로 애니메이션이 됩니다!
   * - 예: rotation.x += delta → 초당 1 라디안씩 회전 (항상 일정한 속도)
   * - 만약 delta 없이 += 0.01 하면? → 빠른 컴퓨터에서는 빨리, 느린 컴퓨터에서는 느리게
   */
  useFrame((_, delta) => {
    if (meshRef.current) {
      // delta만큼 회전 (프레임레이트와 무관하게 일정한 속도)
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.y += delta
      
      // 비교: delta 없이 하면 프레임레이트에 따라 속도가 달라짐
      // meshRef.current.rotation.x += 0.01  // ❌ 나쁜 방법
    }
  })

  return(
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color="royalblue" />
    </mesh>
  )

}

// 예제 2: 회전하는 큐브 (useFrame 훅 사용)
// function RotatingCube() {
//   const meshRef = useRef<THREE.Mesh>(null)
  
//   useFrame((state, delta) => {
//     if (meshRef.current) {
//       // 매 프레임마다 회전
//       meshRef.current.rotation.x += delta
//       meshRef.current.rotation.y += delta * 0.5
//     }
//   })
  
//   return (
//     <mesh ref={meshRef} position={[2, 0, 0]}>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color="hotpink" />
//     </mesh>
//   )
// }

// 예제 3: 여러 개의 큐브 배치
// function MultipleCubes() {
//   return (
//     <>
//       <mesh position={[-2, 0, 0]}>
//         <boxGeometry args={[1, 1, 1]} />
//         <meshStandardMaterial color="red" />
//       </mesh>
//       <mesh position={[0, 1, 0]}>
//         <boxGeometry args={[1, 1, 1]} />
//         <meshStandardMaterial color="green" />
//       </mesh>
//       <mesh position={[2, 0, 0]}>
//         <boxGeometry args={[1, 1, 1]} />
//         <meshStandardMaterial color="blue" />
//       </mesh>
//     </>
//   )
// }

// 예제 4: 다른 형태들
// function OtherShapes() {
//   return (
//     <>
//       {/* 구 (Sphere) */}
//       <mesh position={[-3, 0, 0]}>
//         <sphereGeometry args={[0.5, 32, 32]} />
//         <meshStandardMaterial color="yellow" />
//       </mesh>
//       
//       {/* 원기둥 (Cylinder) */}
//       <mesh position={[3, 0, 0]}>
//         <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
//         <meshStandardMaterial color="purple" />
//       </mesh>
//     </>
//   )
// }

/**
 * 그리드 공간 크기 설정 방법:
 * 
 * 1. 외부 div 크기 (화면에 보이는 영역)
 *    - width: '100%' → 화면 전체 너비
 *    - height: '100vh' → 화면 전체 높이
 *    - 예: height: '800px' → 고정 높이 800px
 *    - 예: height: '50vh' → 화면 높이의 50%
 * 
 * 2. gridHelper 크기 (그리드 라인의 범위)
 *    - args={[크기, 분할수]}
 *    - args={[10, 10]} → 10x10 단위, 10개로 분할
 *    - args={[20, 20]} → 20x20 단위, 20개로 분할
 *    - args={[50, 50]} → 50x50 단위, 50개로 분할
 * 
 * 3. Canvas 카메라 설정 (선택사항)
 *    - camera={{ position: [5, 5, 5], fov: 75 }}
 *    - position: 카메라 시작 위치 [x, y, z]
 *    - fov: 시야각 (Field of View) - 작을수록 확대된 느낌
 */
function Scene3D() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Canvas: 3D 씬의 시작점 */}
      <Canvas
        // 카메라 설정 예제 (주석 해제해서 실험해보세요)
        // camera={{ position: [5, 5, 5], fov: 75 }}
      >
        {/* 조명: 없으면 아무것도 안 보임! */}
        {/* <ambientLight intensity={0.5} /> */}
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* 카메라 컨트롤: 마우스로 드래그해서 회전, 휠로 줌 */}
        <OrbitControls />
        
        {/* 3D 객체들 */}
        {/* <Cube /> */}
        <AnimatedBox/>
        {/* 
          그리드 헬퍼: 공간 파악을 위한 보조선
          args={[크기, 분할수]}
          - 첫 번째 숫자: 그리드의 전체 크기 (예: 10 = -5부터 +5까지)
          - 두 번째 숫자: 몇 개의 선으로 나눌지
          
          실험해보기:
          - <gridHelper args={[20, 20]} /> → 더 큰 그리드
          - <gridHelper args={[5, 5]} /> → 더 작은 그리드
          - <gridHelper args={[10, 20]} /> → 같은 크기지만 더 촘촘한 선
        */}
        <gridHelper args={[10, 10]} />
        
        {/* 위의 주석 처리된 예제들을 하나씩 풀어서 실험해보세요! */}
        {/* <RotatingCube /> */}
        {/* <MultipleCubes /> */}
        {/* <OtherShapes /> */}
      </Canvas>
    </div>
  )
}

export default Scene3D

