// Compass Real Catalog Comparison

require("dotenv").config();

const pool = require("../db");
const { loadCompassCatalog } = require("../services/compassCatalog");
const {
  recommendMedia,
  recommendMediaBaseline,
} = require("../services/compassEngine");

const TEST_USER_ID = 1;

const SCENARIOS = [
  {
    label: "Happy to Joy",
    currentMood: "happy",
    desiredEmotion: "joy",
    availableTime: "180plus",
    contentType: "either",
  },
  {
    label: "Sad to Comfort",
    currentMood: "sad",
    desiredEmotion: "comfort",
    availableTime: "180plus",
    contentType: "either",
  },
  {
    label: "Excited to Thrill",
    currentMood: "excited",
    desiredEmotion: "thrill",
    availableTime: "180plus",
    contentType: "either",
  },
];

async function loadPreferredGenres(userId) {
  const result = await pool.query(
    `
      SELECT genre.name
      FROM public.compass_preferred_genres AS preferred
      JOIN public.genres AS genre ON genre.id = preferred.genre_id
      WHERE preferred.user_id = $1
      ORDER BY genre.name
    `,
    [userId],
  );

  return result.rows.map((row) => row.name);
}

async function loadPersonalFeedback(userId) {
  const result = await pool.query(
    `
      SELECT
        feedback.emotional_fit_rating,
        request.current_mood,
        request.desired_emotion,
        COALESCE(
          (
            SELECT ARRAY_AGG(genre.name::text ORDER BY genre.name)
            FROM public.media_genres AS media_genre
            JOIN public.genres AS genre ON genre.id = media_genre.genre_id
            WHERE media_genre.media_id = recommendation.media_id
          ),
          ARRAY[]::text[]
        ) AS genres
      FROM public.compass_feedback AS feedback
      JOIN public.compass_recommendations AS recommendation
        ON recommendation.id = feedback.recommendation_id
      JOIN public.compass_requests AS request
        ON request.id = recommendation.request_id
      WHERE request.user_id = $1
      ORDER BY feedback.updated_at DESC, feedback.id DESC
      LIMIT 100
    `,
    [userId],
  );

  return result.rows;
}

function compareTopThree(baseline, adaptive) {
  const baselineTitles = baseline.map((item) => item.title);
  const adaptiveTitles = adaptive.map((item) => item.title);
  const baselineSet = new Set(baselineTitles);
  const adaptiveSet = new Set(adaptiveTitles);

  return {
    overlap: adaptiveTitles.filter((title) => baselineSet.has(title)).length,
    introduced: adaptiveTitles.filter((title) => !baselineSet.has(title)),
    displaced: baselineTitles.filter((title) => !adaptiveSet.has(title)),
    order_changed:
      JSON.stringify(baselineTitles) !== JSON.stringify(adaptiveTitles),
  };
}

async function main() {
  console.log(
    "DEMONSTRATION: real catalog, TEST feedback, no independent validation.",
  );
  console.log(
    "Read-only comparison: no records are inserted, updated, or deleted.",
  );

  const [catalog, preferredGenres, historicalFeedback] = await Promise.all([
    loadCompassCatalog(),
    loadPreferredGenres(TEST_USER_ID),
    loadPersonalFeedback(TEST_USER_ID),
  ]);

  console.log(`Catalog titles: ${catalog.length}`);
  console.log(`Feedback records for test user: ${historicalFeedback.length}`);
  console.log(`Preferred genres: ${preferredGenres.join(", ") || "none"}`);

  for (const scenario of SCENARIOS) {
    const options = { catalog, preferredGenres, ...scenario };
    const baseline = recommendMediaBaseline(options);
    const adaptive = recommendMedia({ ...options, historicalFeedback });
    const comparison = compareTopThree(baseline, adaptive);

    console.log(`\nScenario: ${scenario.label}`);
    console.log("v1.2 baseline (same catalog and preferences):");
    console.table(
      baseline.map((item) => ({
        position: item.position,
        title: item.title,
        score: item.score,
      })),
    );

    console.log("v1.3 adaptive (same catalog and preferences):");
    console.table(
      adaptive.map((item) => ({
        position: item.position,
        title: item.title,
        base_score: item.base_score,
        adjustment: item.personalization_adjustment,
        score: item.score,
        feedback_count: item.feedback_evidence_count,
      })),
    );

    console.log("Top-3 comparison:", comparison);
  }

  console.log("\nThis shows ranking changes, not recommendation accuracy.");
}

main()
  .catch((error) => {
    console.error("Comparison failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
