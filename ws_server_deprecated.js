const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clientTHREE = null;
let clientPython = null;

// Function to handle messages from clients of type "THREE"
function handleThreeClientMessage(ws, message) {
    if (clientPython) {
        clientPython.send(JSON.stringify(message));
    }
}

// Function to handle messages from clients of type "OTHER"
function handlePythonClientMessage(ws, message) {
    if (clientTHREE) {
        clientTHREE.send(JSON.stringify(message));
    }
}

// Dispatcher function to route messages to the appropriate handler
function handleMessage(ws, message) {
    try {
        const parsedMessage = JSON.parse(message);
        try {
            switch (parsedMessage.type) {
                case 'THREE':
                    handleThreeClientMessage(ws, parsedMessage);
                    break;

                case 'PYTHON':
                    handlePythonClientMessage(ws, parsedMessage);
                    break;

                default:
                    console.log('Unknown message type:', parsedMessage.type);
            }
        } catch (e) { }
    } catch (e) { }
}

function assignClients(ws, message) {
    if (clientTHREE && clientPython) {
        return;
    }
    try {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.type) {
            case 'THREE':
                if (clientTHREE === null) {
                    clientTHREE = ws;
                    console.log('THREE client connected');
                }
                break;

            case 'PYTHON':
                if (clientPython === null) {
                    clientPython = ws;
                    console.log('PYTHON client connected');
                    try {
                        clientTHREE.send(JSON.stringify({ type: 'SERVER', backend: true }));
                    }
                    catch (e) { }
                }
                break;

            default:
                break;
        }
    }
    catch (e) {

    }
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        assignClients(ws, message);
        handleMessage(ws, message);
        // Broadcast the message to all clients
    });

    ws.on('close', function close() {
        if (ws === clientTHREE) {
            clientTHREE = null;
            console.log('THREE client disconnected');
            try {
                clientPython.send(JSON.stringify({ type: 'SERVER', command: 'reset' }));
            }
            catch (e) { }
        } else if (ws === clientPython) {
            clientPython = null;
            console.log('PYTHON client disconnected');
            try {
                clientTHREE.send(JSON.stringify({ type: 'SERVER', backend: false }));
            }
            catch (e) { }
        }
    });

});

console.log('WebSocket SERVER is listening on ws://localhost:8080');
