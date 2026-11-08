-- Research Consent Document Protection

BEGIN;

-- Protection Function

CREATE OR REPLACE FUNCTION
public.protect_research_consent_documents()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    -- Delete Protection

    IF TG_OP = 'DELETE' THEN

        IF OLD.status IN ('approved', 'retired') THEN
            RAISE EXCEPTION
                'Approved or retired research documents cannot be deleted.';
        END IF;

        RETURN OLD;
    END IF;

    -- Update Protection

    IF TG_OP = 'UPDATE' THEN

        -- Retired Documents

        IF OLD.status = 'retired' THEN
            RAISE EXCEPTION
                'Retired research documents cannot be modified.';
        END IF;

        -- Approved Documents

        IF OLD.status = 'approved' THEN

            -- Allow Retirement Without Changing Other Fields

            IF NEW.status = 'retired'
               AND (
                   to_jsonb(NEW) - 'status'
               ) = (
                   to_jsonb(OLD) - 'status'
               )
            THEN
                RETURN NEW;
            END IF;

            RAISE EXCEPTION
                'Approved research documents cannot be modified.';
        END IF;

        -- Draft Documents

        IF OLD.status = 'draft'
           AND NEW.status = 'retired'
        THEN
            RAISE EXCEPTION
                'Draft documents cannot be retired before approval.';
        END IF;

        RETURN NEW;

    END IF;

    RETURN NULL;
END;
$$;

-- Protection Trigger

DROP TRIGGER IF EXISTS
trg_protect_research_consent_documents
ON public.research_consent_documents;

CREATE TRIGGER
trg_protect_research_consent_documents

BEFORE UPDATE OR DELETE
ON public.research_consent_documents

FOR EACH ROW

EXECUTE FUNCTION
public.protect_research_consent_documents();

COMMIT;