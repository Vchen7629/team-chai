import polars as pl


def check_distributions(df: pl.DataFrame) -> None:
    """This is just to check the distribution of the training dataset for validation"""
    print(f"df shape: {df.shape}\n")
    print(f"Describe: {df.describe()}\n")

    new = df.filter(pl.col("avg_steps_last_7days") == 0)
    returning = df.filter(pl.col("avg_steps_last_7days") > 0)
    print(f"New users:       {len(new)} ({len(new) / len(df):.0%})")
    print(f"Returning users: {len(returning)} ({len(returning) / len(df):.0%})")

    gender_map = {"0": "male", "1": "female", "2": "other", "3": "prefer_not_to_say"}
    activity_map = {
        "1": "sedentary",
        "2": "light",
        "3": "moderate",
        "4": "active",
        "5": "very_active",
    }
    df = df.with_columns(
        [
            pl.col("gender").cast(pl.String).replace(gender_map),
            pl.col("activity_level").cast(pl.String).replace(activity_map),
            pl.col("step_goal").cast(pl.Float64),
        ]
    )

    print(f"Gender distribution: {df.group_by('gender').len().sort('gender')}")
    print(
        f"Activity level distribution: {df.group_by('activity_level').len().sort('activity_level')}"
    )

    returning = returning.with_columns(
        [
            pl.col("activity_level").cast(pl.String).replace(activity_map),
            pl.col("step_goal").cast(pl.Float64),
        ]
    )
    print(
        f"\nStep goal by activity level (returning users): {
            returning.group_by('activity_level')
            .agg(
                pl.col('step_goal').mean().alias('avg_goal'),
                pl.col('avg_steps_last_7days').mean().alias('avg_steps'),
            )
            .sort('activity_level')
        }"
    )


if __name__ == "__main__":
    df = pl.read_csv("dataset_output/data.csv")
    check_distributions(df)
