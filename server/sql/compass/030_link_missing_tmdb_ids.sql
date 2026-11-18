BEGIN;

DO $$
DECLARE
    item RECORD;
    media_row public.media_catalog%ROWTYPE;
    conflicting_id BIGINT;
    changed_count INTEGER := 0;
    already_linked_count INTEGER := 0;
BEGIN
    FOR item IN
        SELECT * FROM (VALUES
            (1,  'The Matrix',      'movie',  1999, 603),
            (2,  'Dark',            'series', 2017, 70523),
            (3,  'The Bear',        'series', 2022, 136315),
            (4,  'Coco',            'movie',  2017, 354912),
            (5,  'Friends',         'series', 1994, 1668),
            (6,  'A Quiet Place',   'movie',  2018, 447332),
            (7,  'The Lion King',   'movie',  1994, 8587),
            (8,  'Shrek',           'movie',  2001, 808),
            (9,  'Inception',       'movie',  2010, 27205),
            (10, 'Titanic',         'movie',  1997, 597),
            (11, 'Inside Out',      'movie',  2015, 150540),
            (12, 'Home Alone',      'movie',  1990, 771),
            (13, 'The Conjuring',   'movie',  2013, 138843),
            (14, 'The Good Place',  'series', 2016, 66573),
            (15, 'Toy Story',       'movie',  1995, 862),
            (16, 'Interstellar',    'movie',  2014, 157336)
        ) AS expected(id, title, category, release_year, tmdb_id)
    LOOP
        SELECT * INTO media_row
        FROM public.media_catalog
        WHERE id = item.id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Missing catalog media id %', item.id;
        END IF;

        IF media_row.title IS DISTINCT FROM item.title
           OR media_row.category::text IS DISTINCT FROM item.category
           OR media_row.release_year IS DISTINCT FROM item.release_year THEN
            RAISE EXCEPTION 'Catalog media id % does not match expected title/category/year', item.id;
        END IF;

        IF media_row.tmdb_id IS NOT NULL AND media_row.tmdb_id <> item.tmdb_id THEN
            RAISE EXCEPTION 'Media id % has unexpected TMDB id % (expected %)',
                item.id, media_row.tmdb_id, item.tmdb_id;
        END IF;

        SELECT id INTO conflicting_id
        FROM public.media_catalog
        WHERE category::text = item.category
          AND tmdb_id = item.tmdb_id
          AND id <> item.id
        LIMIT 1;

        IF FOUND THEN
            RAISE EXCEPTION 'TMDB id % already belongs to catalog media id %', item.tmdb_id, conflicting_id;
        END IF;

        IF media_row.tmdb_id IS NULL THEN
            UPDATE public.media_catalog
            SET tmdb_id = item.tmdb_id
            WHERE id = item.id;
            changed_count := changed_count + 1;
        ELSE
            already_linked_count := already_linked_count + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'New TMDB links: %, pre-existing expected links: %',
        changed_count, already_linked_count;
END $$;

COMMIT;

-- Verification (read-only):
SELECT COUNT(*)::integer AS total_catalog,
       COUNT(tmdb_id)::integer AS linked,
       COUNT(*) FILTER (WHERE tmdb_id IS NULL)::integer AS missing
FROM public.media_catalog
WHERE category IN ('movie', 'series');

SELECT id, title, category, release_year
FROM public.media_catalog
WHERE category IN ('movie', 'series') AND tmdb_id IS NULL
ORDER BY id;
