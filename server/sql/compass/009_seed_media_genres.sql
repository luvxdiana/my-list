-- Media Genre Mapping

WITH genre_mapping (
    title,
    category,
    release_year,
    genre_name
) AS (
    VALUES
        -- Interstellar
        ('Interstellar', 'movie', 2014, 'Science Fiction'),
        ('Interstellar', 'movie', 2014, 'Adventure'),
        ('Interstellar', 'movie', 2014, 'Drama'),

        -- The Conjuring
        ('The Conjuring', 'movie', 2013, 'Horror'),
        ('The Conjuring', 'movie', 2013, 'Thriller'),
        ('The Conjuring', 'movie', 2013, 'Mystery'),

        -- Inside Out
        ('Inside Out', 'movie', 2015, 'Animation'),
        ('Inside Out', 'movie', 2015, 'Family'),
        ('Inside Out', 'movie', 2015, 'Comedy'),
        ('Inside Out', 'movie', 2015, 'Drama'),

        -- Titanic
        ('Titanic', 'movie', 1997, 'Romance'),
        ('Titanic', 'movie', 1997, 'Drama'),

        -- Home Alone
        ('Home Alone', 'movie', 1990, 'Comedy'),
        ('Home Alone', 'movie', 1990, 'Family'),

        -- The Matrix
        ('The Matrix', 'movie', 1999, 'Action'),
        ('The Matrix', 'movie', 1999, 'Science Fiction'),

        -- Inception
        ('Inception', 'movie', 2010, 'Action'),
        ('Inception', 'movie', 2010, 'Science Fiction'),
        ('Inception', 'movie', 2010, 'Adventure'),

        -- Toy Story
        ('Toy Story', 'movie', 1995, 'Animation'),
        ('Toy Story', 'movie', 1995, 'Comedy'),
        ('Toy Story', 'movie', 1995, 'Adventure'),
        ('Toy Story', 'movie', 1995, 'Family'),

        -- Shrek
        ('Shrek', 'movie', 2001, 'Animation'),
        ('Shrek', 'movie', 2001, 'Comedy'),
        ('Shrek', 'movie', 2001, 'Fantasy'),
        ('Shrek', 'movie', 2001, 'Family'),

        -- The Lion King
        ('The Lion King', 'movie', 1994, 'Animation'),
        ('The Lion King', 'movie', 1994, 'Drama'),
        ('The Lion King', 'movie', 1994, 'Family'),
        ('The Lion King', 'movie', 1994, 'Adventure'),

        -- Coco
        ('Coco', 'movie', 2017, 'Animation'),
        ('Coco', 'movie', 2017, 'Family'),
        ('Coco', 'movie', 2017, 'Fantasy'),
        ('Coco', 'movie', 2017, 'Adventure'),

        -- A Quiet Place
        ('A Quiet Place', 'movie', 2018, 'Horror'),
        ('A Quiet Place', 'movie', 2018, 'Thriller'),
        ('A Quiet Place', 'movie', 2018, 'Science Fiction'),

        -- Friends
        ('Friends', 'series', 1994, 'Comedy'),
        ('Friends', 'series', 1994, 'Romance'),

        -- The Good Place
        ('The Good Place', 'series', 2016, 'Comedy'),
        ('The Good Place', 'series', 2016, 'Fantasy'),

        -- The Bear
        ('The Bear', 'series', 2022, 'Drama'),
        ('The Bear', 'series', 2022, 'Comedy'),

        -- Dark
        ('Dark', 'series', 2017, 'Drama'),
        ('Dark', 'series', 2017, 'Mystery'),
        ('Dark', 'series', 2017, 'Science Fiction'),
        ('Dark', 'series', 2017, 'Thriller')
)

INSERT INTO public.media_genres (
    media_id,
    genre_id
)
SELECT
    media.id,
    genres.id
FROM genre_mapping AS mapping

JOIN public.media_catalog AS media
    ON media.title = mapping.title
    AND media.category = mapping.category
    AND media.release_year = mapping.release_year

JOIN public.genres AS genres
    ON genres.name = mapping.genre_name

ON CONFLICT (media_id, genre_id) DO NOTHING;


-- Verify Media Genres

SELECT
    media.title,
    media.category,
    COALESCE(
        STRING_AGG(genres.name, ', ' ORDER BY genres.name),
        'No genres'
    ) AS genres
FROM public.media_catalog AS media

LEFT JOIN public.media_genres AS mg
    ON mg.media_id = media.id

LEFT JOIN public.genres AS genres
    ON genres.id = mg.genre_id

GROUP BY
    media.id,
    media.title,
    media.category

ORDER BY
    media.category,
    media.title;