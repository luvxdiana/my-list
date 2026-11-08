-- Research Consent Events

BEGIN;

CREATE TABLE IF NOT EXISTS public.research_consent_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    annotator_id BIGINT NOT NULL
        REFERENCES public.research_annotators(id)
        ON DELETE CASCADE,

    event_type VARCHAR(20) NOT NULL,

    consent_kind VARCHAR(20) NOT NULL,

    consent_version VARCHAR(100) NOT NULL,

    is_test_event BOOLEAN NOT NULL DEFAULT TRUE,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT research_consent_event_type_check
        CHECK (
            event_type IN (
                'granted',
                'reconfirmed',
                'withdrawn'
            )
        ),

    CONSTRAINT research_consent_kind_check
        CHECK (
            consent_kind IN (
                'preview',
                'research'
            )
        ),

    CONSTRAINT research_consent_version_check
        CHECK (
            LENGTH(TRIM(consent_version)) > 0
        ),

    CONSTRAINT research_consent_preview_check
        CHECK (
            consent_kind <> 'preview'
            OR is_test_event = TRUE
        ),

    CONSTRAINT research_consent_real_version_check
        CHECK (
            is_test_event = TRUE
            OR consent_version NOT LIKE 'TEST-%'
        )
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_research_consent_events_annotator
ON public.research_consent_events (
    annotator_id,
    recorded_at DESC,
    id DESC
);

COMMIT;