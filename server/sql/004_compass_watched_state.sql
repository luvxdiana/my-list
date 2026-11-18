CREATE TABLE IF NOT EXISTS public.compass_watched_media (
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('movie', 'series')),
    tmdb_id INTEGER NOT NULL CHECK (tmdb_id > 0),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, category, tmdb_id)
);

-- A cancelled rating stays in history for audit but no longer trains v1.3.
ALTER TABLE public.compass_feedback
    ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;

-- Backfill existing confirmed library records linked to Compass recommendations.
-- This supports users who confirmed a work before the new ledger existed.
INSERT INTO public.compass_watched_media (user_id, category, tmdb_id)
SELECT DISTINCT e.user_id, e.category, e.tmdb_id
FROM public.entries AS e
WHERE e.status = 'completed'
  AND e.category IN ('movie', 'series')
  AND e.tmdb_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.compass_feedback AS f
    JOIN public.compass_recommendations AS r ON r.id = f.recommendation_id
    JOIN public.compass_requests AS q ON q.id = r.request_id
    JOIN public.media_catalog AS m ON m.id = r.media_id
    WHERE q.user_id = e.user_id AND m.tmdb_id = e.tmdb_id
      AND m.category = e.category AND f.voided_at IS NULL
  )
ON CONFLICT (user_id, category, tmdb_id) DO NOTHING;
