// Compass Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const { loadCompassCatalog } = require("../services/compassCatalog");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

const router = express.Router();

// Validation

const VALID_MOODS = new Set([
  "happy",
  "sad",
  "anxious",
  "calm",
  "tired",
  "excited",
]);

const VALID_EMOTIONS = new Set([
  "joy",
  "comfort",
  "calm",
  "inspiration",
  "thrill",
  "energy",
]);

const VALID_TIMES = new Set(["30", "60", "90", "120", "180plus"]);

const VALID_TYPES = new Set(["movie", "series", "either"]);

const RECOMMENDATION_LIMIT = 3;

// Recommendation Status

function getRecommendationStatus(count) {
  if (count === 0) {
    return {
      status: "empty",
      message: "No media currently matches your selected preferences.",
    };
  }

  if (count < RECOMMENDATION_LIMIT) {
    return {
      status: "partial",
      message: `Only ${count} matching recommendation${count === 1 ? "" : "s"} available.`,
    };
  }

  return {
    status: "complete",
    message: "3 recommendations found.",
  };
}

// Media Catalog

router.get("/catalog", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        category,
        release_year
      FROM public.media_catalog
      WHERE category IN ('movie', 'series')
      ORDER BY title ASC, release_year DESC, id ASC
    `);

    return res.json({
      count: result.rows.length,
      media: result.rows,
    });
  } catch (error) {
    console.error("Compass catalog error:", error);

    return res.status(500).json({
      message: "Unable to load media catalog.",
    });
  }
});

// Recommendations

router.post("/recommend", requireAuth, async (req, res) => {
  const { current_mood, desired_emotion, available_time, content_type } =
    req.body || {};

  if (
    !VALID_MOODS.has(current_mood) ||
    !VALID_EMOTIONS.has(desired_emotion) ||
    !VALID_TIMES.has(available_time) ||
    !VALID_TYPES.has(content_type)
  ) {
    return res.status(400).json({
      message: "Invalid Compass preferences.",
    });
  }

  try {
    // Preferred Genres

    const preferencesResult = await pool.query(
      `
        SELECT genres.name
        FROM public.compass_preferred_genres AS preferred
        JOIN public.genres AS genres
          ON genres.id = preferred.genre_id
        WHERE preferred.user_id = $1
      `,
      [req.userId],
    );

    const preferredGenres = preferencesResult.rows.map((row) => row.name);

    // Catalog

    const catalog = await loadCompassCatalog();

    // Recommendation Engine

    const recommendations = recommendMedia({
      catalog,
      currentMood: current_mood,
      desiredEmotion: desired_emotion,
      availableTime: available_time,
      contentType: content_type,
      preferredGenres,
    });

    // Response Status

    const result = getRecommendationStatus(recommendations.length);

    return res.json({
      algorithm_version: ALGORITHM_VERSION,
      count: recommendations.length,
      requested_count: RECOMMENDATION_LIMIT,
      result_status: result.status,
      message: result.message,
      recommendations,
    });
  } catch (error) {
    console.error("Compass recommendation error:", error);

    return res.status(500).json({
      message: "Unable to generate recommendations.",
    });
  }
});

module.exports = router;
