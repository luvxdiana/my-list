
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entries (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    category VARCHAR(20) NOT NULL
        CHECK (category IN (
            'anime', 'series', 'movie', 'book', 'game'
        )),

    genre VARCHAR(100),
    description TEXT,
    review TEXT,
    image_url TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'planned'
        CHECK (status IN (
            'planned', 'in_progress',
            'completed', 'dropped', 'on_hold'
        )),

    rating SMALLINT
        CHECK (rating BETWEEN 1 AND 5),

    total_episodes INTEGER
        CHECK (total_episodes >= 0),

    total_pages INTEGER
        CHECK (total_pages >= 0),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_user_category
ON entries(user_id, category);
