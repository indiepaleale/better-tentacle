import * as THREE from 'three';
import { scene, camera, renderer } from './scene-setup';
import { lowerSegment, upperSegment } from './tentacle';
import { tentacleControls } from './gui';
import { Noise } from 'noisejs';
import * as socket from './ws';

const pointsBufferSize = 10000;
const positions = new Float32Array(pointsBufferSize * 3);
let pointCount = 0;
let startIndex = 0;

const pointsBufferGeometry = new THREE.BufferGeometry();
pointsBufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.2, sizeAttenuation: true });
const points = new THREE.Points(pointsBufferGeometry, pointsMaterial);
scene.add(points);

function drawPoint(x, y, z) {
    const index = (startIndex + pointCount) % pointsBufferSize * 3;

    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;

    if (pointCount < pointsBufferSize) {
        pointCount++;
    } else {
        startIndex = (startIndex + 1) % pointsBufferSize;
    }

    pointsBufferGeometry.attributes.position.needsUpdate = true;
}
// Add AxesHelper to the scene
const axesHelper = new THREE.AxesHelper(10); // Size of the axes
scene.add(axesHelper);

const noise = new Noise(Math.random());

function animate(deltaTime) {
    if (tentacleControls.animated) {
        const time = Date.now() * 0.00005;
        const movementRange = 5;
        tentacleControls.lowerX = noise.simplex2(time, 0) * movementRange;
        tentacleControls.lowerZ = noise.simplex2(0, time) * movementRange;
        tentacleControls.upperX = noise.simplex2(time, 100) * movementRange;
        tentacleControls.upperZ = noise.simplex2(100, time) * movementRange;
    }
    if (tentacleControls.rl_py && tentacleControls.isModelReady) {
        socket.tick();
        console.log(socket.state_buffer);
        const state = socket.state_buffer.shift();
        try {
            if (state) {
                const rl_control = state.pos;
                tentacleControls.lowerX = rl_control[0];
                tentacleControls.lowerZ = rl_control[1];
                tentacleControls.upperX = rl_control[2];
                tentacleControls.upperZ = rl_control[3];
            }
        }
        catch (e) {
            console.error('Failed to parse state:', e);
        }
    }

    lowerSegment.fk(tentacleControls.lowerX, tentacleControls.lowerZ);
    upperSegment.fk(tentacleControls.upperX, tentacleControls.upperZ);
    const pointPosition = upperSegment.segments[upperSegment.segments.length - 1].localToWorld(new THREE.Vector3(0, 1, 0));
    drawPoint(pointPosition.x, pointPosition.y, pointPosition.z);
    renderer.render(scene, camera);
}

let prevTime = 0;

const tick = (time) => {
    const deltaTime = time - prevTime;
    prevTime = time;
    // console.log(deltaTime);

    animate(deltaTime);

    requestAnimationFrame(tick);

};

tick();
