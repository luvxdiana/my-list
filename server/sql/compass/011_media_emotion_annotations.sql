-- Media Emotion Annotations

CREATE TABLE IF NOT EXISTS public.media_emotion_annotations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    media_id BIGINT NOT NULL
        REFERENCES public.media_catalog(id)
        ON DELETE CASCADE,

    emotion_id BIGINT NOT NULL
        REFERENCES public.emotions(id)
        ON DELETE RESTRICT,

    annotator_code VARCHAR(64) NOT NULL,

    intensity SMALLINT NOT NULL
        CHECK (intensity BETWEEN 0 AND 3),

    confidence SMALLINT NOT NULL
        CHECK (confidence BETWEEN 1 AND 3),

    evidence_source VARCHAR(30) NOT NULL
        CHECK (
            evidence_source IN (
                'watched',
                'synopsis',
                'trailer',
                'audience_feedback'
            )
        ),

    evidence_reference TEXT,

    annotation_status VARCHAR(20) NOT NULL
        DEFAULT 'preliminary'
        CHECK (
            annotation_status IN (
                'preliminary',
                'reviewed',
                'validated'
            )
        ),

    annotation_note TEXT
        CHECK (CHAR_LENGTH(annotation_note) <= 2000),

    annotation_round INTEGER NOT NULL
        DEFAULT 1
        CHECK (annotation_round >= 1),

    protocol_version VARCHAR(20) NOT NULL
        DEFAULT 'v1.0',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_media_emotion_annotation
        UNIQUE (
            media_id,
            emotion_id,
            annotator_code,
            annotation_round
        )
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_annotations_media
ON public.media_emotion_annotations (media_id);

CREATE INDEX IF NOT EXISTS idx_annotations_emotion
ON public.media_emotion_annotations (emotion_id);

-- Verification

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'media_emotion_annotations'
ORDER BY ordinal_position;