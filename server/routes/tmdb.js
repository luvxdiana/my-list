// TMDB Routes

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const pool = require("../db");

const router = express.Router();

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const VALID_TYPES = new Set(["movie", "series"]);
const MAX_CATALOG_ROWS = 5000;

// Read-only TMDB access is opt-in in production.
// Administrative import remains development-only in catalogAdmin.js.
function isTmdbReadEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.TMDB_READ_ONLY_ENABLED === "true"
  );
}

// Helpers

function getReleaseYear(date) {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? Number(date.slice(0, 4))
    : null;
}

function getPositiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

function getTmdbId(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

function validateMediaType(type) {
  return typeof type === "string" && VALID_TYPES.has(type);
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

// Media Formatting

function formatMedia(media, type) {
  const isMovie = type === "movie";

  return {
    tmdb_id: media.id,

    title: isMovie ? media.title : media.name,

    category: type,

    release_year: getReleaseYear(
      isMovie ? media.release_date : media.first_air_date,
    ),

    description: media.overview || null,

    tmdb_genre_ids: Array.isArray(media.genre_ids) ? media.genre_ids : [],

    poster_path: media.poster_path || null,
  };
}

function formatMediaDetails(media, type) {
  const isMovie = type === "movie";

  const episodeRuntimes = Array.isArray(media.episode_run_time)
    ? media.episode_run_time
    : [];

  const durationMinutes = isMovie
    ? getPositiveInteger(media.runtime)
    : (episodeRuntimes
        .map(getPositiveInteger)
        .find((value) => value !== null) ??
      getPositiveInteger(media.last_episode_to_air?.runtime));

  const genres = Array.isArray(media.genres)
    ? media.genres
        .filter(
          (genre) =>
            Number.isInteger(genre.id) &&
            typeof genre.name === "string" &&
            genre.name.trim(),
        )
        .map((genre) => ({
          tmdb_id: genre.id,
          name: genre.name,
        }))
    : [];

  return {
    tmdb_id: media.id,

    title: isMovie ? media.title : media.name,

    category: type,

    release_year: getReleaseYear(
      isMovie ? media.release_date : media.first_air_date,
    ),

    duration_minutes: durationMinutes,

    duration_type: isMovie ? "movie" : "episode",

    description: media.overview || null,

    genres,

    poster_path: media.poster_path || null,

    tmdb_url: `https://www.themoviedb.org/${
      isMovie ? "movie" : "tv"
    }/${media.id}`,
  };
}

// TMDB Request

async function requestTmdb(path, parameters = {}) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();

  if (!token) {
    const error = new Error("TMDB API is not configured.");

    error.status = 503;

    throw error;
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);

  url.searchParams.set("language", "en-US");

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },

    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    let message = "TMDB is temporarily unavailable.";
    let status = 502;

    if (response.status === 404) {
      message = "TMDB item not found.";
      status = 404;
    } else if (response.status === 401 || response.status === 403) {
      message = "TMDB authentication failed.";
    } else if (response.status === 429) {
      message = "TMDB rate limit reached. Please try again later.";

      status = 503;
    }

    const error = new Error(message);
    error.status = status;

    throw error;
  }

  return response.json();
}

// TMDB Details Helper

async function getTmdbMediaData(type, tmdbId, includeAlternatives = false) {
  const endpoint = type === "movie" ? "movie" : "tv";

  const data = await requestTmdb(
    `/${endpoint}/${tmdbId}`,

    includeAlternatives ? { append_to_response: "alternative_titles" } : {},
  );

  const title = type === "movie" ? data.title : data.name;

  if (
    data.id !== tmdbId ||
    typeof title !== "string" ||
    !title.trim() ||
    data.adult === true
  ) {
    const error = new Error("Media details not available.");

    error.status = 404;

    throw error;
  }

  return data;
}

// Error Handler

function handleTmdbError(error, res) {
  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return res.status(504).json({
      message: "TMDB request timed out.",
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

  console.error("TMDB API error:", error);

  return res.status(502).json({
    message: "Unable to retrieve TMDB data.",
  });
}

// Title Variants

function getTitleVariants(data, type) {
  const alternativeTitles = data.alternative_titles;

  const listKey = type === "movie" ? "titles" : "results";

  if (!alternativeTitles || !Array.isArray(alternativeTitles[listKey])) {
    throw new Error("TMDB alternative titles are unavailable.");
  }

  const primaryTitle = type === "movie" ? data.title : data.name;

  const originalTitle =
    type === "movie" ? data.original_title : data.original_name;

  const titles = new Map();

  function addTitle(title, source) {
    const key = normalizeTitle(title);

    if (key && !titles.has(key)) {
      titles.set(key, {
        title: title.trim(),
        source,
      });
    }
  }

  addTitle(primaryTitle, "primary");
  addTitle(originalTitle, "original");

  for (const item of alternativeTitles[listKey]) {
    addTitle(item?.title, "alternative");
  }

  return titles;
}

// Search Media

router.get("/search", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (!isTmdbReadEnabled()) {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  const { type, q } = req.query;

  if (!validateMediaType(type) || typeof q !== "string") {
    return res.status(400).json({
      message: "Invalid TMDB search parameters.",
    });
  }

  const searchQuery = q.trim();

  if (searchQuery.length < 2 || searchQuery.length > 100) {
    return res.status(400).json({
      message: "Search query must contain 2–100 characters.",
    });
  }

  try {
    const endpoint = type === "movie" ? "movie" : "tv";

    const data = await requestTmdb(
      `/search/${endpoint}`,

      {
        query: searchQuery,
        include_adult: "false",
        page: 1,
      },
    );

    if (!Array.isArray(data.results)) {
      throw new Error("Invalid TMDB search response.");
    }

    const results = data.results
      .filter((media) => {
        const title = type === "movie" ? media.title : media.name;

        return (
          Number.isSafeInteger(media.id) &&
          media.id > 0 &&
          typeof title === "string" &&
          title.trim().length > 0 &&
          media.adult !== true
        );
      })
      .map((media) => formatMedia(media, type));

    return res.status(200).json({
      source: "TMDB",
      query: searchQuery,
      category: type,
      page: 1,
      count: results.length,
      total_results: data.total_results || 0,
      results,
    });
  } catch (error) {
    return handleTmdbError(error, res);
  }
});

// Media Details

router.get("/details", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (!isTmdbReadEnabled()) {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  const { type, id } = req.query;

  if (!validateMediaType(type)) {
    return res.status(400).json({
      message: "Invalid media type.",
    });
  }

  const tmdbId = getTmdbId(id);

  if (tmdbId === null) {
    return res.status(400).json({
      message: "Invalid TMDB ID.",
    });
  }

  try {
    const data = await getTmdbMediaData(type, tmdbId);

    return res.status(200).json({
      source: "TMDB",
      preview_only: true,
      saved: false,
      media: formatMediaDetails(data, type),
    });
  } catch (error) {
    return handleTmdbError(error, res);
  }
});

// Read-only Matching

router.get("/match", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (!isTmdbReadEnabled()) {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  const { type, id } = req.query;

  if (!validateMediaType(type)) {
    return res.status(400).json({
      message: "Invalid media type.",
    });
  }

  const tmdbId = getTmdbId(id);

  if (tmdbId === null) {
    return res.status(400).json({
      message: "Invalid TMDB ID.",
    });
  }

  let media;
  let titleVariants;

  // Load TMDB Data

  try {
    const data = await getTmdbMediaData(type, tmdbId, true);

    media = formatMediaDetails(data, type);

    titleVariants = getTitleVariants(data, type);
  } catch (error) {
    return handleTmdbError(error, res);
  }

  // Load Local Catalog

  let existingMedia;

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          category,
          release_year,
          tmdb_id

        FROM public.media_catalog

        WHERE category = $1

        ORDER BY id

        LIMIT $2;
      `,

      [type, MAX_CATALOG_ROWS + 1],
    );

    if (result.rows.length > MAX_CATALOG_ROWS) {
      return res.status(409).json({
        message: "Catalog is too large for the current matching method.",
      });
    }

    existingMedia = result.rows;
  } catch (error) {
    console.error("TMDB matching database error:", error);

    return res.status(500).json({
      message: "Unable to check the local media catalog.",
    });
  }

  // Classify Matches

  const candidates = [];

  for (const item of existingMedia) {
    const linkedToRequested = item.tmdb_id === tmdbId;

    const variant = titleVariants.get(normalizeTitle(item.title));

    if (!linkedToRequested && !variant) {
      continue;
    }

    const sameYear =
      item.release_year !== null &&
      media.release_year !== null &&
      item.release_year === media.release_year;

    let matchReason;

    if (linkedToRequested) {
      matchReason = "tmdb_id";
    } else if (item.tmdb_id !== null) {
      matchReason = "linked_to_other_tmdb";
    } else if (sameYear) {
      matchReason =
        variant.source === "primary"
          ? "title_and_year"
          : "alternative_title_and_year";
    } else {
      matchReason =
        variant.source === "primary" ? "title_only" : "alternative_title_only";
    }

    candidates.push({
      media_id: item.id,
      title: item.title,
      category: item.category,
      release_year: item.release_year,
      tmdb_id: item.tmdb_id,
      matching_title: variant?.title ?? null,
      match_reason: matchReason,
    });
  }

  // Determine Match Status

  const matchStatus = candidates.some((item) => item.match_reason === "tmdb_id")
    ? "already_linked"
    : candidates.some((item) => item.match_reason === "linked_to_other_tmdb")
      ? "conflict_linked_other"
      : candidates.some((item) =>
            ["title_and_year", "alternative_title_and_year"].includes(
              item.match_reason,
            ),
          )
        ? "review_existing"
        : candidates.length > 0
          ? "review_title_collision"
          : "new_candidate";

  // Response

  return res.status(200).json({
    source: "TMDB + MyList",

    preview_only: true,
    saved: false,

    match_status: matchStatus,

    matching_method: "TMDB ID, primary, original and alternative titles",

    title_variants_checked: titleVariants.size,

    requires_manual_review: true,

    media: {
      tmdb_id: media.tmdb_id,
      title: media.title,
      category: media.category,
      release_year: media.release_year,
    },

    candidates,
  });
});

// Watch Providers

router.get("/watch-providers", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (!isTmdbReadEnabled()) {
    return res.status(404).json({ message: "Not found." });
  }

  const { type, id, region = "NO" } = req.query;

  if (!validateMediaType(type)) {
    return res.status(400).json({ message: "Invalid media type." });
  }

  const tmdbId = getTmdbId(id);
  if (tmdbId === null) {
    return res.status(400).json({ message: "Invalid TMDB ID." });
  }

  if (typeof region !== "string" || !["NO", "UA"].includes(region)) {
    return res.status(400).json({ message: "Unsupported region." });
  }

  try {
    const endpoint = type === "movie" ? "movie" : "tv";
    const data = await requestTmdb(`/${endpoint}/${tmdbId}/watch/providers`);

    if (
      data?.id !== tmdbId ||
      !data.results ||
      typeof data.results !== "object"
    ) {
      throw new Error("Invalid TMDB watch providers response.");
    }

    const providers = data.results[region] ?? {};
    const categories = ["flatrate", "free", "ads", "rent", "buy"];
    const available = {};

    for (const category of categories) {
      const list = Array.isArray(providers[category])
        ? providers[category]
        : [];
      available[category] = list
        .filter(
          (provider) =>
            Number.isInteger(provider.provider_id) &&
            typeof provider.provider_name === "string" &&
            provider.provider_name.trim().length > 0,
        )
        .map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
        }));
    }

    // TMDB returns a landing page, not a direct provider playback link.
    let watchUrl = null;
    if (typeof providers.link === "string") {
      try {
        const candidate = new URL(providers.link);
        if (
          candidate.protocol === "https:" &&
          ["www.themoviedb.org", "themoviedb.org"].includes(candidate.hostname)
        ) {
          watchUrl = candidate.href;
        }
      } catch {
        // Ignore an invalid URL supplied by the external API.
      }
    }

    return res.json({
      source: "TMDB",
      availability_source: "JustWatch",
      region,
      type,
      tmdb_id: tmdbId,
      providers: available,
      watch_url: watchUrl,
    });
  } catch (error) {
    return handleTmdbError(error, res);
  }
});

module.exports = router;
