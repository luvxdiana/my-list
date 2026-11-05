-- Genres

CREATE TABLE IF NOT EXISTS public.genres (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(60) NOT NULL UNIQUE
);

-- Media Genres

CREATE TABLE IF NOT EXISTS public.media_genres (
    media_id BIGINT NOT NULL
        REFERENCES public.media_catalog(id)
        ON DELETE CASCADE,

    genre_id BIGINT NOT NULL
        REFERENCES public.genres(id)
        ON DELETE CASCADE,

    PRIMARY KEY (media_id, genre_id)
);

-- Default Genres

INSERT INTO public.genres (name)
VALUES
    ('Action'),
    ('Adventure'),
    ('Animation'),
    ('Comedy'),
    ('Crime'),
    ('Documentary'),
    ('Drama'),
    ('Family'),
    ('Fantasy'),
    ('History'),
    ('Horror'),
    ('Mystery'),
    ('Romance'),
    ('Science Fiction'),
    ('Thriller'),
    ('War')
ON CONFLICT (name) DO NOTHING;