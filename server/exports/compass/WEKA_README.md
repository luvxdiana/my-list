# MyList Compass - WEKA Dataset

## Purpose

Exploratory analysis of movie and series metadata.

## Source

PostgreSQL development database, loaded through
loadCompassCatalog().

## Instances

50 media records.

## Features

- Content category: nominal.
- Release year: numeric.
- Duration in minutes: numeric.
- Genre indicators: nominal binary values.

Number of genre attributes: 16.

Total attributes: 19.

## Excluded fields

- Media ID and title are excluded from model input.
- Preliminary emotional tags are excluded.
- User IDs, preferences and feedback are excluded.

A separate CSV maps original record order to media IDs and titles.

## Important limitations

The dataset is suitable for exploratory metadata clustering.

Clusters must not be interpreted as emotional categories.
There are no independently validated emotional labels here.

The dataset cannot establish classification accuracy,
personalized recommendation quality or user satisfaction.

Movies use total runtime while series use episode runtime.
This difference must be considered when interpreting clusters.

Any clustering experiment must report its algorithm,
parameters, preprocessing and observed results.
