from dataset.sample import rng
from dataclasses import dataclass
from dataset.sample import ActivityLevel
import numpy as np

ACTIVITY_BASE_GOALS = {
    ActivityLevel.SEDENTARY:   5000,
    ActivityLevel.LIGHT:       7000,
    ActivityLevel.MODERATE:    8500,
    ActivityLevel.ACTIVE:      10000,
    ActivityLevel.VERY_ACTIVE: 12000,
}

@dataclass(frozen=True)
class _AgeModifier:
    teem_max: int = 18
    middle_age_min: int = 40
    middle_age_max: int = 60
    senior_min: int = 61
    senior_max: int = 75

    # modifiers on base goal step count
    teen_adjustment: int = +400
    middle_age_adjustment: int = -500
    senior_adjustment: int = -1250
    elderly_adjustment: int = -2000

@dataclass(frozen=True)
class _BmiModifier:
    underweight_max: float = 18.5
    healthy_max: float = 25.0
    overweight_max: float = 30.0

    underweight_adjustment: int = -300
    overweight_adjustment: int = +200
    obese_adjustment: int = +500

GOAL_NOISE_STD = 300.0

AGE_MOD = _AgeModifier()
BMI_MOD = _BmiModifier()

def compute_demographic_step_goal(age: np.ndarray, bmi: np.ndarray, activity: np.ndarray) -> np.ndarray:
    """Generate step goals based on person demographics like age, bmi and activity level. Used for all users in the dataset"""
    base = np.vectorize(ACTIVITY_BASE_GOALS.get)(activity) # np array of step count based on activity base goals

    age_mod = np.where(age < AGE_MOD.teem_max, AGE_MOD.teen_adjustment,
                np.where((age >= AGE_MOD.middle_age_min) & (age < AGE_MOD.middle_age_max), AGE_MOD.middle_age_adjustment,
                np.where((age >= AGE_MOD.senior_min) & (age < AGE_MOD.senior_max), AGE_MOD.senior_adjustment,
                np.where(age >= AGE_MOD.senior_max, AGE_MOD.elderly_adjustment, 0))))

    bmi_mod = np.where(bmi < BMI_MOD.underweight_max, BMI_MOD.underweight_adjustment,
                np.where(bmi < BMI_MOD.healthy_max, 0, 
                np.where(bmi < BMI_MOD.overweight_max, BMI_MOD.overweight_adjustment,
                         BMI_MOD.obese_adjustment)))

    noise = rng.normal(0, GOAL_NOISE_STD, len(age))

    return (base + age_mod + bmi_mod + noise)


def compute_avg_daily_steps(activity: np.ndarray, num_users: int) -> np.ndarray:
    """
    Generate average step counts based on user activity levels
    Used for the returning users in the dataset to teach the model to work with users
    who have a step history
    """
    # ActivityLevel: (avg steps a day, std)
    params = {
        ActivityLevel.SEDENTARY: (4000, 800),
        ActivityLevel.LIGHT: (6000, 1000),
        ActivityLevel.MODERATE: (8000, 1200),
        ActivityLevel.ACTIVE: (10000, 1500),
        ActivityLevel.VERY_ACTIVE: (12000, 2000)
    }

    result = np.zeros(num_users)

    for level, (avg_step, step_std) in params.items():
        is_activity_level = activity == level

        # collect all users with the same activity level and sample it together
        result[is_activity_level] = rng.normal(avg_step, step_std, is_activity_level.sum())
    
    return result