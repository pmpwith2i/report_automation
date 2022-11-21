CREATE TABLE epic (
    id SERIAL PRIMARY KEY,
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE story (
    id SERIAL PRIMARY KEY,
    epic_id INTEGER NOT NULL REFERENCES epic(id),
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES story(id),
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE execution (
    id SERIAL PRIMARY KEY,
    test_id INTEGER NOT NULL REFERENCES test(id),
    result BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );