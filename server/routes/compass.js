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

function isValidDatabaseId(value) {
  return (
    typeof value === "string" &&
    /^[1-9]\d{0,18}$/.test(value) &&
    BigInt(value) <= 9223372036854775807n
  );
}

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

// History Storage

async function saveCompassHistory({
  userId,
  currentMood,
  desiredEmotion,
  availableTime,
  contentType,
  recommendations,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `
        INSERT INTO public.compass_requests (
          user_id, current_mood, desired_emotion, available_time, content_type
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      [userId, currentMood, desiredEmotion, availableTime, contentType],
    );

    const requestId = requestResult.rows[0].id;
    const savedRecommendations = [];

    for (const media of recommendations) {
      const saved = await client.query(
        `
          INSERT INTO public.compass_recommendations (
            request_id, media_id, position, score, algorithm_version
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [requestId, media.id, media.position, media.score, ALGORITHM_VERSION],
      );

      savedRecommendations.push({
        ...media,
        recommendation_id: saved.rows[0].id,
      });
    }

    await client.query("COMMIT");

    return { requestId, recommendations: savedRecommendations };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Compass history rollback error:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

// Media Catalog

router.get("/catalog", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, category, release_year
      FROM public.media_catalog
      WHERE category IN ('movie', 'series')
      ORDER BY title ASC, release_year DESC, id ASC
    `);

    return res.json({ count: result.rows.length, media: result.rows });
  } catch (error) {
    console.error("Compass catalog error:", error);
    return res.status(500).json({ message: "Unable to load media catalog." });
  }
});

// History List

router.get("/history", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          request.id,
          request.current_mood,
          request.desired_emotion,
          request.available_time,
          request.content_type,
          request.created_at,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'recommendation_id', recommendation.id::text,
                  'media_id', media.id::text,
                  'position', recommendation.position,
                  'title', media.title,
                  'category', media.category,
                  'release_year', media.release_year,
                  'duration_minutes', media.duration_minutes,
                  'score', recommendation.score,
                  'algorithm_version', recommendation.algorithm_version,
                  'feedback', CASE
                    WHEN feedback.id IS NULL THEN NULL
                    ELSE json_build_object(
                      'emotional_fit_rating', feedback.emotional_fit_rating,
                      'media_rating', feedback.media_rating,
                      'desired_emotion_achieved', feedback.desired_emotion_achieved,
                      'comment', feedback.comment
                    )
                  END
                )
                ORDER BY recommendation.position
              )
              FROM public.compass_recommendations AS recommendation
              JOIN public.media_catalog AS media
                ON media.id = recommendation.media_id
              LEFT JOIN public.compass_feedback AS feedback
                ON feedback.recommendation_id = recommendation.id
              WHERE recommendation.request_id = request.id
            ),
            '[]'::json
          ) AS recommendations
        FROM public.compass_requests AS request
        WHERE request.user_id = $1
        ORDER BY request.created_at DESC, request.id DESC
      `,
      [req.userId],
    );

    return res.json({ count: result.rows.length, history: result.rows });
  } catch (error) {
    console.error("Compass history list error:", error);
    return res.status(500).json({ message: "Unable to load Compass history." });
  }
});

// Recommendation Feedback

router.put("/feedback/:recommendationId", requireAuth, async (req, res) => {
  const { recommendationId } = req.params;

  if (!isValidDatabaseId(recommendationId)) {
    return res.status(400).json({ message: "Invalid recommendation ID." });
  }

  const {
    emotional_fit_rating,
    media_rating = null,
    desired_emotion_achieved = null,
    comment = null,
  } = req.body || {};

  if (
    !Number.isInteger(emotional_fit_rating) ||
    emotional_fit_rating < 1 ||
    emotional_fit_rating > 5
  ) {
    return res.status(400).json({
      message: "Emotional fit rating must be an integer from 1 to 5.",
    });
  }

  if (
    media_rating !== null &&
    (typeof media_rating !== "number" ||
      !Number.isFinite(media_rating) ||
      media_rating < 0.5 ||
      media_rating > 5 ||
      !Number.isInteger(media_rating * 2))
  ) {
    return res.status(400).json({
      message:
        "Media rating must be between 0.5 and 5 in half-star increments.",
    });
  }

  if (
    desired_emotion_achieved !== null &&
    typeof desired_emotion_achieved !== "boolean"
  ) {
    return res.status(400).json({
      message: "Desired emotion achieved must be true, false, or null.",
    });
  }

  if (
    comment !== null &&
    (typeof comment !== "string" || comment.length > 2000)
  ) {
    return res.status(400).json({
      message: "Comment must be a string of at most 2000 characters.",
    });
  }

  const safeComment =
    typeof comment === "string" ? comment.trim() || null : null;

  try {
    // Ownership is checked in the INSERT source query.
    const result = await pool.query(
      `
        INSERT INTO public.compass_feedback (
          recommendation_id,
          emotional_fit_rating,
          media_rating,
          desired_emotion_achieved,
          comment
        )
        SELECT
          recommendation.id,
          $3,
          $4,
          $5,
          $6
        FROM public.compass_recommendations AS recommendation
        JOIN public.compass_requests AS request
          ON request.id = recommendation.request_id
        WHERE recommendation.id = $1
          AND request.user_id = $2
        ON CONFLICT (recommendation_id)
        DO UPDATE SET
          emotional_fit_rating = EXCLUDED.emotional_fit_rating,
          media_rating = EXCLUDED.media_rating,
          desired_emotion_achieved = EXCLUDED.desired_emotion_achieved,
          comment = EXCLUDED.comment,
          updated_at = NOW()
        RETURNING
          id::text,
          recommendation_id::text,
          emotional_fit_rating,
          media_rating,
          desired_emotion_achieved,
          comment,
          updated_at
      `,
      [
        recommendationId,
        req.userId,
        emotional_fit_rating,
        media_rating,
        desired_emotion_achieved,
        safeComment,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Recommendation not found.",
      });
    }

    return res.json({
      message: "Compass feedback saved.",
      feedback: result.rows[0],
    });
  } catch (error) {
    console.error("Compass feedback error:", error);
    return res
      .status(500)
      .json({ message: "Unable to save Compass feedback." });
  }
});

// History Delete

router.delete("/history/:requestId", requireAuth, async (req, res) => {
  const { requestId } = req.params;

  if (!isValidDatabaseId(requestId)) {
    return res.status(400).json({ message: "Invalid Compass history ID." });
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM public.compass_requests
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `,
      [requestId, req.userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Compass history entry not found.",
      });
    }

    return res.json({
      message: "Compass history entry deleted.",
      deleted_request_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Compass history delete error:", error);
    return res
      .status(500)
      .json({ message: "Unable to delete Compass history." });
  }
});

// Recommendations

router.post("/recommend", requireAuth, async (req, res) => {
  const {
    current_mood,
    desired_emotion,
    available_time,
    content_type,
    save_history = false,
  } = req.body || {};

  if (
    !VALID_MOODS.has(current_mood) ||
    !VALID_EMOTIONS.has(desired_emotion) ||
    !VALID_TIMES.has(available_time) ||
    !VALID_TYPES.has(content_type)
  ) {
    return res.status(400).json({ message: "Invalid Compass preferences." });
  }

  if (typeof save_history !== "boolean") {
    return res.status(400).json({ message: "Invalid history preference." });
  }

  if (save_history && process.env.COMPASS_HISTORY_WRITES_ENABLED !== "true") {
    return res.status(503).json({
      message: "Compass history saving is not enabled.",
    });
  }

  try {
    const preferencesResult = await pool.query(
      `
        SELECT genres.name
        FROM public.compass_preferred_genres AS preferred
        JOIN public.genres AS genres ON genres.id = preferred.genre_id
        WHERE preferred.user_id = $1
      `,
      [req.userId],
    );

    const preferredGenres = preferencesResult.rows.map((row) => row.name);
    const catalog = await loadCompassCatalog();

    // Personal Feedback

    const feedbackResult = await pool.query(
      `
        SELECT
          feedback.emotional_fit_rating,
          request.current_mood,
          request.desired_emotion,
          COALESCE(
            (
              SELECT ARRAY_AGG(genre.name::text ORDER BY genre.name)
              FROM public.media_genres AS media_genre
              JOIN public.genres AS genre
                ON genre.id = media_genre.genre_id
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
      [req.userId],
    );

    const recommendations = recommendMedia({
      catalog,
      currentMood: current_mood,
      desiredEmotion: desired_emotion,
      availableTime: available_time,
      contentType: content_type,
      preferredGenres,
      historicalFeedback: feedbackResult.rows,
    });

    const result = getRecommendationStatus(recommendations.length);

    if (!save_history) {
      return res.json({
        algorithm_version: ALGORITHM_VERSION,
        count: recommendations.length,
        requested_count: RECOMMENDATION_LIMIT,
        result_status: result.status,
        message: result.message,
        history_saved: false,
        request_id: null,
        recommendations,
      });
    }

    const saved = await saveCompassHistory({
      userId: req.userId,
      currentMood: current_mood,
      desiredEmotion: desired_emotion,
      availableTime: available_time,
      contentType: content_type,
      recommendations,
    });

    return res.json({
      algorithm_version: ALGORITHM_VERSION,
      count: saved.recommendations.length,
      requested_count: RECOMMENDATION_LIMIT,
      result_status: result.status,
      message: result.message,
      history_saved: true,
      request_id: saved.requestId,
      recommendations: saved.recommendations,
    });
  } catch (error) {
    console.error("Compass recommendation error:", error);
    return res.status(500).json({
      message: "Unable to generate recommendations.",
    });
  }
});

module.exports = router;
