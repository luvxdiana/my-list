-- Compass Requests

CREATE TABLE IF NOT EXISTS public.compass_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    current_mood VARCHAR(20) NOT NULL
        CHECK (
            current_mood IN (
                'happy',
                'sad',
                'anxious',
                'calm',
                'tired',
                'excited'
            )
        ),

    desired_emotion VARCHAR(30) NOT NULL
        REFERENCES public.emotions(code),

    available_time VARCHAR(10) NOT NULL
        CHECK (
            available_time IN (
                '30',
                '60',
                '90',
                '120',
                '180plus'
            )
        ),

    content_type VARCHAR(10) NOT NULL
        CHECK (
            content_type IN (
                'movie',
                'series',
                'either'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_compass_requests_user
ON public.compass_requests (user_id, created_at DESC);