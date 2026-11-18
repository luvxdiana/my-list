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

// Library Genre Preferences

async function loadLibraryPreferredGenres(userId) {
  // Only positively rated movies and series contribute to the taste profile.
  // Entry genres use the canonical names from public.genres, comma-separated.
  const result = await pool.query(
    `
      SELECT genre.name, COUNT(*)::integer AS positive_count
      FROM public.entries AS entry
      CROSS JOIN LATERAL regexp_split_to_table(
        COALESCE(entry.genre, ''), ','
      ) AS selected_genre(raw_name)
      JOIN public.genres AS genre
        ON LOWER(genre.name) = LOWER(BTRIM(selected_genre.raw_name))
      WHERE entry.user_id = $1
        AND entry.category IN ('movie', 'series')
        AND entry.rating >= 4
      GROUP BY genre.id, genre.name
      ORDER BY positive_count DESC, genre.name ASC
      LIMIT 3
    `,
    [userId],
  );

  return result.rows.map((row) => row.name);
}

function combinePreferredGenres(onboardingGenres, libraryGenres) {
  const result = [...onboardingGenres];
  const seen = new Set(result.map((name) => name.toLowerCase()));

  for (const genre of libraryGenres) {
    const key = genre.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(genre);
    }
  }

  return result;
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
                      'comment', feedback.comment,
                      'voided_at', feedback.voided_at
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
          voided_at = NULL,
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

// Confirm Watched

router.post("/watched/:recommendationId", requireAuth, async (req, res) => {
  const recommendationId = req.params.recommendationId;
  const { emotional_fit_rating, desired_emotion_achieved = null } =
    req.body || {};

  if (!isValidDatabaseId(recommendationId)) {
    return res.status(400).json({ message: "Invalid recommendation ID." });
  }
  if (
    !Number.isInteger(emotional_fit_rating) ||
    emotional_fit_rating < 1 ||
    emotional_fit_rating > 5
  ) {
    return res
      .status(400)
      .json({ message: "Emotional fit rating must be from 1 to 5." });
  }
  if (
    desired_emotion_achieved !== null &&
    typeof desired_emotion_achieved !== "boolean"
  ) {
    return res.status(400).json({ message: "Invalid emotion response." });
  }

  try {
    const found = await pool.query(
      `SELECT media.id, media.tmdb_id, media.category, media.title,
              media.duration_minutes, media.release_year,
              COALESCE((SELECT array_agg(genre.name ORDER BY genre.name)
                FROM public.media_genres mg
                JOIN public.genres genre ON genre.id = mg.genre_id
                WHERE mg.media_id = media.id), ARRAY[]::text[]) AS genres
         FROM public.compass_recommendations recommendation
         JOIN public.compass_requests request ON request.id = recommendation.request_id
         JOIN public.media_catalog media ON media.id = recommendation.media_id
        WHERE recommendation.id = $1 AND request.user_id = $2`,
      [recommendationId, req.userId],
    );
    if (!found.rowCount)
      return res.status(404).json({ message: "Recommendation not found." });

    const media = found.rows[0];
    if (!Number.isInteger(media.tmdb_id) || media.tmdb_id <= 0) {
      return res
        .status(422)
        .json({ message: "This work has no verified TMDB ID yet." });
    }
    const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
    if (!token) {
      return res.status(503).json({
        message: "TMDB is not configured; unable to prefill description.",
      });
    }

    const type = media.category === "movie" ? "movie" : "tv";
    const api = new URL(
      `https://api.themoviedb.org/3/${type}/${media.tmdb_id}`,
    );
    api.searchParams.set("language", "en-US");
    const response = await fetch(api, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return res.status(502).json({
        message: "TMDB details could not be loaded. Nothing was saved.",
      });
    }
    const details = await response.json();
    const verifiedTitle = type === "movie" ? details.title : details.name;
    if (
      details.id !== media.tmdb_id ||
      details.adult === true ||
      typeof verifiedTitle !== "string" ||
      !verifiedTitle.trim()
    ) {
      return res
        .status(422)
        .json({ message: "TMDB details do not match the recommended work." });
    }

    const releaseDate =
      type === "movie" ? details.release_date : details.first_air_date;
    const tmdbYear =
      typeof releaseDate === "string" && /^\d{4}-/.test(releaseDate)
        ? Number(releaseDate.slice(0, 4))
        : null;
    if (
      media.release_year &&
      tmdbYear &&
      Number(media.release_year) !== tmdbYear
    ) {
      return res
        .status(422)
        .json({ message: "TMDB release year does not match the catalog." });
    }

    const title = verifiedTitle.trim().slice(0, 255);
    const description =
      typeof details.overview === "string"
        ? details.overview.slice(0, 20000)
        : null;
    const genres = media.genres.slice(0, 5);
    while (genres.join(", ").length > 100) genres.pop();
    const genre = genres.join(", ") || null;
    const length =
      media.category === "movie"
        ? Number.isInteger(details.runtime) && details.runtime >= 0
          ? details.runtime
          : null
        : Number.isInteger(details.number_of_episodes) &&
            details.number_of_episodes >= 0
          ? details.number_of_episodes
          : null;

    const db = await pool.connect();
    try {
      await db.query("BEGIN");
      // Legacy entries with no ID cannot safely be relinked automatically.
      const legacy = await db.query(
        `SELECT id FROM public.entries WHERE user_id=$1 AND category=$2
           AND tmdb_id IS NULL AND lower(btrim(title)) = lower(btrim($3))
         LIMIT 1`,
        [req.userId, media.category, title],
      );
      if (legacy.rowCount) {
        await db.query("ROLLBACK");
        return res.status(409).json({
          message:
            "A work with this title is already in your library. Link it manually before confirming.",
        });
      }

      const saved = await db.query(
        `INSERT INTO public.entries
          (user_id, title, category, genre, description, status, rating,
           total_episodes, duration_minutes, tmdb_id)
         VALUES ($1,$2,$3,$4,$5,'completed',NULL,$6,$7,$8)
         ON CONFLICT (user_id, category, tmdb_id)
           WHERE tmdb_id IS NOT NULL AND category IN ('movie', 'series')
         DO UPDATE SET status = 'completed', updated_at = NOW()
         RETURNING id::text, title, status, tmdb_id`,
        [
          req.userId,
          title,
          media.category,
          genre,
          description,
          media.category === "series" ? length : null,
          media.category === "movie" ? length : null,
          media.tmdb_id,
        ],
      );

      const feedback = await db.query(
        `INSERT INTO public.compass_feedback
           (recommendation_id, emotional_fit_rating, desired_emotion_achieved)
         VALUES ($1,$2,$3)
         ON CONFLICT (recommendation_id) DO UPDATE SET
           emotional_fit_rating=EXCLUDED.emotional_fit_rating,
           desired_emotion_achieved=EXCLUDED.desired_emotion_achieved,
           voided_at=NULL,
           updated_at=NOW()
         RETURNING emotional_fit_rating`,
        [recommendationId, emotional_fit_rating, desired_emotion_achieved],
      );
      await db.query(
        `INSERT INTO public.compass_watched_media (user_id, category, tmdb_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, category, tmdb_id) DO NOTHING`,
        [req.userId, media.category, media.tmdb_id],
      );
      await db.query("COMMIT");
      return res.json({
        message: "Watched work added to My List.",
        entry: saved.rows[0],
        feedback: feedback.rows[0],
      });
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    } finally {
      db.release();
    }
  } catch (error) {
    console.error("Compass watched error:", error);
    return res
      .status(500)
      .json({ message: "Unable to confirm watched media." });
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

    const onboardingGenres = preferencesResult.rows.map((row) => row.name);
    const libraryGenres = await loadLibraryPreferredGenres(req.userId);
    const preferredGenres = combinePreferredGenres(
      onboardingGenres,
      libraryGenres,
    );

    const catalog = await loadCompassCatalog();

    // Watched Media
    const watchedResult = await pool.query(
      `
        SELECT category, tmdb_id FROM public.entries
         WHERE user_id = $1 AND category IN ('movie', 'series')
           AND status = 'completed' AND tmdb_id IS NOT NULL
        UNION
        SELECT category, tmdb_id FROM public.compass_watched_media
         WHERE user_id = $1
      `,
      [req.userId],
    );

    const watchedKeys = new Set(
      watchedResult.rows.map((entry) => `${entry.category}:${entry.tmdb_id}`),
    );

    const availableCatalog = catalog.filter(
      (media) =>
        media.tmdb_id == null ||
        !watchedKeys.has(`${media.category}:${media.tmdb_id}`),
    );

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
          AND feedback.voided_at IS NULL
        ORDER BY feedback.updated_at DESC, feedback.id DESC
        LIMIT 100
      `,
      [req.userId],
    );

    const ranked = recommendMedia({
      catalog: availableCatalog,
      currentMood: current_mood,
      desiredEmotion: desired_emotion,
      availableTime: available_time,
      contentType: content_type,
      preferredGenres,
      historicalFeedback: feedbackResult.rows,
    });

    const catalogById = new Map(
      availableCatalog.map((item) => [String(item.id), item]),
    );
    const recommendations = ranked.map((item) => ({
      ...item,
      tmdb_id: catalogById.get(String(item.id))?.tmdb_id ?? null,
    }));

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
