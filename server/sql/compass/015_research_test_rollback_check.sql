-- Research Transaction Rollback Test

DO $$
DECLARE
    v_annotator_id BIGINT;
    v_media_id BIGINT;
    v_emotion_id BIGINT;
    v_batch_id BIGINT;
BEGIN

    -- Test Annotator

    SELECT id
    INTO v_annotator_id
    FROM public.research_annotators
    WHERE annotator_code = 'TEST002'
      AND status = 'invited';

    IF v_annotator_id IS NULL THEN
        RAISE EXCEPTION 'Test annotator not found.';
    END IF;

    -- Available Media

    SELECT m.id
    INTO v_media_id
    FROM public.media_catalog AS m
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.research_test_annotation_batches AS b
        WHERE b.annotator_id = v_annotator_id
          AND b.media_id = m.id
    )
    ORDER BY m.id
    LIMIT 1;

    IF v_media_id IS NULL THEN
        RAISE EXCEPTION 'No available test media.';
    END IF;

    -- Emotion

    SELECT id
    INTO v_emotion_id
    FROM public.emotions
    WHERE code = 'joy';

    IF v_emotion_id IS NULL THEN
        RAISE EXCEPTION 'Joy emotion not found.';
    END IF;

    -- Transaction Simulation

    BEGIN

        INSERT INTO public.research_test_annotation_batches (
            annotator_id,
            media_id,
            evidence_source,
            annotation_note,
            is_test_data
        )
        VALUES (
            v_annotator_id,
            v_media_id,
            'watched',
            'ROLLBACK_TEST_ONLY',
            TRUE
        )
        RETURNING id INTO v_batch_id;

        INSERT INTO public.research_test_annotation_ratings (
            batch_id,
            emotion_id,
            intensity,
            confidence
        )
        VALUES (
            v_batch_id,
            v_emotion_id,
            2,
            2
        );

        -- Simulated Failure

        RAISE EXCEPTION 'SIMULATED_FAILURE';

    EXCEPTION
        WHEN raise_exception THEN
            IF SQLERRM <> 'SIMULATED_FAILURE' THEN
                RAISE;
            END IF;
    END;

    -- Verification

    IF EXISTS (
        SELECT 1
        FROM public.research_test_annotation_batches
        WHERE annotator_id = v_annotator_id
          AND media_id = v_media_id
          AND annotation_note = 'ROLLBACK_TEST_ONLY'
    ) THEN
        RAISE EXCEPTION 'Rollback verification failed.';
    END IF;

    RAISE NOTICE 'PASS: Transaction changes rolled back.';

END $$;

-- Final Check

SELECT
    COUNT(*) AS remaining_test_batches
FROM public.research_test_annotation_batches
WHERE annotation_note = 'ROLLBACK_TEST_ONLY';