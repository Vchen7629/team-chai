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
    targetsteps INTEGER NOT NULL
);