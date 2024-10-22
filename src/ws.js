import { tentacleControls } from './gui';

const url = 'ws://localhost:8888';
const socket = new WebSocket(url);
let state_buffer = [];

// Event listener for when the connection is opened
socket.addEventListener('open', () => {
    console.log('Connected to the WebSocket server');
    socket.send(JSON.stringify({ type: 'identify', role: 'frontend' }));
});

// Event listener for when a message is received from the server
socket.addEventListener('message', (event) => {
    handleMessage(event.data);
});

// Event listener for when an error occurs
socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
});

// Event listener for when the connection is closed
socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
});

// Function to handle received messages
function handleMessage(message) {
    try {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.type) {
            case 'state':
                const state = {
                    pos: parsedMessage.pos,
                    target: parsedMessage.target,
                }
                state_buffer.push(state);
                break;

            case 'message':
                if(parsedMessage.status === 'waiting')
                    tentacleControls.setStatus(false);
                if(parsedMessage.status === 'ready')
                    tentacleControls.setStatus(true);
            default:
                break;
        }
        console.log(parsedMessage);
    }
    catch (e) {
        console.error('Failed to parse message:', e);
    }
}

function tick() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'command', command: 'step' }));
    } else {
        console.error('WebSocket is not open. Ready state:', socket.readyState);
    }
}

function reset() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'command', command: 'reset' }));
    } else {
        console.error('WebSocket is not open. Ready state:', socket.readyState);
    }
}

export { tick, reset, state_buffer };