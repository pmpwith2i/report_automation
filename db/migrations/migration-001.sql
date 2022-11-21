CREATE TABLE epic (
    id VARCHAR(32) PRIMARY KEY,
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE story (
    id VARCHAR(32) PRIMARY KEY,
    epic_id VARCHAR(32) NOT NULL REFERENCES epic(id),
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE test (
    id VARCHAR(32) PRIMARY KEY,
    story_id VARCHAR(32) NOT NULL REFERENCES story(id),
    supersede TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE execution (
    id VARCHAR(32) PRIMARY KEY,
    test_id VARCHAR(32) NOT NULL REFERENCES test(id),
    result BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );