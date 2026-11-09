-- Link Existing Series to TMDB

BEGIN;

DO $$
BEGIN

    -- Validate Dark
    IF NOT EXISTS (
        SELECT 1
        FROM public.media_catalog
        WHERE id = 2
          AND title = 'Dark'
          AND category = 'series'
          AND release_year = 2017
          AND (tmdb_id IS NULL OR tmdb_id = 70523)
    ) THEN
        RAISE EXCEPTION 'Dark catalog record requires manual review';
    END IF;

    -- Validate The Bear
    IF NOT EXISTS (
        SELECT 1
        FROM public.media_catalog
        WHERE id = 3
          AND title = 'The Bear'
          AND category = 'series'
          AND release_year = 2022
          AND (tmdb_id IS NULL OR tmdb_id = 136315)
    ) THEN
        RAISE EXCEPTION 'The Bear catalog record requires manual review';
    END IF;

    -- Check TMDB conflicts
    IF EXISTS (
        SELECT 1
        FROM public.media_catalog
        WHERE (tmdb_id = 70523 AND id <> 2)
           OR (tmdb_id = 136315 AND id <> 3)
    ) THEN
        RAISE EXCEPTION 'TMDB ID already assigned to another record';
    END IF;

    -- Link Dark
    UPDATE public.media_catalog
    SET tmdb_id = 70523
    WHERE id = 2;

    -- Link The Bear
    UPDATE public.media_catalog
    SET tmdb_id = 136315
    WHERE id = 3;

END $$;

COMMIT;