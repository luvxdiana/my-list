-- Correct Brooklyn Nine-Nine Duration

BEGIN;

UPDATE public.media_catalog
SET duration_minutes = 22
WHERE tmdb_id = 48891
  AND title = 'Brooklyn Nine-Nine'
  AND category = 'series'
  AND duration_minutes = 46;

COMMIT;