-- Compass Preferences

CREATE TABLE IF NOT EXISTS public.compass_preferences (
    user_id BIGINT PRIMARY KEY
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    preferred_content_type VARCHAR(10) NOT NULL
        DEFAULT 'either'
        CHECK (
            preferred_content_type IN (
                'movie',
                'series',
                'either'
            )
        ),

    onboarding_completed BOOLEAN NOT NULL
        DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Preferred Genres

CREATE TABLE IF NOT EXISTS public.compass_preferred_genres (
    user_id BIGINT NOT NULL
        REFERENCES public.compass_preferences(user_id)
        ON DELETE CASCADE,

    genre_id BIGINT NOT NULL
        REFERENCES public.genres(id)
        ON DELETE RESTRICT,

    PRIMARY KEY (user_id, genre_id)
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_compass_preferred_genres_genre
ON public.compass_preferred_genres (genre_id);