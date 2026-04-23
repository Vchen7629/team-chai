from dataclasses import dataclass
from dataset.sample import rng
from dataset.step_count import compute_avg_daily_steps
from dataset.step_count import compute_demographic_step_goal
from dataset.sample import sample_demographics
import numpy as np
import polars as pl

N_SAMPLES = 10000

# 40% of dataset is new users with no steps history
# and 60% is returning users with steps history so model
# can learn to work with both initial steps recommendations
# and recommendations using user step data
NEW_USER_FRAC = 0.40

@dataclass(frozen=True)
class _HitRateConfig:
    high_threshold: float = 0.8 
    mid_threshold: float = 0.5
    high_multiplier: float = 1.10 # progressive overload
    mid_multiplier: float = 1.00
    low_multiplier: float = 0.95

HISTORY_STEP_GOAL_WEIGHT = 0.6
DEMOGRAPHIC_STEP_GOAL_WEIGHT = 0.4

HIT_RATE = _HitRateConfig()

def generate_dataset() -> pl.DataFrame:
    n_new_users = int(N_SAMPLES*NEW_USER_FRAC)
    n_ret_users = N_SAMPLES - n_new_users

    new_demo = sample_demographics(n_new_users)
    new_step_goal = compute_demographic_step_goal(
        new_demo["age"], new_demo["bmi"], new_demo["activity_level"]
    )

    new_user_df = pl.DataFrame({
        **new_demo,
        "avg_steps_last_7days": np.zeros(n_new_users),
        "goal_hit_rate": np.zeros(n_new_users),
        "step_goal": new_step_goal.round().astype(int) 
    })

    ret_demo = sample_demographics(n_ret_users)
    avg_steps = compute_avg_daily_steps(ret_demo["activity_level"], n_ret_users)
    # beta(6, 4) gives mean hit rate ~0.6, skewed toward success
    hit_goal_rate = rng.beta(6, 4, n_ret_users).clip(0, 1)

    hist_step_goal = np.where(hit_goal_rate > HIT_RATE.high_threshold, avg_steps * HIT_RATE.high_multiplier,
                     np.where(hit_goal_rate > HIT_RATE.mid_threshold, avg_steps * HIT_RATE.mid_multiplier,
                              avg_steps * HIT_RATE.low_multiplier))
                
    ret_demo_step_goal = compute_demographic_step_goal(
        ret_demo["age"], ret_demo["bmi"], ret_demo["activity_level"]
    )

    noise = rng.normal(0, 300, n_ret_users)
    ret_step_goal = (
        HISTORY_STEP_GOAL_WEIGHT * hist_step_goal + DEMOGRAPHIC_STEP_GOAL_WEIGHT * ret_demo_step_goal + noise
    )

    ret_user_df = pl.DataFrame({
        **ret_demo,
        "avg_steps_last_7days": avg_steps.round(1),
        "goal_hit_rate": hit_goal_rate.round(3),
        "step_goal": ret_step_goal.round().astype(int) 
    })

    return (
        pl.concat([new_user_df, ret_user_df])
        .sample(fraction=1.0, shuffle=True, seed=42)
    )

if __name__ == "__main__":
    df = generate_dataset()
    print(df.head())
    print(df.describe())
    df.write_csv("dataset_output/data3.csv")