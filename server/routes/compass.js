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

    // Response

    return res.json({
      algorithm_version: ALGORITHM_VERSION,
      count: recommendations.length,
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
