// Compass v1.3 Validation

require("dotenv").config();

const assert = require("node:assert/strict");
const pool = require("../db");
const { loadCompassCatalog } = require("../services/compassCatalog");
const {
  recommendMedia,
  recommendMediaBaseline,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

const TEST_USER_ID = 1;
const SECOND_USER_ID = 2;

const SCENARIOS = [
  { currentMood: "happy", desiredEmotion: "joy" },
  { currentMood: "sad", desiredEmotion: "comfort" },
  { currentMood: "excited", desiredEmotion: "thrill" },
];

// Read-Only Queries

async function getDatabaseCounts() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::integer FROM public.compass_requests) AS requests,
      (SELECT COUNT(*)::integer FROM public.compass_recommendations) AS recommendations,
      (SELECT COUNT(*)::integer FROM public.compass_feedback) AS feedback
  `);

  return result.rows[0];
}

async function getPreferredGenres(userId) {
  const result = await pool.query(
    `
      SELECT genre.name
      FROM public.compass_preferred_genres AS preferred
      JOIN public.genres AS genre ON genre.id = preferred.genre_id
      WHERE preferred.user_id = $1
    `,
    [userId],
  );

  return result.rows.map((row) => row.name);
}

async function getPersonalFeedback(userId) {
  const result = await pool.query(
    `
      SELECT
        feedback.id::text AS feedback_id,
        request.user_id::text AS owner_user_id,
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

// Validation

async function main() {
  console.log("COMPASS v1.3 - READ-ONLY VALIDATION");
  console.log("TEST DATA ONLY; not independent user research.");
  console.log("No inserts, updates, or deletes are performed.\n");

  assert.equal(ALGORITHM_VERSION, "compass-hybrid-v1.3");

  const countsBefore = await getDatabaseCounts();
  const [catalog, preferredGenres, firstUserFeedback, secondUserFeedback] =
    await Promise.all([
      loadCompassCatalog(),
      getPreferredGenres(TEST_USER_ID),
      getPersonalFeedback(TEST_USER_ID),
      getPersonalFeedback(SECOND_USER_ID),
    ]);

  assert(catalog.length > 0, "The catalog must not be empty.");
  console.log(`Catalog: ${catalog.length} media titles`);

  // Cold Start

  for (const scenario of SCENARIOS) {
    const options = {
      catalog,
      preferredGenres,
      availableTime: "180plus",
      contentType: "either",
      ...scenario,
    };

    const baseline = recommendMediaBaseline(options);
    const coldStart = recommendMedia({
      ...options,
      historicalFeedback: [],
    });

    assert.deepEqual(
      coldStart.map(({ title, score }) => ({ title, score })),
      baseline.map(({ title, score }) => ({ title, score })),
      `Cold start mismatch for ${scenario.currentMood} -> ${scenario.desiredEmotion}`,
    );
    assert(coldStart.every((media) => media.personalization_adjustment === 0));

    console.log(
      `PASS cold start: ${scenario.currentMood} -> ${scenario.desiredEmotion}`,
    );
  }

  // Synthetic Positive and Negative Feedback

  const example = catalog.find(
    (media) =>
      Array.isArray(media.emotions) &&
      media.emotions.includes("joy") &&
      Array.isArray(media.genres) &&
      media.genres.length > 0 &&
      Number(media.duration_minutes) > 0,
  );

  assert(example, "Expected a Joy-tagged catalog item with genres.");

  const exampleOptions = {
    catalog: [example],
    currentMood: "happy",
    desiredEmotion: "joy",
    availableTime: "180plus",
    contentType: "either",
    preferredGenres: [],
  };

  const makeFeedback = (rating) => ({
    current_mood: "happy",
    desired_emotion: "joy",
    emotional_fit_rating: rating,
    genres: example.genres,
  });

  const baselineScore = recommendMediaBaseline(exampleOptions)[0].score;
  const positiveScore = recommendMedia({
    ...exampleOptions,
    historicalFeedback: [makeFeedback(5)],
  })[0].score;
  const negativeScore = recommendMedia({
    ...exampleOptions,
    historicalFeedback: [makeFeedback(1)],
  })[0].score;

  assert(positiveScore > baselineScore, "Positive feedback should increase score.");
  assert(negativeScore < baselineScore, "Negative feedback should decrease score.");

  console.log(`PASS synthetic feedback on: ${example.title}`);
  console.log({ baselineScore, positiveScore, negativeScore });

  // User-Scoped Feedback

  for (const row of firstUserFeedback) {
    assert.equal(row.owner_user_id, String(TEST_USER_ID));
  }

  for (const row of secondUserFeedback) {
    assert.equal(row.owner_user_id, String(SECOND_USER_ID));
  }

  const firstUserIds = new Set(firstUserFeedback.map((row) => row.feedback_id));
  assert(
    secondUserFeedback.every((row) => !firstUserIds.has(row.feedback_id)),
    "Feedback records must not appear under two owners.",
  );

  console.log("PASS database query scopes feedback by user_id");
  console.log({
    first_user_feedback: firstUserFeedback.length,
    second_user_feedback: secondUserFeedback.length,
  });
  console.log(
    "NOTE: API authorization under a second login requires a separate browser test.",
  );

  // Read-Only Verification

  const countsAfter = await getDatabaseCounts();
  assert.deepEqual(
    countsAfter,
    countsBefore,
    "Database counts changed during read-only validation.",
  );

  console.log("PASS database counts unchanged");
  console.log("Database counts:", countsAfter);
  console.log("\nALL VALIDATION CHECKS PASSED");
  console.log("These checks demonstrate technical behavior, not accuracy.");
}

main()
  .catch((error) => {
    console.error("VALIDATION FAILED:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
