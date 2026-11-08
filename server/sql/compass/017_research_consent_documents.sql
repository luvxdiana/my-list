-- Research Consent Documents

BEGIN;

CREATE TABLE IF NOT EXISTS public.research_consent_documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    version_code VARCHAR(100) NOT NULL,

    consent_kind VARCHAR(20) NOT NULL,

    title VARCHAR(255) NOT NULL,

    document_text TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    approved_at TIMESTAMPTZ,

    CONSTRAINT research_consent_documents_version_unique
        UNIQUE (consent_kind, version_code),

    CONSTRAINT research_consent_documents_kind_check
        CHECK (
            consent_kind IN ('preview', 'research')
        ),

    CONSTRAINT research_consent_documents_status_check
        CHECK (
            status IN ('draft', 'approved', 'retired')
        ),

    CONSTRAINT research_consent_documents_title_check
        CHECK (
            LENGTH(TRIM(title)) > 0
        ),

    CONSTRAINT research_consent_documents_text_check
        CHECK (
            LENGTH(TRIM(document_text)) > 0
        ),

    CONSTRAINT research_consent_documents_approval_check
        CHECK (
            (status = 'draft' AND approved_at IS NULL)
            OR
            (
                status IN ('approved', 'retired')
                AND approved_at IS NOT NULL
            )
        )
);

COMMIT;