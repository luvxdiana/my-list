-- Compass Recommendations

CREATE TABLE IF NOT EXISTS public.compass_recommendations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    request_id BIGINT NOT NULL
        REFERENCES public.compass_requests(id)
        ON DELETE CASCADE,

    media_id BIGINT NOT NULL
        REFERENCES public.media_catalog(id)
        ON DELETE RESTRICT,

    position SMALLINT NOT NULL
        CHECK (position BETWEEN 1 AND 3),

    score NUMERIC(6,5)
        CHECK (score BETWEEN 0 AND 1),

    algorithm_version VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_compass_request_position
        UNIQUE (request_id, position),

    CONSTRAINT unique_compass_request_media
        UNIQUE (request_id, media_id)
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_compass_recommendations_media
ON public.compass_recommendations (media_id);