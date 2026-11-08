-- Research Annotators

CREATE TABLE IF NOT EXISTS public.research_annotators (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL UNIQUE
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    annotator_code VARCHAR(64) NOT NULL UNIQUE,

    status VARCHAR(20) NOT NULL
        DEFAULT 'invited'
        CHECK (
            status IN (
                'invited',
                'active',
                'withdrawn'
            )
        ),

    consent_version VARCHAR(30),

    consented_at TIMESTAMPTZ,

    withdrawn_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_annotator_code
        CHECK (
            annotator_code ~ '^[A-Za-z0-9_-]{3,64}$'
        ),

    CONSTRAINT valid_consent
        CHECK (
            (
                consented_at IS NULL
                AND consent_version IS NULL
            )
            OR
            (
                consented_at IS NOT NULL
                AND consent_version IS NOT NULL
            )
        ),

    CONSTRAINT valid_active_status
        CHECK (
            status <> 'active'
            OR (
                consented_at IS NOT NULL
                AND withdrawn_at IS NULL
            )
        ),

    CONSTRAINT valid_withdrawn_status
        CHECK (
            status <> 'withdrawn'
            OR withdrawn_at IS NOT NULL
        )
);

-- Verification

SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'research_annotators'
ORDER BY ordinal_position;