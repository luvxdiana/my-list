-- Initial Media Catalog

INSERT INTO public.media_catalog (
    title,
    category,
    release_year,
    duration_minutes
)
SELECT
    source.title,
    source.category,
    source.release_year,
    source.duration_minutes
FROM (
    VALUES
        ('Interstellar', 'movie', 2014, 169),
        ('The Conjuring', 'movie', 2013, 112),
        ('Inside Out', 'movie', 2015, 95),
        ('Titanic', 'movie', 1997, 194),
        ('Home Alone', 'movie', 1990, 103),
        ('The Matrix', 'movie', 1999, 136),
        ('Inception', 'movie', 2010, 148),
        ('Toy Story', 'movie', 1995, 81),
        ('Shrek', 'movie', 2001, 90),
        ('The Lion King', 'movie', 1994, 88),
        ('Coco', 'movie', 2017, 105),
        ('A Quiet Place', 'movie', 2018, 90),

        ('Friends', 'series', 1994, 22),
        ('The Good Place', 'series', 2016, 22),
        ('The Bear', 'series', 2022, 30),
        ('Dark', 'series', 2017, 55)
) AS source (
    title,
    category,
    release_year,
    duration_minutes
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.media_catalog AS existing
    WHERE existing.title = source.title
      AND existing.category = source.category
      AND existing.release_year = source.release_year
);

-- Verify Catalog

SELECT
    id,
    title,
    category,
    release_year,
    duration_minutes
FROM public.media_catalog
ORDER BY category, title;