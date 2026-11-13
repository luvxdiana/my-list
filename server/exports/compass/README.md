# MyList Compass — Media Dataset Snapshot

Generated: 2026-11-11T09:12:57.619Z

## Contents

- compass_media_catalog.csv — one record per movie or series.
- compass_dataset_summary.json — data counts and quality indicators.

## Data provenance

The dataset is exported from the project PostgreSQL media catalog and its
linked genre and technical emotion tables. It contains no user accounts,
ratings, or personal feedback. External metadata provenance is not verified
on a per-record basis by this export.

## Important limitations

- Emotion tags are PRELIMINARY TECHNICAL LABELS, not independent ratings.
- An empty emotion field means NOT ANNOTATED, not zero emotional effect.
- A missing emotion from a nonempty list is not a verified negative label.
- These records are not sufficient to claim accuracy of emotion predictions.
- Separate consented participant annotation and feedback datasets are needed
  before evaluating personalized emotional recommendation quality.

## Snapshot counts

- Media: 50
- Media with preliminary emotion tags: 16
- Media without emotion tags: 34
- Total preliminary tags: 35
- Coverage: 32%

Genres and tags in the CSV use the vertical bar character as a list separator.
