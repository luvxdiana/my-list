// Compass WEKA Dataset Preparation

const fs = require("node:fs/promises");
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const pool = require("../db");
const { loadCompassCatalog } = require("../services/compassCatalog");

// Export Configuration

const outputDirectory = path.resolve(__dirname, "../exports/compass");

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function csvRow(values) {
  return values.map(csvCell).join(",");
}

function genreAttributeName(genre) {
  return (
    "genre_" +
    genre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  );
}

// Prepare Features

function prepareFeatures(catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error("The media catalog is empty.");
  }

  const genres = [...new Set(catalog.flatMap((media) => media.genres))].sort(
    (a, b) => a.localeCompare(b),
  );

  const attributes = genres.map((genre) => ({
    genre,
    name: genreAttributeName(genre),
  }));

  const attributeNames = attributes.map((item) => item.name);

  if (new Set(attributeNames).size !== attributes.length) {
    throw new Error("Duplicate genre attribute names.");
  }

  return { genres, attributes };
}

// ARFF Dataset

function createArff(catalog, attributes) {
  const lines = [
    "% MyList Compass - Media Metadata",
    "% Source: PostgreSQL development catalog",
    "% No participant feedback or validated emotional labels",
    "% Intended for exploratory unsupervised analysis",
    "",
    "@RELATION mylist_compass_media_metadata",
    "",
    "@ATTRIBUTE category {movie,series}",
    "@ATTRIBUTE release_year NUMERIC",
    "@ATTRIBUTE duration_minutes NUMERIC",
  ];

  for (const attribute of attributes) {
    lines.push(`@ATTRIBUTE ${attribute.name} {0,1}`);
  }

  lines.push("", "@DATA");

  for (const media of catalog) {
    if (!["movie", "series"].includes(media.category)) {
      throw new Error(`Invalid category for media ${media.id}`);
    }

    const duration = Number(media.duration_minutes);

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`Invalid duration for media ${media.id}`);
    }

    const year =
      media.release_year === null || media.release_year === undefined
        ? "?"
        : Number(media.release_year);

    if (year !== "?" && !Number.isFinite(year)) {
      throw new Error(`Invalid release year for media ${media.id}`);
    }

    const mediaGenres = new Set(media.genres);

    const values = [
      media.category,
      year,
      duration,
      ...attributes.map((attribute) =>
        mediaGenres.has(attribute.genre) ? 1 : 0,
      ),
    ];

    lines.push(values.join(","));
  }

  return `${lines.join("\n")}\n`;
}

// Record Mapping

function createMediaMap(catalog) {
  const lines = [csvRow(["instance_number", "media_id", "title", "category"])];

  catalog.forEach((media, index) => {
    lines.push(csvRow([index + 1, media.id, media.title, media.category]));
  });

  return `${lines.join("\r\n")}\r\n`;
}

// Methodology Notes

function createNotes(mediaCount, attributes) {
  return `# MyList Compass - WEKA Dataset

## Purpose

Exploratory analysis of movie and series metadata.

## Source

PostgreSQL development database, loaded through
loadCompassCatalog().

## Instances

${mediaCount} media records.

## Features

- Content category: nominal.
- Release year: numeric.
- Duration in minutes: numeric.
- Genre indicators: nominal binary values.

Number of genre attributes: ${attributes.length}.

Total attributes: ${attributes.length + 3}.

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
`;
}

// Main

async function main() {
  try {
    const catalog = await loadCompassCatalog();

    const { attributes } = prepareFeatures(catalog);

    const arff = createArff(catalog, attributes);
    const mediaMap = createMediaMap(catalog);
    const notes = createNotes(catalog.length, attributes);

    await fs.mkdir(outputDirectory, {
      recursive: true,
    });

    await Promise.all([
      fs.writeFile(
        path.join(outputDirectory, "compass_weka_features.arff"),
        arff,
        "utf8",
      ),

      fs.writeFile(
        path.join(outputDirectory, "compass_weka_media_map.csv"),
        "\uFEFF" + mediaMap,
        "utf8",
      ),

      fs.writeFile(path.join(outputDirectory, "WEKA_README.md"), notes, "utf8"),
    ]);

    console.log("\nWEKA dataset prepared successfully.");

    console.table({
      instances: catalog.length,
      genre_attributes: attributes.length,
      total_attributes: attributes.length + 3,
      validated_emotional_labels: 0,
    });

    console.log(`\nOutput: ${outputDirectory}`);
  } catch (error) {
    console.error("WEKA preparation failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
