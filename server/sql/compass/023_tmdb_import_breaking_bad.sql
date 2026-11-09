-- TMDB Import: Breaking Bad

BEGIN;

-- Lock Catalog

LOCK TABLE public.media_catalog
IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
    v_media_id BIGINT;
    v_genre_count INTEGER;
    v_link_count INTEGER;
BEGIN

    -- Check Existing Media

    IF EXISTS (
        SELECT 1
        FROM public.media_catalog
        WHERE category = 'series'
          AND (
              tmdb_id = 1396
              OR LOWER(BTRIM(title)) = LOWER('Breaking Bad')
          )
    ) THEN
        RAISE EXCEPTION
            'Breaking Bad already exists in the catalog.';
    END IF;

    -- Check Genres

    SELECT COUNT(*)
    INTO v_genre_count
    FROM public.genres
    WHERE name IN ('Drama', 'Crime');

    IF v_genre_count <> 2 THEN
        RAISE EXCEPTION
            'Expected Drama and Crime genres.';
    END IF;

    -- Allocate Media ID

    SELECT COALESCE(MAX(id), 0) + 1
    INTO v_media_id
    FROM public.media_catalog;

    -- Insert Media

    INSERT INTO public.media_catalog (
        id,
        title,
        category,
        release_year,
        duration_minutes,
        description,
        tmdb_id
    )

    OVERRIDING SYSTEM VALUE

    VALUES (
        v_media_id,
        'Breaking Bad',
        'series',
        2008,
        56,
        'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family''s financial future at any cost as he enters the dangerous world of drugs and crime.',
        1396
    );

    -- Insert Genres

    INSERT INTO public.media_genres (
        media_id,
        genre_id
    )

    SELECT
        v_media_id,
        id
    FROM public.genres
    WHERE name IN ('Drama', 'Crime');

    -- Verify Genre Links

    SELECT COUNT(*)
    INTO v_link_count
    FROM public.media_genres
    WHERE media_id = v_media_id;

    IF v_link_count <> 2 THEN
        RAISE EXCEPTION
            'Expected exactly two genre links.';
    END IF;

    -- Synchronize ID Sequence

    PERFORM setval(
        'public.media_catalog_id_seq'::regclass,
        GREATEST(
            v_media_id,
            (
                SELECT last_value
                FROM public.media_catalog_id_seq
            )
        ),
        true
    );

    RAISE NOTICE
        'Breaking Bad imported with ID %',
        v_media_id;

END;
$$;

COMMIT;