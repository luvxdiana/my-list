-- Add Music Genre

BEGIN;

INSERT INTO public.genres (name)
VALUES ('Music')
ON CONFLICT (name) DO NOTHING;

COMMIT;