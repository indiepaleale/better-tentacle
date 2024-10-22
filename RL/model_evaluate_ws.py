import asyncio
import websockets
import json

import os
import glob
import time
from datetime import datetime

import torch
import numpy as np

from PPO import PPO
from tentacle import TentacleEnv
import asyncio

import json

############################### MODEL LOADING ###############################
checkpoint_path = "PPO_preTrained/Custom Tentacle-v0/PPO_Custom Tentacle-v0_0_1.pth"
ws_uri = "ws://localhost:8888"
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

############################### MODEL LOADING ###################################


async def ws_loop(ws_url="ws://localhost:8888"):
    async with websockets.connect(ws_url) as websocket:
        # Identify as python backend
        await websocket.send(json.dumps({"type": "identify", "role": "python"}))
        global env
        state = env.reset()

        while True:
            message = await websocket.recv()
            data = json.loads(message)
            ## print(data)
            if isinstance(data, dict):
                if data["type"] == "command" and data["command"] == "step":
                    # Perform a step using the passed function
                    action = ppo_agent.select_action(state)
                    state, reward, _ = env.step(action)

                    control_pos = state[:4].tolist()
                    target = state[-3:].tolist()

                    await websocket.send(
                        json.dumps(
                            {
                                "type": "state",
                                "pos": control_pos,
                                "target": target,
                                "reward": reward,
                            }
                        )
                    )

                elif data["type"] == "command" and data["command"] == "reset":
                    # Reset using the passed function
                    state = env.reset()
                    control_pos = state[:4].tolist()
                    target = state[-3:].tolist()
                    await websocket.send(
                        json.dumps(
                            {"type": "state", "pos": control_pos, "target": target}
                        )
                    )


asyncio.get_event_loop().run_until_complete(ws_loop(ws_uri))
