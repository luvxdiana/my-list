// Compass Engine

const ALGORITHM_VERSION = "compass-heuristic-v1.2";

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

// Recommendations

function recommendMedia({
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

  const userGenres = new Set(
    preferredGenres.map((genre) => String(genre).trim().toLowerCase()),
  );

  // Content Filtering

  const filteredCatalog = catalog.filter((media) => {
    if (contentType !== "either" && media.category !== contentType) {
      return false;
    }

    const duration = Number(media.duration_minutes);

    if (!Number.isFinite(duration) || duration <= 0) {
      return false;
    }

    if (duration > timeLimit) {
      return false;
    }

    // Desired Emotion Filter

    if (
      !Array.isArray(media.emotions) ||
      !media.emotions.includes(desiredEmotion)
    ) {
      return false;
    }

    return true;
  });

  // Recommendation Scoring

  const scoredCatalog = filteredCatalog.map((media) => {
    const emotions = new Set(media.emotions);

    const genres = new Set(
      (media.genres || []).map((genre) => String(genre).trim().toLowerCase()),
    );

    const reasons = [];

    let score = 0;

    // Desired Emotion

    score += 0.65;
    reasons.push("Matches your desired emotion");

    // Current Mood

    const supportingEmotions = MOOD_SUPPORT[currentMood];

    const moodMatch = supportingEmotions.some((emotion) =>
      emotions.has(emotion),
    );

    if (moodMatch) {
      score += 0.15;
      reasons.push("Considers your current mood");
    }

    // Preferred Genres

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
      const hasExactMatch = genreStrengths.some((strength) => strength === 1);

      reasons.push(
        hasExactMatch
          ? "Matches your favorite genres"
          : "Related to your favorite genres",
      );
    }

    return {
      id: media.id,
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

  // Ranking

  scoredCatalog.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.title.localeCompare(b.title);
  });

  // Top 3

  return scoredCatalog.slice(0, 3).map((media, index) => ({
    ...media,
    position: index + 1,
    algorithm_version: ALGORITHM_VERSION,
  }));
}

module.exports = {
  recommendMedia,
  ALGORITHM_VERSION,
};
