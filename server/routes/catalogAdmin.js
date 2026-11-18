// Catalog Administration Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");
const requireCatalogAdmin = require("../middleware/requireCatalogAdmin");

const router = express.Router();

const TMDB_URL = "https://api.themoviedb.org/3";
const MAX_CATALOG_ROWS = 5000;

// Helpers

function httpError(status, message, details) {
  const error = new Error(message);

  error.status = status;

  if (details) {
    error.details = details;
  }

  return error;
}

function normalizeTitle(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getYear(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? Number(value.slice(0, 4))
    : null;
}

function getDuration(data, type) {
  const valid = (value) => Number.isInteger(value) && value > 0;

  if (type === "movie") {
    return valid(data.runtime) ? data.runtime : null;
  }

  const runtimes = Array.isArray(data.episode_run_time)
    ? data.episode_run_time
    : [];

  return (
    runtimes.find(valid) ??
    (valid(data.last_episode_to_air?.runtime)
      ? data.last_episode_to_air.runtime
      : null)
  );
}

// TMDB Details

async function getTmdbDetails(type, tmdbId) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();

  if (!token) {
    throw httpError(503, "TMDB API is not configured.");
  }

  const endpoint = type === "movie" ? "movie" : "tv";

  const url = new URL(`${TMDB_URL}/${endpoint}/${tmdbId}`);

  url.searchParams.set("language", "en-US");

  url.searchParams.set("append_to_response", "alternative_titles");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },

    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 404) {
    throw httpError(404, "TMDB item not found.");
  }

  if (response.status === 429) {
    throw httpError(503, "TMDB rate limit reached.");
  }

  if (!response.ok) {
    throw httpError(502, "TMDB is temporarily unavailable.");
  }

  const data = await response.json();

  const title = type === "movie" ? data.title : data.name;

  const year = getYear(
    type === "movie" ? data.release_date : data.first_air_date,
  );

  const duration = getDuration(data, type);

  // Validate Details

  if (
    data.id !== tmdbId ||
    data.adult === true ||
    typeof title !== "string" ||
    !title.trim()
  ) {
    throw httpError(422, "TMDB returned invalid media details.");
  }

  if (year === null || duration === null) {
    throw httpError(422, "Release year or duration is missing in TMDB.");
  }

  // Alternative Titles

  const alternateKey = type === "movie" ? "titles" : "results";

  const alternatives = data.alternative_titles?.[alternateKey];

  if (!Array.isArray(alternatives)) {
    throw httpError(502, "TMDB alternative titles are unavailable.");
  }

  const aliases = new Set();

  function addAlias(value) {
    const normalized = normalizeTitle(value);

    if (normalized) {
      aliases.add(normalized);
    }
  }

  addAlias(title);

  addAlias(type === "movie" ? data.original_title : data.original_name);

  for (const item of alternatives) {
    addAlias(item?.title);
  }

  // Genres

  const genres = Array.isArray(data.genres) ? data.genres : [];

  const genreNames = [
    ...new Set(
      genres
        .filter((genre) => typeof genre.name === "string" && genre.name.trim())
        .map((genre) => genre.name.trim()),
    ),
  ];

  if (genreNames.length === 0) {
    throw httpError(422, "TMDB did not provide usable genres.");
  }

  // Prepared Data

  return {
    title: title.trim(),
    year,
    duration,

    description:
      typeof data.overview === "string" && data.overview.trim()
        ? data.overview.trim()
        : null,

    aliases,
    genreNames,
  };
}

// Development Access

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");

  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  next();
});

// Administrator Access Check

router.get("/check", requireAuth, requireCatalogAdmin, (req, res) => {
  return res.status(200).json({
    message: "Catalog administrator access granted.",
    is_admin: true,
    user_id: req.userId,
    read_only: true,
  });
});

// Preview TMDB Candidate (Read Only)

router.get("/preview", requireAuth, requireCatalogAdmin, async (req, res) => {
  const { type, tmdb_id: rawTmdbId } = req.query;
  const tmdbId = Number(rawTmdbId);

  if (
    !["movie", "series"].includes(type) ||
    typeof rawTmdbId !== "string" ||
    !/^[1-9]\d*$/.test(rawTmdbId) ||
    !Number.isSafeInteger(tmdbId) ||
    tmdbId > 2147483647
  ) {
    return res.status(400).json({
      message: "Invalid media type or TMDB ID.",
      saved: false,
    });
  }

  try {
    const media = await getTmdbDetails(type, tmdbId);
    const existingResult = await pool.query(
      `SELECT id, title, release_year, tmdb_id
         FROM public.media_catalog
        WHERE category = $1
        ORDER BY id
        LIMIT $2`,
      [type, MAX_CATALOG_ROWS + 1],
    );

    if (existingResult.rows.length > MAX_CATALOG_ROWS) {
      throw httpError(409, "Catalog is too large for safe title matching.");
    }

    const possibleDuplicates = existingResult.rows
      .filter(
        (row) =>
          row.tmdb_id === tmdbId ||
          media.aliases.has(normalizeTitle(row.title)),
      )
      .slice(0, 10)
      .map((row) => ({
        media_id: row.id,
        title: row.title,
        release_year: row.release_year,
        tmdb_id: row.tmdb_id,
      }));

    const genreResult = await pool.query(
      `SELECT name FROM public.genres WHERE name = ANY($1::text[])`,
      [media.genreNames],
    );
    const availableGenres = new Set(genreResult.rows.map((row) => row.name));
    const missingGenres = media.genreNames.filter(
      (genre) => !availableGenres.has(genre),
    );

    return res.status(200).json({
      source: "TMDB",
      saved: false,
      media: {
        tmdb_id: tmdbId,
        type,
        title: media.title,
        release_year: media.year,
        duration_minutes: media.duration,
        description: media.description,
        genres: media.genreNames,
      },
      duplicate_candidates: possibleDuplicates,
      missing_genres: missingGenres,
      can_import: possibleDuplicates.length === 0 && missingGenres.length === 0,
      emotions_created: false,
      note: "TMDB does not provide verified Compass emotional annotations. New candidates will not be ranked until annotated.",
    });
  } catch (error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return res
        .status(504)
        .json({ message: "TMDB request timed out.", saved: false });
    }
    if (error.status) {
      return res
        .status(error.status)
        .json({ message: error.message, saved: false });
    }
    console.error("Catalog preview error:", error);
    return res
      .status(500)
      .json({ message: "Catalog preview failed.", saved: false });
  }
});

// Import New Media

router.post(
  "/import",
  requireAuth,
  requireCatalogAdmin,

  async (req, res) => {
    const {
      type,
      tmdb_id: tmdbId,
      expected_title: expectedTitle,
      expected_year: expectedYear,
      confirm_import: confirmation,
    } = req.body || {};

    // Validate Request

    if (
      !["movie", "series"].includes(type) ||
      !Number.isInteger(tmdbId) ||
      tmdbId < 1 ||
      tmdbId > 2147483647 ||
      typeof expectedTitle !== "string" ||
      !expectedTitle.trim() ||
      expectedTitle.length > 250 ||
      !Number.isInteger(expectedYear) ||
      expectedYear < 1880 ||
      expectedYear > 2200
    ) {
      return res.status(400).json({
        message: "Invalid import parameters.",
      });
    }

    // Explicit Confirmation

    if (confirmation !== "IMPORT") {
      return res.status(400).json({
        message:
          "Explicit confirmation is required: " +
          "confirm_import must be IMPORT.",

        saved: false,
      });
    }

    let client;

    try {
      // Load Current TMDB Data

      const media = await getTmdbDetails(type, tmdbId);

      // Verify Confirmed Media

      if (media.title !== expectedTitle.trim() || media.year !== expectedYear) {
        throw httpError(
          409,
          "TMDB details differ from the " + "confirmed title or year.",
        );
      }

      // Begin Transaction

      client = await pool.connect();

      await client.query("BEGIN");

      // Recheck Administrator

      const adminResult = await client.query(
        `
          SELECT is_admin
          FROM public.users
          WHERE id = $1
          FOR SHARE;
        `,
        [req.userId],
      );

      if (adminResult.rows[0]?.is_admin !== true) {
        throw httpError(403, "Administrator access required.");
      }

      // Lock Catalog

      await client.query(
        `
          LOCK TABLE public.media_catalog
          IN SHARE ROW EXCLUSIVE MODE;
        `,
      );

      // Load Existing Media

      const current = await client.query(
        `
          SELECT
            id,
            title,
            release_year,
            tmdb_id

          FROM public.media_catalog

          WHERE category = $1

          ORDER BY id

          LIMIT $2;
        `,
        [type, MAX_CATALOG_ROWS + 1],
      );

      if (current.rows.length > MAX_CATALOG_ROWS) {
        throw httpError(409, "Catalog is too large for safe title matching.");
      }

      // Check Duplicates

      const duplicates = current.rows.filter(
        (row) =>
          row.tmdb_id === tmdbId ||
          media.aliases.has(normalizeTitle(row.title)),
      );

      if (duplicates.length > 0) {
        throw httpError(
          409,
          "Possible existing media found. Import blocked.",

          {
            candidates: duplicates.slice(0, 10).map((row) => ({
              media_id: row.id,
              title: row.title,
              release_year: row.release_year,
              tmdb_id: row.tmdb_id,
            })),
          },
        );
      }

      // Check Local Genres

      const found = await client.query(
        `
          SELECT id, name

          FROM public.genres

          WHERE name = ANY($1::text[]);
        `,
        [media.genreNames],
      );

      const available = new Set(found.rows.map((row) => row.name));

      const missing = media.genreNames.filter((name) => !available.has(name));

      if (missing.length > 0) {
        throw httpError(
          409,
          "Genre mapping requires manual review.",

          {
            missing_genres: missing,
          },
        );
      }

      // Allocate Media ID

      const idResult = await client.query(
        `
          SELECT
            nextval(
              'public.media_catalog_id_seq'::regclass
            ) AS id;
        `,
      );

      const mediaId = idResult.rows[0].id;

      // Verify Sequence

      const idExists = await client.query(
        `
          SELECT 1

          FROM public.media_catalog

          WHERE id = $1;
        `,
        [mediaId],
      );

      if (idExists.rowCount !== 0) {
        throw httpError(409, "Catalog ID sequence needs synchronization.");
      }

      // Insert Media

      const inserted = await client.query(
        `
          INSERT INTO public.media_catalog (
            id,
            title,
            category,
            release_year,
            duration_minutes,
            description,
            tmdb_id
          )

          OVERRIDING SYSTEM VALUE

          VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )

          RETURNING
            id,
            title,
            category,
            release_year,
            duration_minutes,
            tmdb_id;
        `,
        [
          mediaId,
          media.title,
          type,
          media.year,
          media.duration,
          media.description,
          tmdbId,
        ],
      );

      // Link Existing Genres

      const linkedGenres = await client.query(
        `
          INSERT INTO public.media_genres (
            media_id,
            genre_id
          )

          SELECT
            $1::bigint,
            id

          FROM public.genres

          WHERE name = ANY($2::text[])

          RETURNING genre_id;
        `,
        [mediaId, media.genreNames],
      );

      // Verify Genre Links

      if (linkedGenres.rowCount !== media.genreNames.length) {
        throw httpError(
          500,
          "Unexpected genre link count. " + "Import rolled back.",
        );
      }

      // Commit Transaction

      await client.query("COMMIT");

      // Success

      return res.status(201).json({
        message: "Media imported successfully.",

        saved: true,

        media: inserted.rows[0],

        genres: media.genreNames,

        emotions_created: false,
      });
    } catch (error) {
      // Rollback

      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error("Catalog import rollback error:", rollbackError);
        }
      }

      // Timeout

      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return res.status(504).json({
          message: "TMDB request timed out.",
          saved: false,
        });
      }

      // Database Conflict

      if (error.code === "23505") {
        return res.status(409).json({
          message: "A conflicting media record already exists.",

          saved: false,
        });
      }

      // Expected Error

      if (error.status) {
        return res.status(error.status).json({
          message: error.message,

          saved: false,

          ...(error.details || {}),
        });
      }

      // Unexpected Error

      console.error("Catalog import error:", error);

      return res.status(500).json({
        message: "Catalog import failed.",
        saved: false,
      });
    } finally {
      client?.release();
    }
  },
);

// Annotation Options

router.get(
  "/annotation-options",
  requireAuth,
  requireCatalogAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id::text, code, name FROM public.emotions ORDER BY id`,
      );
      return res.json({
        emotions: result.rows,
        annotation_status: "provisional",
        read_only: true,
      });
    } catch (error) {
      console.error("Annotation options error:", error);
      return res
        .status(500)
        .json({ message: "Unable to load annotation options." });
    }
  },
);

// Annotation Preview

router.get(
  "/annotations/:mediaId",
  requireAuth,
  requireCatalogAdmin,
  async (req, res) => {
    const { mediaId } = req.params;
    if (!/^[1-9]\d*$/.test(mediaId) || !Number.isSafeInteger(Number(mediaId))) {
      return res.status(400).json({ message: "Invalid media ID." });
    }

    try {
      const mediaResult = await pool.query(
        `SELECT id::text, title, category, tmdb_id FROM public.media_catalog WHERE id = $1`,
        [mediaId],
      );
      if (!mediaResult.rows.length) {
        return res.status(404).json({ message: "Media not found." });
      }
      const labels = await pool.query(
        `SELECT e.code, e.name, me.annotation_source, me.annotation_status
       FROM public.media_emotions AS me
       JOIN public.emotions AS e ON e.id = me.emotion_id
       WHERE me.media_id = $1 ORDER BY e.id`,
        [mediaId],
      );
      const canEdit =
        mediaResult.rows[0].tmdb_id !== null &&
        labels.rows.every(
          (row) =>
            row.annotation_source === "manual_admin" &&
            row.annotation_status === "provisional",
        );
      return res.json({
        media: mediaResult.rows[0],
        emotions: labels.rows,
        can_edit: canEdit,
        warning:
          "Provisional labels enter Compass recommendations. Do not assign emotions without a defensible annotation basis.",
      });
    } catch (error) {
      console.error("Annotation preview error:", error);
      return res
        .status(500)
        .json({ message: "Unable to load media annotations." });
    }
  },
);

// Save Provisional Annotations

router.put(
  "/annotations/:mediaId",
  requireAuth,
  requireCatalogAdmin,
  async (req, res) => {
    const { mediaId } = req.params;
    const { emotion_codes: emotionCodes, confirm_annotation: confirmation } =
      req.body || {};
    if (!/^[1-9]\d*$/.test(mediaId) || !Number.isSafeInteger(Number(mediaId))) {
      return res
        .status(400)
        .json({ message: "Invalid media ID.", saved: false });
    }
    if (
      !Array.isArray(emotionCodes) ||
      emotionCodes.length < 1 ||
      emotionCodes.length > 6 ||
      emotionCodes.some(
        (code) => typeof code !== "string" || !/^[a-z_]{1,30}$/.test(code),
      ) ||
      new Set(emotionCodes).size !== emotionCodes.length
    ) {
      return res.status(400).json({
        message: "Provide 1–6 distinct valid emotion codes.",
        saved: false,
      });
    }
    if (confirmation !== "ANNOTATE_PROVISIONAL") {
      return res.status(400).json({
        message: "Explicit provisional annotation confirmation required.",
        saved: false,
      });
    }

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const admin = await client.query(
        `SELECT is_admin FROM public.users WHERE id = $1 FOR SHARE`,
        [req.userId],
      );
      if (admin.rows[0]?.is_admin !== true) {
        throw httpError(403, "Administrator access required.");
      }

      const media = await client.query(
        `SELECT id, title, category, tmdb_id FROM public.media_catalog WHERE id = $1 FOR UPDATE`,
        [mediaId],
      );
      if (!media.rows.length) throw httpError(404, "Media not found.");
      if (media.rows[0].tmdb_id === null) {
        throw httpError(
          409,
          "Only TMDB-linked imported candidates can be annotated here.",
        );
      }

      const existing = await client.query(
        `SELECT annotation_source, annotation_status
       FROM public.media_emotions WHERE media_id = $1 FOR UPDATE`,
        [mediaId],
      );
      if (
        existing.rows.some(
          (row) =>
            row.annotation_source !== "manual_admin" ||
            row.annotation_status !== "provisional",
        )
      ) {
        throw httpError(
          409,
          "Existing research or reviewed labels cannot be edited here.",
        );
      }

      const valid = await client.query(
        `SELECT id, code FROM public.emotions WHERE code = ANY($1::text[]) ORDER BY id`,
        [emotionCodes],
      );
      if (valid.rows.length !== emotionCodes.length) {
        throw httpError(400, "Unknown emotion code.");
      }

      await client.query(
        `DELETE FROM public.media_emotions WHERE media_id = $1`,
        [mediaId],
      );
      const inserted = await client.query(
        `INSERT INTO public.media_emotions
          (media_id, emotion_id, annotation_source, annotation_status)
       SELECT $1::bigint, id, 'manual_admin', 'provisional'
       FROM public.emotions WHERE code = ANY($2::text[])
       RETURNING emotion_id`,
        [mediaId, emotionCodes],
      );
      if (inserted.rowCount !== emotionCodes.length) {
        throw httpError(500, "Annotation count mismatch; rolling back.");
      }

      await client.query("COMMIT");
      return res.status(200).json({
        saved: true,
        media: { id: String(media.rows[0].id), title: media.rows[0].title },
        emotion_codes: valid.rows.map((row) => row.code),
        annotation_source: "manual_admin",
        annotation_status: "provisional",
        disclaimer:
          "Labels are preliminary, not independently verified, and will enter Compass recommendations.",
      });
    } catch (error) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error("Annotation rollback error:", rollbackError);
        }
      }
      if (error.status)
        return res
          .status(error.status)
          .json({ saved: false, message: error.message });
      console.error("Annotation save error:", error);
      return res
        .status(500)
        .json({ saved: false, message: "Unable to save annotations." });
    } finally {
      client?.release();
    }
  },
);

// Delete Provisional Annotations

router.delete(
  "/annotations/:mediaId",
  requireAuth,
  requireCatalogAdmin,
  async (req, res) => {
    const { mediaId } = req.params;
    const { confirm_delete: confirmation } = req.body || {};

    if (!/^[1-9]\d*$/.test(mediaId) || !Number.isSafeInteger(Number(mediaId))) {
      return res
        .status(400)
        .json({ saved: false, message: "Invalid media ID." });
    }
    if (confirmation !== "DELETE_PROVISIONAL") {
      return res.status(400).json({
        saved: false,
        message:
          "Explicit provisional annotation deletion confirmation required.",
      });
    }

    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");

      const admin = await client.query(
        `SELECT is_admin FROM public.users WHERE id = $1 FOR SHARE`,
        [req.userId],
      );
      if (admin.rows[0]?.is_admin !== true) {
        throw httpError(403, "Administrator access required.");
      }

      const media = await client.query(
        `SELECT id, title, tmdb_id FROM public.media_catalog WHERE id = $1 FOR UPDATE`,
        [mediaId],
      );
      if (!media.rows.length) throw httpError(404, "Media not found.");
      if (media.rows[0].tmdb_id === null) {
        throw httpError(409, "Only TMDB-linked media can be cleared here.");
      }

      const existing = await client.query(
        `SELECT annotation_source, annotation_status
           FROM public.media_emotions
          WHERE media_id = $1
          FOR UPDATE`,
        [mediaId],
      );
      if (existing.rows.length === 0) {
        throw httpError(409, "There are no annotations to clear.");
      }
      if (
        existing.rows.some(
          (row) =>
            row.annotation_source !== "manual_admin" ||
            row.annotation_status !== "provisional",
        )
      ) {
        throw httpError(
          409,
          "Research or reviewed annotations cannot be deleted here.",
        );
      }

      const deleted = await client.query(
        `DELETE FROM public.media_emotions
          WHERE media_id = $1
            AND annotation_source = 'manual_admin'
            AND annotation_status = 'provisional'
          RETURNING emotion_id`,
        [mediaId],
      );
      if (deleted.rowCount !== existing.rowCount) {
        throw httpError(
          409,
          "Annotations changed during deletion; rolled back.",
        );
      }

      await client.query("COMMIT");
      return res.status(200).json({
        deleted: true,
        media: { id: String(media.rows[0].id), title: media.rows[0].title },
        removed_labels: deleted.rowCount,
        note: "This media is no longer eligible for Compass ranking unless other annotations are added.",
      });
    } catch (error) {
      if (client) {
        try {
          await client.query("ROLLBACK");
        } catch (rollbackError) {
          console.error("Annotation delete rollback error:", rollbackError);
        }
      }
      if (error.status) {
        return res
          .status(error.status)
          .json({ deleted: false, message: error.message });
      }
      console.error("Annotation delete error:", error);
      return res.status(500).json({
        deleted: false,
        message: "Unable to delete annotations.",
      });
    } finally {
      client?.release();
    }
  },
);

module.exports = router;
