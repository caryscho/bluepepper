import * as THREE from "three";
export default function DiscController() {
    const deviceGeometry = new THREE.BoxGeometry(1, 1, 1);

    return (
        <>
            <mesh geometry={deviceGeometry}></mesh>
        </>
    );
}
