import { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center, Bounds } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import glb01 from "@/data/glb_01.glb";

// GLB 모델 컴포넌트 (자동 스케일 & 카메라 조정)
function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const { camera } = useThree();

    useEffect(() => {
        // 바운딩 박스 계산
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log("Model Info:", {
            size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
            center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
        });

        // GLB 파일 내부 구조 탐색 (모든 메시의 이름 출력)
        console.log("=== GLB 내부 구조 ===");
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log("Mesh 발견:", {
                    name: child.name || "이름 없음",
                    type: child.type,
                    userData: child.userData,
                    // material 정보도 확인 가능
                    material: (child.material as THREE.Material)?.name,
                });
            }
        });

        // 모델을 중앙으로 이동
        scene.position.sub(center);

        // 카메라 거리를 모델 크기에 맞춰 자동 조정
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 2.5; // 여유 공간

        camera.position.set(cameraZ, cameraZ * 0.7, cameraZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

    }, [scene, camera]);

    // GLB 모델의 메시를 클릭했을 때 처리
    const handleClick = (event: any) => {
        event.stopPropagation();
        
        const clickedObject = event.object;
        
        console.log("클릭한 객체 정보:", {
            name: clickedObject.name || "이름 없음",
            type: clickedObject.type,
            position: clickedObject.position,
            userData: clickedObject.userData,
            // 부모 객체 정보
            parent: clickedObject.parent?.name,
        });

        // 클릭한 위치 (3D 공간 좌표)
        console.log("클릭 위치 (월드 좌표):", {
            x: event.point.x.toFixed(2),
            y: event.point.y.toFixed(2),
            z: event.point.z.toFixed(2),
        });

        // 실제 사용 예시: 클릭한 객체의 이름에 따라 다른 동작 수행
        if (clickedObject.name.includes("wall")) {
            console.log("🧱 벽을 클릭했습니다!");
        } else if (clickedObject.name.includes("door")) {
            console.log("🚪 문을 클릭했습니다!");
        } else if (clickedObject.name.includes("window")) {
            console.log("🪟 창문을 클릭했습니다!");
        } else {
            console.log("❓ 기타 객체를 클릭했습니다:", clickedObject.name);
        }
    };

    return <primitive object={scene} onClick={handleClick} />;
}

// 클릭 가능한 GLB 모델 컴포넌트 (각 메시를 개별적으로 클릭 가능하게)
function ClickableGLBModel({ url, onObjectClick }: { url: string; onObjectClick: (name: string) => void }) {
    const { scene } = useGLTF(url);
    const { camera } = useThree();
    const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(null);

    useEffect(() => {
        // 바운딩 박스 계산 및 카메라 조정
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        scene.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 2.5;

        camera.position.set(cameraZ, cameraZ * 0.7, cameraZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        // 각 메시를 클릭 가능하게 설정
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // 클릭 이벤트를 받을 수 있도록 설정
                child.userData.clickable = true;
                
                // 원본 색상 저장 (hover 효과용)
                if (child.material instanceof THREE.Material) {
                    child.userData.originalColor = (child.material as any).color?.clone();
                }
            }
        });

    }, [scene, camera]);

    // 호버 효과
    useEffect(() => {
        if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
            const material = hoveredObject.material as THREE.MeshStandardMaterial;
            if (material.color) {
                material.color.setHex(0xffff00); // 노란색으로 변경
            }
        }

        return () => {
            if (hoveredObject && hoveredObject instanceof THREE.Mesh) {
                const material = hoveredObject.material as THREE.MeshStandardMaterial;
                const originalColor = hoveredObject.userData.originalColor;
                if (material.color && originalColor) {
                    material.color.copy(originalColor);
                }
            }
        };
    }, [hoveredObject]);

    const handlePointerOver = (event: any) => {
        event.stopPropagation();
        setHoveredObject(event.object);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setHoveredObject(null);
        document.body.style.cursor = 'default';
    };

    const handleClick = (event: any) => {
        event.stopPropagation();
        const clickedObject = event.object;
        
        const objectInfo = `${clickedObject.name || "이름없음"} (타입: ${clickedObject.type})`;
        onObjectClick(objectInfo);
        
        console.log("클릭한 객체 상세 정보:", {
            name: clickedObject.name,
            type: clickedObject.type,
            position: clickedObject.position,
            userData: clickedObject.userData,
            parent: clickedObject.parent?.name,
            worldPosition: event.point,
        });
    };

    return (
        <primitive 
            object={scene} 
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        />
    );
}

export default function GlbUploaderPage() {
    const fileInput = useRef<HTMLInputElement>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [selectedObject, setSelectedObject] = useState<string | null>(null);

    const handleClick = () => {
        fileInput.current?.click();
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 기존 URL 해제 (메모리 누수 방지)
        if (modelUrl) {
            URL.revokeObjectURL(modelUrl);
        }

        // Blob URL 생성
        const url = URL.createObjectURL(file);
        setModelUrl(url);
        console.log("GLB file loaded:", file.name);
    };

    const handleSampleGLBFile = () => {
        setModelUrl(glb01);
    };

    return (
        <div className="flex flex-col h-full">
            {/* 업로드 버튼 */}
            <div className="flex gap-2 justify-center items-center p-4 bg-gray-100">
                <input
                    ref={fileInput}
                    className="hidden"
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleUpload}
                />
                <button
                    onClick={handleClick}
                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Upload GLB File
                </button>
                <button onClick={handleSampleGLBFile} className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">sample glb file</button>
                {modelUrl && (
                    <span className="ml-4 text-sm text-gray-600">
                        Model loaded ✓
                    </span>
                )}
                {selectedObject && (
                    <div className="p-2 ml-4 text-sm bg-green-100 rounded-md">
                        선택된 객체: <strong>{selectedObject}</strong>
                    </div>
                )}
            </div>

            {/* 3D 뷰어 */}
            <div className="flex-1 bg-red-200">
                {modelUrl ? (
                    <Canvas camera={{ position: [5, 5, 5], fov: 50, near: 0.01, far: 10000 }}>
                        <ambientLight intensity={0.8} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
                        <hemisphereLight intensity={0.4} />
                        
                        <Suspense fallback={null}>
                            <ClickableGLBModel url={modelUrl} onObjectClick={setSelectedObject} />
                        </Suspense>

                        <OrbitControls
                            minDistance={0.1}
                            maxDistance={1000}
                            enablePan={true}
                        />
                        <gridHelper args={[100, 20]} />
                    </Canvas>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        Upload a GLB file to view
                    </div>
                )}
            </div>
        </div>
    );
}
