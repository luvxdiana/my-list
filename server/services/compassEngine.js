// Compass Engine

const ALGORITHM_VERSION = "compass-hybrid-v1.3";
const BASELINE_ALGORITHM_VERSION = "compass-heuristic-v1.2";

const MOOD_SUPPORT = {
  happy: ["joy", "inspiration", "energy"],
  sad: ["comfort", "joy", "inspiration"],
  anxious: ["comfort", "calm"],
  calm: ["calm", "inspiration"],
  tired: ["comfort", "calm", "energy"],
  excited: ["thrill", "energy"],
};

const VALID_EMOTIONS = new Set([
  "joy",
  "comfort",
  "calm",
  "inspiration",
  "thrill",
  "energy",
]);

const TIME_LIMITS = {
  30: 30,
  60: 60,
  90: 90,
  120: 120,
  "180plus": Infinity,
};

const VALID_CONTENT_TYPES = new Set(["movie", "series", "either"]);

// Genre Matching

const COMBINED_GENRE = "sci-fi & fantasy";
const RELATED_GENRES = new Set(["science fiction", "fantasy"]);
const RELATED_GENRE_STRENGTH = 0.5;

function normalizeGenres(values) {
  return new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value).trim().toLowerCase())
      .filter(Boolean),
  );
}

function getGenreMatchStrength(preferredGenre, mediaGenres) {
  if (mediaGenres.has(preferredGenre)) {
    return 1;
  }

  if (preferredGenre === COMBINED_GENRE) {
    const relatedMatch = [...RELATED_GENRES].some((genre) =>
      mediaGenres.has(genre),
    );

    return relatedMatch ? RELATED_GENRE_STRENGTH : 0;
  }

  if (RELATED_GENRES.has(preferredGenre) && mediaGenres.has(COMBINED_GENRE)) {
    return RELATED_GENRE_STRENGTH;
  }

  return 0;
}

// Baseline Scoring

function scoreCandidates({
  catalog,
  currentMood,
  desiredEmotion,
  availableTime,
  contentType,
  preferredGenres = [],
}) {
  if (!Array.isArray(catalog)) {
    throw new TypeError("Catalog must be an array.");
  }

  if (!Object.hasOwn(MOOD_SUPPORT, currentMood)) {
    throw new Error("Invalid current mood.");
  }

  if (!VALID_EMOTIONS.has(desiredEmotion)) {
    throw new Error("Invalid desired emotion.");
  }

  if (!Object.hasOwn(TIME_LIMITS, String(availableTime))) {
    throw new Error("Invalid available time.");
  }

  if (!VALID_CONTENT_TYPES.has(contentType)) {
    throw new Error("Invalid content type.");
  }

  if (!Array.isArray(preferredGenres)) {
    throw new TypeError("Preferred genres must be an array.");
  }

  const timeLimit = TIME_LIMITS[String(availableTime)];
  const userGenres = normalizeGenres(preferredGenres);

  // Content Filtering

  const filteredCatalog = catalog.filter((media) => {
    if (contentType !== "either" && media.category !== contentType) {
      return false;
    }

    const duration = Number(media.duration_minutes);

    if (!Number.isFinite(duration) || duration <= 0 || duration > timeLimit) {
      return false;
    }

    if (
      !Array.isArray(media.emotions) ||
      !media.emotions.includes(desiredEmotion)
    ) {
      return false;
    }

    return true;
  });

  // Recommendation Scoring

  return filteredCatalog.map((media) => {
    const emotions = new Set(media.emotions);
    const genres = normalizeGenres(media.genres);
    const reasons = ["Matches your desired emotion"];

    let score = 0.65;

    const moodMatch = MOOD_SUPPORT[currentMood].some((emotion) =>
      emotions.has(emotion),
    );

    if (moodMatch) {
      score += 0.15;
      reasons.push("Considers your current mood");
    }

    const genreStrengths = [...userGenres].map((genre) =>
      getGenreMatchStrength(genre, genres),
    );

    const totalGenreStrength = genreStrengths.reduce(
      (total, strength) => total + strength,
      0,
    );

    if (userGenres.size > 0) {
      score += 0.2 * (totalGenreStrength / userGenres.size);
    }

    if (totalGenreStrength > 0) {
      const exactMatch = genreStrengths.some((strength) => strength === 1);

      reasons.push(
        exactMatch
          ? "Matches your favorite genres"
          : "Related to your favorite genres",
      );
    }

    return {
      id: media.id,
      tmdb_id: media.tmdb_id ?? null,
      title: media.title,
      category: media.category,
      release_year: media.release_year,
      duration_minutes: media.duration_minutes,
      genres: [...genres],
      emotions: [...emotions],
      score: Number(score.toFixed(5)),
      reasons,
    };
  });
}

// Adaptive Feedback

const MAX_ADAPTIVE_ADJUSTMENT = 0.2;
const FEEDBACK_SMOOTHING = 2;

function genreSimilarity(candidateGenres, ratedGenres) {
  const candidate = normalizeGenres(candidateGenres);
  const rated = normalizeGenres(ratedGenres);

  if (candidate.size === 0 || rated.size === 0) {
    return 0;
  }

  const rawMatchedStrength = [...rated].reduce(
    (total, genre) => total + getGenreMatchStrength(genre, candidate),
    0,
  );

  const matchedStrength = Math.min(
    candidate.size,
    rated.size,
    rawMatchedStrength,
  );

  return matchedStrength / (rated.size + candidate.size - matchedStrength);
}

function getAdaptiveAdjustment(
  media,
  historicalFeedback,
  currentMood,
  desiredEmotion,
) {
  let weightedFit = 0;
  let totalWeight = 0;
  let evidenceCount = 0;

  for (const feedback of historicalFeedback) {
    if (!feedback || feedback.desired_emotion !== desiredEmotion) {
      continue;
    }

    const rating = Number(feedback.emotional_fit_rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      continue;
    }

    const similarity = genreSimilarity(media.genres, feedback.genres);

    if (similarity <= 0) {
      continue;
    }

    const moodWeight = feedback.current_mood === currentMood ? 1 : 0.5;
    const weight = similarity * moodWeight;
    const fitSignal = (rating - 3) / 2;

    weightedFit += weight * fitSignal;
    totalWeight += weight;
    evidenceCount += 1;
  }

  const adjustment =
    totalWeight > 0
      ? (MAX_ADAPTIVE_ADJUSTMENT * weightedFit) /
        (FEEDBACK_SMOOTHING + totalWeight)
      : 0;

  return { adjustment, evidenceCount };
}

// Ranking

function rankCandidates(candidates, version) {
  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.title.localeCompare(b.title);
  });

  return candidates.slice(0, 3).map((media, index) => ({
    ...media,
    position: index + 1,
    algorithm_version: version,
  }));
}

function recommendMediaBaseline(options) {
  return rankCandidates(scoreCandidates(options), BASELINE_ALGORITHM_VERSION);
}

function recommendMedia(options) {
  const candidates = scoreCandidates(options);
  const historicalFeedback = options.historicalFeedback ?? [];

  if (!Array.isArray(historicalFeedback)) {
    throw new TypeError("Historical feedback must be an array.");
  }

  const personalized = candidates.map((media) => {
    const { adjustment, evidenceCount } = getAdaptiveAdjustment(
      media,
      historicalFeedback,
      options.currentMood,
      options.desiredEmotion,
    );

    const score = Number(
      Math.max(0, Math.min(1, media.score + adjustment)).toFixed(5),
    );
    const actualAdjustment = Number((score - media.score).toFixed(5));

    return {
      ...media,
      score,
      base_score: media.score,
      personalization_adjustment: actualAdjustment,
      feedback_evidence_count: evidenceCount,
      reasons:
        actualAdjustment !== 0
          ? [
              ...media.reasons,
              "Adjusted using your past emotional-fit feedback",
            ]
          : media.reasons,
    };
  });

  return rankCandidates(personalized, ALGORITHM_VERSION);
}

module.exports = {
  recommendMedia,
  recommendMediaBaseline,
  ALGORITHM_VERSION,
  BASELINE_ALGORITHM_VERSION,
};
