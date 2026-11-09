-- Catalog Administrator Role

BEGIN;

-- Add Administrator Flag

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin
BOOLEAN NOT NULL DEFAULT FALSE;

-- Document Column

COMMENT ON COLUMN public.users.is_admin
IS 'Allows administrative management of the shared MyList catalog.';

COMMIT;