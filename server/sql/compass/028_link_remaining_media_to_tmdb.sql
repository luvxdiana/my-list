-- Link Remaining Media to TMDB

BEGIN;

DO $$
DECLARE
    item RECORD;
    current_media public.media_catalog%ROWTYPE;
    conflicting_id BIGINT;
    linked_count INTEGER := 0;
BEGIN

    FOR item IN
        SELECT *
        FROM (
            VALUES
                (1, 'The Matrix', 'movie', 1999, 603),
                (4, 'Coco', 'movie', 2017, 354912),
                (5, 'Friends', 'series', 1994, 1668),
                (6, 'A Quiet Place', 'movie', 2018, 447332),
                (7, 'The Lion King', 'movie', 1994, 8587),
                (8, 'Shrek', 'movie', 2001, 808),
                (9, 'Inception', 'movie', 2010, 27205),
                (10, 'Titanic', 'movie', 1997, 597),
                (11, 'Inside Out', 'movie', 2015, 150540),
                (12, 'Home Alone', 'movie', 1990, 771),
                (13, 'The Conjuring', 'movie', 2013, 138843),
                (14, 'The Good Place', 'series', 2016, 66573),
                (15, 'Toy Story', 'movie', 1995, 862)
        ) AS expected(
            id,
            title,
            category,
            release_year,
            tmdb_id
        )
    LOOP

        -- Validate Existing Media

        SELECT *
        INTO current_media
        FROM public.media_catalog
        WHERE id = item.id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Media ID % does not exist',
                item.id;
        END IF;

        IF current_media.title IS DISTINCT FROM item.title
            OR current_media.category::text
                IS DISTINCT FROM item.category
            OR current_media.release_year
                IS DISTINCT FROM item.release_year
        THEN
            RAISE EXCEPTION
                'Media ID % requires manual review',
                item.id;
        END IF;

        -- Validate Existing TMDB Link

        IF current_media.tmdb_id IS NOT NULL
            AND current_media.tmdb_id <> item.tmdb_id
        THEN
            RAISE EXCEPTION
                'Media ID % has a conflicting TMDB ID',
                item.id;
        END IF;

        -- Check TMDB Conflicts

        SELECT id
        INTO conflicting_id
        FROM public.media_catalog
        WHERE tmdb_id = item.tmdb_id
          AND id <> item.id
        LIMIT 1;

        IF FOUND THEN
            RAISE EXCEPTION
                'TMDB ID % is already linked to media ID %',
                item.tmdb_id,
                conflicting_id;
        END IF;

        -- Link Media

        IF current_media.tmdb_id IS NULL THEN

            UPDATE public.media_catalog
            SET tmdb_id = item.tmdb_id
            WHERE id = item.id;

            linked_count := linked_count + 1;

        END IF;

    END LOOP;

    RAISE NOTICE
        'New TMDB links created: %',
        linked_count;

END $$;

COMMIT;