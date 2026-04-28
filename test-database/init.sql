CREATE TABLE IF NOT EXISTS user_login (
    user_id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_sessions (
    username TEXT PRIMARY KEY REFERENCES user_login(username),
    session_token TEXT NOT NULL,
    expire_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_profile (
    username TEXT PRIMARY KEY REFERENCES user_login(username),
    email    TEXT NOT NULL,
    age      INTEGER NOT NULL,
    weight   INTEGER NOT NULL,
    heightin INTEGER NOT NULL,
    gender   TEXT NOT NULL,
    activitylevel TEXT NOT NULL,
    avg_steps_7_days FLOAT NOT NULL DEFAULT 0.0,
    goal_hit_rate FLOAT NOT NULL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS user_daily_steps (
    username  TEXT REFERENCES user_login(username),
    steps     INTEGER DEFAULT 0,
    curr_date DATE NOT NULL,

    PRIMARY KEY (username, curr_date)
);

CREATE TABLE IF NOT EXISTS user_workout_logs (
    username  TEXT REFERENCES user_login(username);
    logged_at TIMESTAMP NOT NULL,
    note       TEXT NOT NULL,

    PRIMARY KEY (username, logged_at)
);