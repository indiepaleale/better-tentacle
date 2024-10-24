import * as THREE from 'three';
import { scene, camera, renderer } from './scene-setup';


const geometry = new THREE.CylinderGeometry(3, 3, 1,12);
const edges = new THREE.EdgesGeometry(geometry,30);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const edgesMesh = new THREE.LineSegments(edges, lineMaterial);
scene.add(edgesMesh);


function animate() {
    renderer.render(scene, camera);
}

const tick = () => {
    animate();

    requestAnimationFrame(tick);
    console.log();
};

tick();