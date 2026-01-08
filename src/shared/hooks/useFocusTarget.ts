import { useEffect } from "react";
import * as THREE from "three";


export function useFocusTarget(
    focusTarget: { x: number; y: number; z: number } | null | undefined,
    controlsRef: React.RefObject<any>
) {
    useEffect(() => {
        if (focusTarget && controlsRef.current) {
            const controls = controlsRef.current;
            // 부드러운 애니메이션을 위해 lerp 사용
            const target = new THREE.Vector3(
                focusTarget.x,
                focusTarget.y,
                focusTarget.z
            );

            // OrbitControls의 target을 부드럽게 이동
            const animate = () => {
                const currentTarget = controls.target;
                const distance = currentTarget.distanceTo(target);

                if (distance > 0.01) {
                    // lerp를 사용하여 부드럽게 이동
                    currentTarget.lerp(target, 0.1);
                    controls.update();
                    requestAnimationFrame(animate);
                } else {
                    // 목표 위치에 도달
                    controls.target.copy(target);
                    controls.update();
                }
            };

            animate();
        }
    }, [focusTarget]);
}
