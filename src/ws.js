// ws.js
const url = 'ws://localhost:8080';
const socket = new WebSocket(url);


let state_buffer = [];

// Event listener for when the connection is opened
socket.addEventListener('open', () => {
    console.log('Connected to the WebSocket server');
    // Example: Send a message to the server
    socket.send('Hello Server!');
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
    if (message instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
            const text = reader.result;
            try {
                const data = JSON.parse(text);
                state_buffer.push(data);                
                // Handle the JSON data
            } catch (e) {
                // console.error('Error parsing JSON:', e);
            }
        };
        reader.readAsText(message);
    } else {
        console.log('non-Blob message:', message);
    }
}

function tick() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: 'tick' }));
    } else {
        console.error('WebSocket is not open. Ready state:', socket.readyState);
    }
}

function reset() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: 'reset' }));
    } else {
        console.error('WebSocket is not open. Ready state:', socket.readyState);
    }
}

export { tick, reset, state_buffer };