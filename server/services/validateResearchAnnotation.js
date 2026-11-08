// Research Annotation Validation

const EMOTION_CODES = [
  "joy",
  "comfort",
  "calm",
  "inspiration",
  "thrill",
  "energy",
];

const VALID_EMOTIONS = new Set(EMOTION_CODES);

const VALID_SOURCES = new Set(["watched", "synopsis", "trailer"]);

const MAX_MEDIA_ID = 9223372036854775807n;

// Validation

function validateResearchAnnotation(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ["Invalid annotation payload."],
    };
  }

  // Media ID

  const mediaId = String(payload.media_id ?? "").trim();

  if (!/^[1-9]\d*$/.test(mediaId) || BigInt(mediaId || "0") > MAX_MEDIA_ID) {
    errors.push("Invalid media ID.");
  }

  // Evidence Source

  if (!VALID_SOURCES.has(payload.evidence_source)) {
    errors.push("Invalid evidence source.");
  }

  // Annotation Note

  const note = payload.annotation_note ?? "";

  if (typeof note !== "string" || note.length > 2000) {
    errors.push("Annotation note must contain no more than 2000 characters.");
  }

  // Ratings

  const ratings = payload.ratings;

  if (!Array.isArray(ratings) || ratings.length !== EMOTION_CODES.length) {
    errors.push("Exactly six emotional ratings are required.");
  } else {
    const seen = new Set();

    for (const rating of ratings) {
      if (!rating || typeof rating !== "object" || Array.isArray(rating)) {
        errors.push("Invalid rating entry.");
        continue;
      }

      const code = rating.emotion_code;

      if (!VALID_EMOTIONS.has(code)) {
        errors.push("Unknown emotional category.");
        continue;
      }

      if (seen.has(code)) {
        errors.push(`Duplicate emotional category: ${code}.`);
      }

      seen.add(code);

      if (
        !Number.isInteger(rating.intensity) ||
        rating.intensity < 0 ||
        rating.intensity > 3
      ) {
        errors.push(`Invalid intensity for ${code}.`);
      }

      if (
        !Number.isInteger(rating.confidence) ||
        rating.confidence < 1 ||
        rating.confidence > 3
      ) {
        errors.push(`Invalid confidence for ${code}.`);
      }
    }

    for (const code of EMOTION_CODES) {
      if (!seen.has(code)) {
        errors.push(`Missing emotional category: ${code}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Local Tests

if (require.main === module) {
  const validPayload = {
    media_id: "15",
    evidence_source: "watched",
    annotation_note: "Test annotation",
    ratings: EMOTION_CODES.map((code) => ({
      emotion_code: code,
      intensity: 2,
      confidence: 2,
    })),
  };

  const invalidPayload = {
    ...validPayload,
    ratings: [
      {
        emotion_code: "joy",
        intensity: 15,
        confidence: 8,
      },
    ],
  };

  const validResult = validateResearchAnnotation(validPayload);

  const invalidResult = validateResearchAnnotation(invalidPayload);

  console.log("\nMyList Compass Validation Tests\n");

  console.table([
    {
      test: "Valid annotation",
      expected: true,
      actual: validResult.valid,
    },
    {
      test: "Invalid annotation",
      expected: false,
      actual: invalidResult.valid,
    },
  ]);

  if (validResult.valid !== true || invalidResult.valid !== false) {
    process.exitCode = 1;
  }
}

module.exports = {
  validateResearchAnnotation,
  EMOTION_CODES,
};
