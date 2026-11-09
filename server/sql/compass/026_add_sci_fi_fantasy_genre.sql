-- Add Sci-Fi & Fantasy Genre

BEGIN;

INSERT INTO public.genres (name)
VALUES ('Sci-Fi & Fantasy')
ON CONFLICT (name) DO NOTHING;

COMMIT;