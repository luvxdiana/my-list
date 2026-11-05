-- Compass Feedback

CREATE TABLE IF NOT EXISTS public.compass_feedback (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    recommendation_id BIGINT NOT NULL UNIQUE
        REFERENCES public.compass_recommendations(id)
        ON DELETE CASCADE,

    emotional_fit_rating SMALLINT NOT NULL
        CHECK (
            emotional_fit_rating BETWEEN 1 AND 5
        ),

    media_rating NUMERIC(2,1)
        CHECK (
            media_rating BETWEEN 0.5 AND 5
            AND media_rating * 2 = TRUNC(media_rating * 2)
        ),

    desired_emotion_achieved BOOLEAN,

    comment TEXT
        CHECK (
            CHAR_LENGTH(comment) <= 2000
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);