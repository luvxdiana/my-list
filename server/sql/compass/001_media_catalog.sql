-- Media Catalog

CREATE TABLE IF NOT EXISTS public.media_catalog (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    category VARCHAR(10) NOT NULL
        CHECK (category IN ('movie', 'series')),

    release_year INTEGER,

    duration_minutes INTEGER
        CHECK (duration_minutes > 0),

    description TEXT,

    tmdb_id INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT media_catalog_tmdb_unique
        UNIQUE (category, tmdb_id)
);