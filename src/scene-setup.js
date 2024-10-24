import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
let loadedGeometry;

loader.load('./disk.gltf', (gltf) => {
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            // Extract the geometry from the mesh
            child.geometry;
            const geometry = child.geometry;
            const edges = new THREE.EdgesGeometry(geometry,30);
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            const newMesh = new THREE.LineSegments(edges, lineMaterial);
            // Add the new mesh to the scene
            scene.add(newMesh);
        }
    });
}, undefined, function (error) {
    console.log(error);
});


export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const orthoViewFrustumHeight = 175;
export const orthoCamera = new THREE.OrthographicCamera(
    orthoViewFrustumHeight * window.innerWidth / window.innerHeight / 2, orthoViewFrustumHeight * window.innerWidth / window.innerHeight / -2,
    orthoViewFrustumHeight / 2, orthoViewFrustumHeight / -2,
    0.1, 1000
);
orthoCamera.position.set(500, 250, 200)
orthoCamera.lookAt(0, 40, 0);

export const renderer = new THREE.WebGLRenderer();

const geometry = new THREE.BoxGeometry(100, 75, 100);
geometry.translate(0, 75 / 2, 0);
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const edgesMesh = new THREE.LineSegments(edges, lineMaterial);
scene.add(edgesMesh);

const pixelRatio = 1
// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.25; // Damping factor
controls.screenSpacePanning = false; // Disable screen space panning
controls.target.set(0, 40, 0);

camera.position.set(50, 50, 50);
camera.lookAt(0, 20, 0);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(pixelRatio);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x202020);


// Add lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);



// Handle resizing
window.addEventListener('resize', () => {
    // Update sizes
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update orthographic camera
    orthoCamera.left = orthoViewFrustumHeight * width / height / 2;
    orthoCamera.right = orthoViewFrustumHeight * width / height / -2;

    orthoCamera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);

});

// Handle fullscreen
window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    console.log(fullscreenElement);
    if (!fullscreenElement) {
        if (renderer.domElement.requestFullscreen) {
            renderer.domElement.requestFullscreen();
        } else if (renderer.domElement.webkitRequestFullscreen) {
            renderer.domElement.webkitRequestFullscreen();
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
});

if (loadedGeometry) {
    console.log('Loaded Geometry:', loadedGeometry);
}
export { loadedGeometry }; 