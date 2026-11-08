// Onboarding Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const MIN_GENRES = 3;
const MAX_GENRES = 5;
const MAX_BIGINT = 9223372036854775807n;

const CONTENT_TYPES = new Set(["movie", "series", "either"]);

// Genre Validation

function validateGenreIds(value) {
  if (
    !Array.isArray(value) ||
    value.length < MIN_GENRES ||
    value.length > MAX_GENRES
  ) {
    return null;
  }

  const ids = [];
  const seen = new Set();

  for (const valueId of value) {
    if (typeof valueId !== "string" && typeof valueId !== "number") {
      return null;
    }

    if (typeof valueId === "number" && !Number.isSafeInteger(valueId)) {
      return null;
    }

    const id = String(valueId).trim();

    if (!/^[1-9]\d*$/.test(id) || BigInt(id) > MAX_BIGINT) {
      return null;
    }

    if (seen.has(id)) {
      return null;
    }

    seen.add(id);
    ids.push(id);
  }

  return ids;
}

// Onboarding Options

router.get("/options", requireAuth, async (req, res) => {
  try {
    const genresResult = await pool.query(`
            SELECT
                id,
                name
            FROM public.genres
            ORDER BY name ASC
        `);

    const preferencesResult = await pool.query(
      `
            SELECT
                preferred_content_type,
                onboarding_completed
            FROM public.compass_preferences
            WHERE user_id = $1
            `,
      [req.userId],
    );

    const selectedGenresResult = await pool.query(
      `
            SELECT
                genre_id
            FROM public.compass_preferred_genres
            WHERE user_id = $1
            ORDER BY genre_id
            `,
      [req.userId],
    );

    const preferences = preferencesResult.rows[0];

    const selectedGenreIds = selectedGenresResult.rows.map((row) =>
      String(row.genre_id),
    );

    res.set("Cache-Control", "no-store");

    return res.json({
      genres: genresResult.rows,

      preferences: {
        onboarding_completed: preferences?.onboarding_completed ?? false,

        preferred_content_type: preferences?.preferred_content_type ?? null,

        preferred_genre_ids: selectedGenreIds,
      },
    });
  } catch (error) {
    console.error("Onboarding options error:", error);

    return res.status(500).json({
      message: "Unable to load onboarding options.",
    });
  }
});

// Save Onboarding Preferences

router.post("/", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  const { preferred_content_type, genre_ids } = req.body || {};

  // Content Type Validation

  if (!CONTENT_TYPES.has(preferred_content_type)) {
    return res.status(400).json({
      message: "Invalid preferred content type.",
      saved: false,
    });
  }

  // Genre Validation

  const selectedGenreIds = validateGenreIds(genre_ids);

  if (!selectedGenreIds) {
    return res.status(400).json({
      message: "Please select 3 to 5 different genres.",
      saved: false,
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // Verify Genres

    const genresResult = await client.query(
      `
            SELECT id
            FROM public.genres
            WHERE id = ANY($1::bigint[])
            `,
      [selectedGenreIds],
    );

    if (genresResult.rowCount !== selectedGenreIds.length) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        message: "One or more selected genres do not exist.",
        saved: false,
      });
    }

    // Save Preferences

    await client.query(
      `
            INSERT INTO public.compass_preferences (
                user_id,
                preferred_content_type,
                onboarding_completed
            )
            VALUES ($1, $2, TRUE)

            ON CONFLICT (user_id)
            DO UPDATE SET
                preferred_content_type =
                    EXCLUDED.preferred_content_type,
                onboarding_completed = TRUE,
                updated_at = NOW()
            `,
      [req.userId, preferred_content_type],
    );

    // Replace Previous Genres

    await client.query(
      `
            DELETE FROM public.compass_preferred_genres
            WHERE user_id = $1
            `,
      [req.userId],
    );

    // Save Selected Genres

    for (const genreId of selectedGenreIds) {
      await client.query(
        `
                INSERT INTO public.compass_preferred_genres (
                    user_id,
                    genre_id
                )
                VALUES ($1, $2)
                `,
        [req.userId, genreId],
      );
    }

    // Commit

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      message: "Compass preferences saved successfully.",
      saved: true,

      preferences: {
        onboarding_completed: true,
        preferred_content_type,
        preferred_genre_ids: selectedGenreIds,
      },
    });
  } catch (error) {
    // Rollback

    if (transactionStarted && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Onboarding rollback error:", rollbackError);
      }
    }

    console.error("Onboarding save error:", error);

    return res.status(500).json({
      message: "Unable to save Compass preferences.",
      saved: false,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
