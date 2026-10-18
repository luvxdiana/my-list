
BEGIN;

-- Update status options

ALTER TABLE entries
DROP CONSTRAINT IF EXISTS entries_status_check;

UPDATE entries
SET status = CASE
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'dropped' THEN 'dropped'
    ELSE 'incomplete'
END;

ALTER TABLE entries
ALTER COLUMN status SET DEFAULT 'incomplete';

ALTER TABLE entries
ADD CONSTRAINT entries_status_check
CHECK (status IN (
    'completed',
    'incomplete',
    'dropped'
));

-- Allow half-star ratings

ALTER TABLE entries
DROP CONSTRAINT IF EXISTS entries_rating_check;

ALTER TABLE entries
ALTER COLUMN rating TYPE NUMERIC(2,1)
USING rating::NUMERIC(2,1);

ALTER TABLE entries
ADD CONSTRAINT entries_rating_check
CHECK (
    rating BETWEEN 0.5 AND 5.0
    AND rating * 2 = TRUNC(rating * 2)
);

-- Add movie duration

ALTER TABLE entries
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER
CHECK (duration_minutes >= 0);

-- Add game playtime

ALTER TABLE entries
ADD COLUMN IF NOT EXISTS playtime_hours NUMERIC(8,1)
CHECK (playtime_hours >= 0);

COMMIT;
