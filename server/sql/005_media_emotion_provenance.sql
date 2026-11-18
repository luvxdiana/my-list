BEGIN;

ALTER TABLE public.media_emotions
  ADD COLUMN IF NOT EXISTS annotation_source VARCHAR(50) NOT NULL DEFAULT 'initial_dataset';

ALTER TABLE public.media_emotions
  ADD COLUMN IF NOT EXISTS annotation_status VARCHAR(20) NOT NULL DEFAULT 'provisional';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'media_emotions_annotation_status_check'
      AND conrelid = 'public.media_emotions'::regclass
  ) THEN
    ALTER TABLE public.media_emotions
      ADD CONSTRAINT media_emotions_annotation_status_check
      CHECK (annotation_status IN ('provisional', 'reviewed'));
  END IF;
END $$;

COMMIT;
