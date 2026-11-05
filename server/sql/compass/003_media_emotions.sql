-- Emotions

CREATE TABLE IF NOT EXISTS public.emotions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    code VARCHAR(30) NOT NULL UNIQUE,

    name VARCHAR(60) NOT NULL
);

-- Media Emotions

CREATE TABLE IF NOT EXISTS public.media_emotions (
    media_id BIGINT NOT NULL
        REFERENCES public.media_catalog(id)
        ON DELETE CASCADE,

    emotion_id BIGINT NOT NULL
        REFERENCES public.emotions(id)
        ON DELETE CASCADE,

    PRIMARY KEY (media_id, emotion_id)
);

-- Default Emotions

INSERT INTO public.emotions (code, name)
VALUES
    ('joy', 'Joy'),
    ('comfort', 'Comfort'),
    ('calm', 'Peace'),
    ('inspiration', 'Inspiration'),
    ('thrill', 'Excitement'),
    ('energy', 'Energy')
ON CONFLICT (code) DO NOTHING;