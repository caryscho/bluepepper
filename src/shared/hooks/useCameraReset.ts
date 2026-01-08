import { useEffect } from "react";
import * as THREE from "three";

export function useCameraReset(
    resetCameraTrigger: number | undefined,
    controlsRef: React.RefObject<any>,
    centerX: number,
    centerZ: number,
    length: number,
    width: number
) {
    useEffect(() => {
        if (
            resetCameraTrigger &&
            resetCameraTrigger > 0 &&
            controlsRef.current
        ) {
            const controls = controlsRef.current;
            const camera = controls.object;

            // 현재 타겟 위치는 그대로 유지 (회전 유지를 위해)
            // 카메라만 위로 이동
            const targetHeight = Math.max(length, width) * 1.5;
            const targetPosition = new THREE.Vector3(
                centerX,
                targetHeight,
                centerZ
            );

            // 부드러운 애니메이션으로 위로 이동
            const animate = () => {
                const currentPosition = camera.position;
                const distance = currentPosition.distanceTo(targetPosition);

                if (distance > 0.1) {
                    // position만 lerp (타겟은 그대로 = 회전 유지)
                    currentPosition.lerp(targetPosition, 0.1);
                    controls.update();
                    requestAnimationFrame(animate);
                } else {
                    // 목표 위치에 도달
                    camera.position.copy(targetPosition);
                    controls.update();
                }
            };

            animate();
        }
    }, [resetCameraTrigger]);
}
