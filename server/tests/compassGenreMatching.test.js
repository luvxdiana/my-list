// Compass Genre Matching Tests

const assert = require("node:assert/strict");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

const testMedia = {
  id: 999,
  title: "Test Media",
  category: "series",
  release_year: 2022,
  duration_minutes: 80,
  genres: [],
  emotions: ["joy"],
};

// Test Helpers

function getRecommendations(genres, preferredGenres, emotions = ["joy"]) {
  return recommendMedia({
    catalog: [
      {
        ...testMedia,
        genres,
        emotions,
      },
    ],
    currentMood: "happy",
    desiredEmotion: "joy",
    availableTime: 90,
    contentType: "series",
    preferredGenres,
  });
}

function checkScore(name, genres, preferredGenres, expected) {
  const results = getRecommendations(genres, preferredGenres);

  assert.equal(results.length, 1);
  assert.equal(results[0].score, expected);

  console.log(`PASS: ${name}`);
}

// Algorithm Version

assert.equal(ALGORITHM_VERSION, "compass-heuristic-v1.2");

console.log("PASS: Algorithm version");

// Exact Genre Matching

checkScore(
  "Exact Science Fiction",
  ["Science Fiction"],
  ["Science Fiction"],
  1,
);

checkScore("Exact Fantasy", ["Fantasy"], ["Fantasy"], 1);

checkScore(
  "Exact Combined Genre",
  ["Sci-Fi & Fantasy"],
  ["Sci-Fi & Fantasy"],
  1,
);

// Partial Genre Matching

checkScore(
  "Science Fiction to Combined",
  ["Sci-Fi & Fantasy"],
  ["Science Fiction"],
  0.9,
);

checkScore("Fantasy to Combined", ["Sci-Fi & Fantasy"], ["Fantasy"], 0.9);

checkScore(
  "Combined to Science Fiction",
  ["Science Fiction"],
  ["Sci-Fi & Fantasy"],
  0.9,
);

checkScore("Combined to Fantasy", ["Fantasy"], ["Sci-Fi & Fantasy"], 0.9);

// Unrelated Genres

checkScore("Unrelated Genres", ["Comedy"], ["Science Fiction"], 0.8);

// No Genre Preferences

checkScore("No Genre Preferences", ["Sci-Fi & Fantasy"], [], 0.8);

// Missing Emotional Assessments

const withoutEmotions = getRecommendations(
  ["Sci-Fi & Fantasy"],
  ["Science Fiction"],
  [],
);

assert.deepEqual(withoutEmotions, []);

console.log("PASS: Missing emotional assessments");

// Final Result

console.log("\nAll Compass genre matching tests passed.");
