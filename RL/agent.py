import torch
import torch.nn.functional as F
import random
import numpy as np
from collections import deque
from model import Linear_QNet, QTrainer
from tentacle import TentacleEnv

MAX_MEMORY = 100_000
BATCH_SIZE = 1000
LR = 0.001

TRADEOFF_GAMES = 100


class Agent:

    def __init__(self):
        self.n_games = 0
        self.epsilon = 0  # randomness
        self.gamma = 0.9  # discount rate
        self.memory = deque(maxlen=MAX_MEMORY)  # popleft()
        self.model = Linear_QNet(4, 256, 3).to(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        self.trainer = QTrainer(self.model, lr=LR, gamma=self.gamma)

    def get_state(self, tentacle):

        return np.hstack((
            tentacle.control_pos,
            tentacle.control_vel,
            tentacle.pointing,
            tentacle.target,
        ))

    def remember(self, state, action, reward, next_state, on_target):
        self.memory.append(
            (state, action, reward, next_state, on_target)
        )  # popleft if MAX_MEMORY is reached

    def train_long_memory(self):
        if len(self.memory) > BATCH_SIZE:
            mini_sample = random.sample(self.memory, BATCH_SIZE)  # list of tuples
        else:
            mini_sample = self.memory

        states, actions, rewards, next_states, on_targets = zip(*mini_sample)
        self.trainer.train_step(states, actions, rewards, next_states, on_targets)
        # for state, action, reward, nexrt_state, done in mini_sample:
        #    self.trainer.train_step(state, action, reward, next_state, done)

    def train_short_memory(self, state, action, reward, next_state, on_target):
        self.trainer.train_step(state, action, reward, next_state, on_target)

    def get_action(self, state):
        # random moves: tradeoff exploration / exploitation
        self.epsilon = TRADEOFF_GAMES - self.n_games
        action = [0, 0, 0, 0]
        if random.randint(0, 200) < self.epsilon:
            action = np.random.uniform(-2, 2, size=(4,))

        else:
            state0 = torch.tensor(state, dtype=torch.float)
            prediction = self.model(state0)
            action = F.softmax(prediction).detach().cpu().numpy().flatten()

        return action
