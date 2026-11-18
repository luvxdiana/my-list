
BEGIN;

ALTER TABLE public.entries
ADD COLUMN IF NOT EXISTS tmdb_id INTEGER;

ALTER TABLE public.entries
DROP CONSTRAINT IF EXISTS entries_tmdb_id_positive;

ALTER TABLE public.entries
ADD CONSTRAINT entries_tmdb_id_positive
CHECK (tmdb_id IS NULL OR tmdb_id > 0);

CREATE UNIQUE INDEX IF NOT EXISTS
idx_entries_user_tmdb_unique
ON public.entries (user_id, category, tmdb_id)
WHERE tmdb_id IS NOT NULL
  AND category IN ('movie', 'series');

COMMIT;
