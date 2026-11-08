-- Prevent Duplicate Test Annotations

CREATE UNIQUE INDEX IF NOT EXISTS
    uq_research_test_batches_annotator_media

ON public.research_test_annotation_batches (
    annotator_id,
    media_id
);

-- Verification

SELECT
    indexname,
    indexdef

FROM pg_indexes

WHERE schemaname = 'public'
    AND tablename = 'research_test_annotation_batches'
    AND indexname =
        'uq_research_test_batches_annotator_media';