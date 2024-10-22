import asyncio
import websockets
import json

clients = {}  # Track connected clients


async def handle_client(websocket, path):
    # When a client connects, store it in the clients dictionary
    try:
        while True:
            message = (
                await websocket.recv()
            )  # This will raise an exception if the client disconnects
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                print("Invalid message received")
                continue
            if not isinstance(data, dict):
                print(data)
                continue
            # Frontend sends step/reset command
            if data["type"] == "command":
                if "python" in clients:
                    await clients["python"].send(json.dumps(data))
                else:
                    await websocket.send(json.dumps({"error": "Python not connected"}))

            # Backend (Python) sends state update
            elif data["type"] == "state":
                if "frontend" in clients:
                    await clients["frontend"].send(json.dumps(data))

            # Handling connection
            elif data["type"] == "identify":
                role = data["role"]
                if role not in ["frontend", "python"]:
                    print(f"Invalid role: {role}")
                    continue
                print(f"Client connected as {role}")
                clients[role] = websocket

                await websocket.send(json.dumps("Connected as " + role)) 

                if role == "frontend":
                    if "python" in clients:
                        await websocket.send(
                            json.dumps(
                                {"type": "message", "status": "ready"}
                            )
                        )
                    else:
                        await websocket.send(
                            json.dumps({"type": "message","status": "waiting"})
                        )
                elif role == "python":
                    if "frontend" in clients:
                        await clients["frontend"].send(
                            json.dumps({"type": "message", "status": "ready"})
                        )

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client disconnected: {e}")
    finally:
        # Always remove the client from the clients map when disconnected
        for k, v in clients.items():
            if v == websocket:
                del clients[k]
                break


# Start the WebSocket server
async def main():
    async with websockets.serve(handle_client, "localhost", 8888):
        await asyncio.Future()  # Run forever


asyncio.run(main())