// Compass Dataset Export

const fs = require("node:fs/promises");
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const pool = require("../db");
const { loadCompassCatalog } = require("../services/compassCatalog");

const EMOTIONS = ["joy", "comfort", "calm", "inspiration", "thrill", "energy"];

const exportDirectory = path.resolve(__dirname, "../exports/compass");

function csvCell(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replaceAll('"', '""')}"`;
}

function csvRow(values) {
  return values.map(csvCell).join(",");
}

function validateCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error("The media catalog is empty.");
  }

  const ids = new Set();

  for (const media of catalog) {
    if (ids.has(media.id)) {
      throw new Error(`Duplicate media ID: ${media.id}`);
    }

    ids.add(media.id);

    if (
      !media.title ||
      !["movie", "series"].includes(media.category) ||
      !Number.isFinite(Number(media.duration_minutes)) ||
      Number(media.duration_minutes) <= 0 ||
      !Array.isArray(media.genres) ||
      !Array.isArray(media.emotions)
    ) {
      throw new Error(`Invalid catalog record: ${media.id}`);
    }

    if (media.emotions.some((emotion) => !EMOTIONS.includes(emotion))) {
      throw new Error(`Unknown emotion code for media ${media.id}`);
    }
  }
}

function createCatalogCsv(catalog) {
  const rows = [
    csvRow([
      "media_id",
      "title",
      "category",
      "release_year",
      "duration_minutes",
      "genres",
      "preliminary_emotion_tags",
      "emotion_annotation_status",
    ]),
  ];

  for (const media of catalog) {
    rows.push(
      csvRow([
        media.id,
        media.title,
        media.category,
        media.release_year,
        media.duration_minutes,
        media.genres.join(" | "),
        media.emotions.join(" | "),
        media.emotions.length > 0 ? "preliminary_technical" : "unannotated",
      ]),
    );
  }

  return `${rows.join("\r\n")}\r\n`;
}

function createSummary(catalog) {
  const withTags = catalog.filter((media) => media.emotions.length > 0);

  const allGenres = [...new Set(catalog.flatMap((media) => media.genres))].sort(
    (a, b) => a.localeCompare(b),
  );

  return {
    generated_at: new Date().toISOString(),

    dataset_type: "prototype_media_catalog",

    source_tables: [
      "public.media_catalog",
      "public.media_genres",
      "public.genres",
      "public.media_emotions",
      "public.emotions",
    ],

    independent_emotional_annotations_included: false,
    user_feedback_included: false,

    total_media: catalog.length,

    categories: {
      movie: catalog.filter((media) => media.category === "movie").length,
      series: catalog.filter((media) => media.category === "series").length,
    },

    media_with_preliminary_emotion_tags: withTags.length,

    media_without_emotion_tags: catalog.length - withTags.length,

    preliminary_emotion_tag_total: catalog.reduce(
      (sum, media) => sum + media.emotions.length,
      0,
    ),

    preliminary_emotion_coverage_percent: Number(
      ((withTags.length / catalog.length) * 100).toFixed(2),
    ),

    missing_release_year_count: catalog.filter(
      (media) => media.release_year === null,
    ).length,

    media_without_genres: catalog.filter((media) => media.genres.length === 0)
      .length,

    genre_distribution: Object.fromEntries(
      allGenres.map((genre) => [
        genre,
        catalog.filter((media) => media.genres.includes(genre)).length,
      ]),
    ),

    preliminary_emotion_distribution: Object.fromEntries(
      EMOTIONS.map((emotion) => [
        emotion,
        catalog.filter((media) => media.emotions.includes(emotion)).length,
      ]),
    ),
  };
}

function createReadme(summary) {
  return `# MyList Compass — Media Dataset Snapshot

Generated: ${summary.generated_at}

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

- Media: ${summary.total_media}
- Media with preliminary emotion tags: ${summary.media_with_preliminary_emotion_tags}
- Media without emotion tags: ${summary.media_without_emotion_tags}
- Total preliminary tags: ${summary.preliminary_emotion_tag_total}
- Coverage: ${summary.preliminary_emotion_coverage_percent}%

Genres and tags in the CSV use the vertical bar character as a list separator.
`;
}

async function main() {
  try {
    const catalog = await loadCompassCatalog();

    validateCatalog(catalog);

    const summary = createSummary(catalog);

    await fs.mkdir(exportDirectory, { recursive: true });

    await Promise.all([
      fs.writeFile(
        path.join(exportDirectory, "compass_media_catalog.csv"),
        "\uFEFF" + createCatalogCsv(catalog),
        "utf8",
      ),

      fs.writeFile(
        path.join(exportDirectory, "compass_dataset_summary.json"),
        JSON.stringify(summary, null, 2) + "\n",
        "utf8",
      ),

      fs.writeFile(
        path.join(exportDirectory, "README.md"),
        createReadme(summary),
        "utf8",
      ),
    ]);

    console.log("Compass dataset exported successfully.");

    console.log(`Output: ${exportDirectory}`);

    console.table({
      total_media: summary.total_media,
      movies: summary.categories.movie,
      series: summary.categories.series,
      with_preliminary_tags: summary.media_with_preliminary_emotion_tags,
      without_tags: summary.media_without_emotion_tags,
      total_tags: summary.preliminary_emotion_tag_total,
      coverage_percent: summary.preliminary_emotion_coverage_percent,
    });
  } catch (error) {
    console.error("Compass dataset export failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
