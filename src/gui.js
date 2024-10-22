import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

const gui = new GUI();



const tentacleControls = {
    animated: false,
    rl_py: false,
    isModelReady: false,
    lowerX: 0,
    lowerZ: 0,
    upperX: 0,
    upperZ: 0,
    message: 'Model not ready ...',
    refresh: function () { },
    setStatus: function (isModelReady) {
        this.isModelReady = isModelReady;
        this.message = isModelReady ? 'Model Ready' : 'Model not ready ...';
    }
};

gui.add(tentacleControls, 'message').name('RL Backend').listen();
gui.add(tentacleControls, 'animated').name('Animated');
gui.add(tentacleControls, 'rl_py').name('RL');
gui.add(tentacleControls, 'lowerX', -5, 5).name('S1 - Lower X').listen();
gui.add(tentacleControls, 'lowerZ', -5, 5).name('S2 - Lower Z').listen();
gui.add(tentacleControls, 'upperX', -5, 5).name('S3 - Upper X').listen();
gui.add(tentacleControls, 'upperZ', -5, 5).name('S4 - Upper Z').listen();
gui.add(tentacleControls, 'refresh').name('Refresh');
gui.add(gui, 'reset').name('Reset');

export { tentacleControls};