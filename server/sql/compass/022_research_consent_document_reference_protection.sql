-- Research Consent Document Reference Protection

BEGIN;

-- Protection Function

CREATE OR REPLACE FUNCTION
public.protect_referenced_research_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- Referenced Draft Protection

    IF OLD.status = 'draft' THEN

        IF EXISTS (
            SELECT 1
            FROM public.research_consent_events
            WHERE consent_kind = OLD.consent_kind
              AND consent_version = OLD.version_code
        ) THEN

            RAISE EXCEPTION
                'Referenced draft research documents cannot be modified or deleted.';

        END IF;

    END IF;

    -- Delete

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    -- Update

    RETURN NEW;

END;
$$;

-- Protection Trigger

DROP TRIGGER IF EXISTS
trg_protect_referenced_research_documents
ON public.research_consent_documents;

CREATE TRIGGER
trg_protect_referenced_research_documents

BEFORE UPDATE OR DELETE
ON public.research_consent_documents

FOR EACH ROW

EXECUTE FUNCTION
public.protect_referenced_research_documents();

COMMIT;