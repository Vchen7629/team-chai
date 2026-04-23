from sklearn.base import RegressorMixin
from sklearn.metrics import r2_score
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import root_mean_squared_error
from training.helpers import FEATURES
import numpy as np


def evaluate(model: RegressorMixin, X_test: np.ndarray, Y_test: np.ndarray) -> None:
    """Evaluate the model performance on metrics like MAE, RMSE, and R^2 score"""
    y_pred = model.predict(X_test)

    # dont use accuracy or precision since its a regression problem not classification

    # how much model's predictions are off by (steps) on average
    mae = mean_absolute_error(Y_test, y_pred)

    rmse = root_mean_squared_error(Y_test, y_pred)

    # percentage of time the model understands why the step goals are the value based on their
    # features like age, activity level, bmi, etc. Artificially high since our dataset is generated
    # based on a formula but isnt 100% due to the random noise in dataset
    r2 = r2_score(Y_test, y_pred)

    print(f"MAE: {mae:.0f} steps")
    print(f"RMSE: {rmse:.0f} steps")
    print(f"R^2: {r2:.4f}")


def print_feature_importance(model: RegressorMixin) -> None:
    """Show which features dominate the predictions, used for both xgboost and random forest"""
    importance = model.feature_importances_
    ranked = sorted(zip(FEATURES, importance), key=lambda x: x[1], reverse=True)

    print("\nFeature importance:")
    for feature, score in ranked:
        print(f"  {feature:<25} {score:.4f}")
