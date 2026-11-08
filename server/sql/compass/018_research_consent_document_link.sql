-- Research Consent Document Link

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'research_consent_events_document_fkey'
          AND conrelid = 'public.research_consent_events'::regclass
    ) THEN

        ALTER TABLE public.research_consent_events

        ADD CONSTRAINT research_consent_events_document_fkey

        FOREIGN KEY (
            consent_kind,
            consent_version
        )

        REFERENCES public.research_consent_documents (
            consent_kind,
            version_code
        )

        ON UPDATE RESTRICT
        ON DELETE RESTRICT;

    END IF;
END
$$;

COMMIT;