-- Research Test Annotation Batches

CREATE TABLE IF NOT EXISTS public.research_test_annotation_batches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    annotator_id BIGINT NOT NULL
        REFERENCES public.research_annotators(id)
        ON DELETE CASCADE,

    media_id BIGINT NOT NULL
        REFERENCES public.media_catalog(id)
        ON DELETE RESTRICT,

    evidence_source VARCHAR(30) NOT NULL
        CHECK (
            evidence_source IN (
                'watched',
                'synopsis',
                'trailer'
            )
        ),

    annotation_note TEXT
        CHECK (CHAR_LENGTH(annotation_note) <= 2000),

    is_test_data BOOLEAN NOT NULL DEFAULT TRUE
        CHECK (is_test_data = TRUE),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research Test Annotation Ratings

CREATE TABLE IF NOT EXISTS public.research_test_annotation_ratings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    batch_id BIGINT NOT NULL
        REFERENCES public.research_test_annotation_batches(id)
        ON DELETE CASCADE,

    emotion_id BIGINT NOT NULL
        REFERENCES public.emotions(id)
        ON DELETE RESTRICT,

    intensity SMALLINT NOT NULL
        CHECK (intensity BETWEEN 0 AND 3),

    confidence SMALLINT NOT NULL
        CHECK (confidence BETWEEN 1 AND 3),

    CONSTRAINT unique_test_batch_emotion
        UNIQUE (batch_id, emotion_id)
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_test_batches_annotator
ON public.research_test_annotation_batches (annotator_id);

CREATE INDEX IF NOT EXISTS idx_test_batches_media
ON public.research_test_annotation_batches (media_id);

CREATE INDEX IF NOT EXISTS idx_test_ratings_batch
ON public.research_test_annotation_ratings (batch_id);

-- Verification

SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'research_test_annotation_batches',
      'research_test_annotation_ratings'
  )
ORDER BY table_name;