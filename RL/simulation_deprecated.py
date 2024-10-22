import os
import glob
import time
from datetime import datetime

import torch
import numpy as np

from PPO import PPO
from tentacle import TentacleEnv
import asyncio
import websocket
import json

checkpoint_path = "PPO_preTrained/Custom Tentacle-v0/PPO_Custom Tentacle-v0_0_1.pth"
ws_uri = "ws://localhost:8080"
has_continuous_action_space = True  # continuous action space; else discrete

action_std = 0.1  # starting std for action distribution (Multivariate Normal)
K_epochs = 80  # update policy for K epochs in one PPO update
eps_clip = 0.2  # clip parameter for PPO
gamma = 0.99  # discount factor
lr_actor = 0.0003  # learning rate for actor network
lr_critic = 0.001  # learning rate for critic network

random_seed = 0  # set random seed if required (0 = no random seed)

state_dim = 14

action_dim = 4

ppo_agent = PPO(
    state_dim,
    action_dim,
    lr_actor,
    lr_critic,
    gamma,
    K_epochs,
    eps_clip,
    has_continuous_action_space,
    action_std,
)

# Load the model weights
ppo_agent.load(checkpoint_path)

print("Model loaded successfully from", checkpoint_path)
env = TentacleEnv(2, 32, 1.5)

state = env.reset()

def on_message(ws, message):
    global state
    data = json.loads(message)  # Deserialize JSON string to Python object
    if data["command"] == "tick":
        action = ppo_agent.select_action(state)
        state, reward, done = env.step(action)

        control_pos = state[:4].tolist()
        target = state[-3:].tolist()

        # print("tick", control_pos, target)
        ws.send(json.dumps({"type": "PYTHON", "pos": control_pos, "target": target}))

    if data["command"] == "reset":
        print("reset")
        state = env.reset()
        control_pos = state[:4].tolist()
        target = state[-3:].tolist()

        print("reset", control_pos, target)
        ws.send(json.dumps({"type": "PYTHON", "pos": control_pos, "target": target}))


def on_error(ws, error):

    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    print("Server connected")
    ws.send(json.dumps({"type": "PYTHON", "message": "Hello from Python"}))


if __name__ == "__main__":
    websocket.enableTrace(False)

    ws = websocket.WebSocketApp(
        ws_uri, on_message=on_message, on_error=on_error, on_close=on_close
    )

    ws.on_open = on_open
    ws.run_forever()
    print("Python client started")
    
