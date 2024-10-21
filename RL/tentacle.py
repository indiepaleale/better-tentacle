import numpy as np
import random
import time


# reset
# reward
# step (action)
# new target

dT = 0.1
MAX_ACC = 2
MAX_VEL = 5
MAX_POS = 5


class TentacleEnv:
    def __init__(self, num_segments, segment_length, segment_radius):
        self.num_segments = num_segments
        self.segment_length = segment_length
        self.segment_radius = segment_radius

        self.reset()
        self._update_target()

        self.steps = 0

    def reset(self):
        self.steps = 0
        self.pointing = np.array([0, 1, 0])
        self.control_pos = np.zeros(4)
        self.control_vel = np.zeros(4)
        self.control_acc = np.zeros(4)
        self._update_target()
        
        observation = np.concatenate(
            [self.control_pos, self.control_vel, self.pointing, self.target]
        )
        return observation

    def step(self, action):
        self.steps += 1
        # print(action)
        self.control_acc = action
        self.control_acc = np.clip(self.control_acc, -MAX_ACC, MAX_ACC)

        new_vel = self.control_vel + self.control_acc * dT
        new_vel = np.clip(new_vel, -MAX_VEL, MAX_VEL)

        new_pos = self.control_pos + new_vel * dT
        new_pos = np.clip(new_pos, -MAX_POS, MAX_POS)

        self.control_pos = new_pos
        self._fk(self.control_pos)

        vel = np.linalg.norm(self.control_vel)
        acc = np.linalg.norm(self.control_acc)
        angle = self._angle_off() / np.pi


        observation = np.concatenate(
            [self.control_pos, self.control_vel, self.pointing, self.target]
        )
        
        on_target = angle < 0.1 and vel < 0.1

        reward = -(angle**2) - 0.1 * vel**2 - 0.001 * acc**2

        if on_target:
            reward += 1
            self._update_target()
        
        return observation, reward, on_target

    def _get_reward(self):
        vel = np.linalg.norm(self.control_vel)
        acc = np.linalg.norm(self.control_acc)
        angle = self._angle_off() / np.pi

        r = -(angle**2) - 0.1 * vel**2 - 0.001 * acc**2
        if angle < np.pi / 10:
            r += 1
        return r

    def _angle_off(self):
        angle = np.arccos(
            np.dot(self.pointing, self.target)
            / (np.linalg.norm(self.pointing) * np.linalg.norm(self.target))
        )
        return angle

    def _update_target(self):
        target = np.random.rand(3)
        target = target / np.linalg.norm(target)
        self.target = target

    def _fk(self, controls):
        x1, z1, x2, z2 = controls

        t_pointing = np.array([0, 1, 0])

        matrix_1 = self._calculate_rotation_matrix(x1, z1)
        t_pointing = self._apply_matrix(matrix_1, t_pointing)

        matrix_2 = self._calculate_rotation_matrix(x2, z2)
        t_pointing = self._apply_matrix(matrix_2, t_pointing)

        self.pointing = t_pointing

        return t_pointing

    def _calculate_rotation_matrix(self, x, z):
        if z == 0:
            alpha = np.pi / 2
            theta = x / self.segment_radius
        elif x == 0:
            alpha = 0
            theta = z / self.segment_radius
        else:
            alpha = np.arctan(z / x)
            theta = z / (np.cos(alpha) * self.segment_radius)

        cos_theta = np.cos(theta)
        sin_theta = np.sin(theta)
        cos_alpha = np.cos(alpha)
        sin_alpha = np.sin(alpha)
        one_minus_cos_theta = 1 - cos_theta

        R = np.array(
            [
                [
                    cos_theta + cos_alpha**2 * one_minus_cos_theta,
                    sin_alpha * sin_theta,
                    cos_alpha * sin_alpha * one_minus_cos_theta,
                ],
                [-sin_alpha * sin_theta, cos_theta, cos_alpha * sin_theta],
                [
                    cos_alpha * sin_alpha * one_minus_cos_theta,
                    -cos_alpha * sin_theta,
                    cos_theta + sin_alpha**2 * one_minus_cos_theta,
                ],
            ]
        )
        return R

    def _apply_matrix(self, matrix, vector):
        return np.dot(matrix, vector)


def simulate():
    tentacle = TentacleEnv(2, 32, 2)
    num_games = 10000
    total_time = 0

    for i in range(num_games):
        start_time = time.time()

        # Perform one step of the simulation
        action = np.random.uniform(-2, 2, 4)  # Example action
        tentacle.step(action)
        r = tentacle.get_reward()

        end_time = time.time()
        iteration_time = end_time - start_time
        total_time += iteration_time

        # Calculate iterations per second
        ips = 1 / iteration_time if iteration_time > 0 else float("inf")
        print(
            f"Iteration {i+1} took {iteration_time:.6f} seconds, IPS: {ips:.2f}, Reward: {r}"
        )

    average_time_per_iteration = total_time / num_games
    print(f"Average time per iteration: {average_time_per_iteration:.6f} seconds")

    print("tentacle.pointing:", tentacle.pointing)


if __name__ == "__main__":
    simulate()
