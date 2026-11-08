-- Research Preview Acknowledgement

BEGIN;

-- Event Types

ALTER TABLE public.research_consent_events
DROP CONSTRAINT IF EXISTS research_consent_event_type_check;

ALTER TABLE public.research_consent_events
ADD CONSTRAINT research_consent_event_type_check
CHECK (
    event_type IN (
        'granted',
        'reconfirmed',
        'withdrawn',
        'acknowledged'
    )
);

-- Preview Acknowledgement Validation

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'research_preview_acknowledgement_check'
          AND conrelid =
              'public.research_consent_events'::regclass
    ) THEN

        ALTER TABLE public.research_consent_events
        ADD CONSTRAINT research_preview_acknowledgement_check
        CHECK (
            event_type <> 'acknowledged'
            OR (
                consent_kind = 'preview'
                AND is_test_event = TRUE
            )
        );

    END IF;
END
$$;

-- Prevent Duplicate Preview Acknowledgements

CREATE UNIQUE INDEX IF NOT EXISTS
uq_research_preview_acknowledged_version

ON public.research_consent_events (
    annotator_id,
    consent_kind,
    consent_version
)

WHERE event_type = 'acknowledged';

COMMIT;