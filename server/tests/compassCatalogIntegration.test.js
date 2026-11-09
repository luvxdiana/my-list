// Compass Catalog Integration Tests

const assert = require("node:assert/strict");
const path = require("node:path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const pool = require("../db");

const { loadCompassCatalog } = require("../services/compassCatalog");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

// Test Configuration

const EMOTIONS = ["joy", "comfort", "calm", "inspiration", "thrill", "energy"];

const CONTENT_TYPES = ["either", "movie", "series"];

const TIME_LIMITS = [30, 60, 90, 120, "180plus"];

// Expected Emotional Distribution

const EXPECTED_EMOTIONS = {
  joy: 6,
  comfort: 7,
  calm: 1,
  inspiration: 9,
  thrill: 6,
  energy: 6,
};

// Expected Availability

const EXPECTED_AVAILABILITY = {
  joy: {
    either: [2, 2, 4, 6, 6],
    movie: [0, 0, 2, 4, 4],
    series: [2, 2, 2, 2, 2],
  },

  comfort: {
    either: [2, 2, 4, 7, 7],
    movie: [0, 0, 2, 5, 5],
    series: [2, 2, 2, 2, 2],
  },

  calm: {
    either: [1, 1, 1, 1, 1],
    movie: [0, 0, 0, 0, 0],
    series: [1, 1, 1, 1, 1],
  },

  inspiration: {
    either: [2, 2, 3, 5, 9],
    movie: [0, 0, 1, 3, 7],
    series: [2, 2, 2, 2, 2],
  },

  thrill: {
    either: [0, 1, 2, 3, 6],
    movie: [0, 0, 1, 2, 5],
    series: [0, 1, 1, 1, 1],
  },

  energy: {
    either: [1, 1, 3, 5, 6],
    movie: [0, 0, 2, 4, 5],
    series: [1, 1, 1, 1, 1],
  },
};

// Integration Tests

async function runTests() {
  const catalog = await loadCompassCatalog();

  // Catalog Structure

  assert.equal(catalog.length, 50);

  assert.equal(new Set(catalog.map((media) => media.id)).size, 50);

  console.log("PASS: 50 unique media loaded");

  // Data Validation

  for (const media of catalog) {
    assert.ok(Array.isArray(media.genres));
    assert.ok(Array.isArray(media.emotions));

    assert.ok(["movie", "series"].includes(media.category));

    assert.ok(Number(media.duration_minutes) > 0);

    for (const emotion of media.emotions) {
      assert.ok(EMOTIONS.includes(emotion));
    }
  }

  console.log("PASS: Catalog structure validated");

  // Emotional Coverage

  const mediaWithEmotions = catalog.filter(
    (media) => media.emotions.length > 0,
  );

  const mediaWithoutEmotions = catalog.filter(
    (media) => media.emotions.length === 0,
  );

  const totalEmotionTags = catalog.reduce(
    (total, media) => total + media.emotions.length,
    0,
  );

  assert.equal(mediaWithEmotions.length, 16);
  assert.equal(mediaWithoutEmotions.length, 34);
  assert.equal(totalEmotionTags, 35);

  console.log("PASS: Emotional coverage verified");

  // Emotion Distribution

  for (const emotion of EMOTIONS) {
    const count = catalog.filter((media) =>
      media.emotions.includes(emotion),
    ).length;

    assert.equal(count, EXPECTED_EMOTIONS[emotion]);
  }

  console.log("PASS: Emotion distribution verified");

  // Recommendation Availability

  let scenariosChecked = 0;
  let fullTop3Scenarios = 0;

  for (const emotion of EMOTIONS) {
    for (const contentType of CONTENT_TYPES) {
      for (let index = 0; index < TIME_LIMITS.length; index++) {
        const availableTime = TIME_LIMITS[index];

        const expectedCount =
          EXPECTED_AVAILABILITY[emotion][contentType][index];

        const timeLimit =
          availableTime === "180plus" ? Infinity : Number(availableTime);

        // Catalog Candidates

        const candidates = catalog.filter((media) => {
          const correctType =
            contentType === "either" || media.category === contentType;

          const correctTime =
            Number(media.duration_minutes) > 0 &&
            Number(media.duration_minutes) <= timeLimit;

          const correctEmotion = media.emotions.includes(emotion);

          return correctType && correctTime && correctEmotion;
        });

        assert.equal(
          candidates.length,
          expectedCount,
          `Candidate mismatch: ${emotion}, ${contentType}, ${availableTime}`,
        );

        // Compass Recommendations

        const recommendations = recommendMedia({
          catalog,
          currentMood: "happy",
          desiredEmotion: emotion,
          availableTime,
          contentType,
          preferredGenres: [],
        });

        assert.equal(
          recommendations.length,
          Math.min(3, expectedCount),
          `Recommendation mismatch: ${emotion}, ${contentType}, ${availableTime}`,
        );

        // Recommendation Validation

        const candidateIds = new Set(candidates.map((media) => media.id));

        for (const recommendation of recommendations) {
          assert.ok(candidateIds.has(recommendation.id));

          assert.equal(recommendation.algorithm_version, ALGORITHM_VERSION);
        }

        scenariosChecked++;

        if (recommendations.length === 3) {
          fullTop3Scenarios++;
        }
      }
    }
  }

  assert.equal(scenariosChecked, 90);
  assert.equal(fullTop3Scenarios, 23);

  console.log("PASS: 90 recommendation scenarios");
  console.log("PASS: 23 complete Top 3 scenarios");

  // Final Results

  console.log("\nCompass Integration Test Results");

  console.table({
    total_media: catalog.length,
    media_with_emotions: mediaWithEmotions.length,
    media_without_emotions: mediaWithoutEmotions.length,
    total_emotion_tags: totalEmotionTags,
    scenarios_checked: scenariosChecked,
    full_top3_scenarios: fullTop3Scenarios,
    algorithm_version: ALGORITHM_VERSION,
  });

  console.log("\nAll Compass integration tests passed.");
}

// Test Execution

async function main() {
  try {
    await runTests();
  } catch (error) {
    console.error("\nIntegration test failed:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
