-- Initial Media Emotion Mapping

WITH emotion_mapping (
    title,
    category,
    release_year,
    emotion_code
) AS (
    VALUES
        -- Interstellar
        ('Interstellar', 'movie', 2014, 'inspiration'),
        ('Interstellar', 'movie', 2014, 'thrill'),

        -- The Conjuring
        ('The Conjuring', 'movie', 2013, 'thrill'),
        ('The Conjuring', 'movie', 2013, 'energy'),

        -- Inside Out
        ('Inside Out', 'movie', 2015, 'joy'),
        ('Inside Out', 'movie', 2015, 'comfort'),
        ('Inside Out', 'movie', 2015, 'inspiration'),

        -- Titanic
        ('Titanic', 'movie', 1997, 'inspiration'),

        -- Home Alone
        ('Home Alone', 'movie', 1990, 'joy'),
        ('Home Alone', 'movie', 1990, 'comfort'),
        ('Home Alone', 'movie', 1990, 'energy'),

        -- The Matrix
        ('The Matrix', 'movie', 1999, 'thrill'),
        ('The Matrix', 'movie', 1999, 'energy'),
        ('The Matrix', 'movie', 1999, 'inspiration'),

        -- Inception
        ('Inception', 'movie', 2010, 'thrill'),
        ('Inception', 'movie', 2010, 'inspiration'),

        -- Toy Story
        ('Toy Story', 'movie', 1995, 'joy'),
        ('Toy Story', 'movie', 1995, 'comfort'),

        -- Shrek
        ('Shrek', 'movie', 2001, 'joy'),
        ('Shrek', 'movie', 2001, 'comfort'),
        ('Shrek', 'movie', 2001, 'energy'),

        -- The Lion King
        ('The Lion King', 'movie', 1994, 'inspiration'),

        -- Coco
        ('Coco', 'movie', 2017, 'comfort'),
        ('Coco', 'movie', 2017, 'inspiration'),

        -- A Quiet Place
        ('A Quiet Place', 'movie', 2018, 'thrill'),
        ('A Quiet Place', 'movie', 2018, 'energy'),

        -- Friends
        ('Friends', 'series', 1994, 'joy'),
        ('Friends', 'series', 1994, 'comfort'),
        ('Friends', 'series', 1994, 'calm'),

        -- The Good Place
        ('The Good Place', 'series', 2016, 'joy'),
        ('The Good Place', 'series', 2016, 'comfort'),
        ('The Good Place', 'series', 2016, 'inspiration'),

        -- The Bear
        ('The Bear', 'series', 2022, 'energy'),
        ('The Bear', 'series', 2022, 'inspiration'),

        -- Dark
        ('Dark', 'series', 2017, 'thrill')
)

INSERT INTO public.media_emotions (
    media_id,
    emotion_id
)
SELECT
    media.id,
    emotions.id
FROM emotion_mapping AS mapping

JOIN public.media_catalog AS media
    ON media.title = mapping.title
    AND media.category = mapping.category
    AND media.release_year = mapping.release_year

JOIN public.emotions AS emotions
    ON emotions.code = mapping.emotion_code

ON CONFLICT (media_id, emotion_id) DO NOTHING;


-- Verify Emotion Mapping

SELECT
    media.title,
    media.category,
    COALESCE(
        STRING_AGG(emotions.name, ', ' ORDER BY emotions.name),
        'No emotions'
    ) AS emotions
FROM public.media_catalog AS media

LEFT JOIN public.media_emotions AS me
    ON me.media_id = media.id

LEFT JOIN public.emotions AS emotions
    ON emotions.id = me.emotion_id

GROUP BY
    media.id,
    media.title,
    media.category

ORDER BY
    media.category,
    media.title;