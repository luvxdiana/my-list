// Compass Version Comparison Tests

const assert = require("node:assert/strict");

const {
  recommendMedia,
  ALGORITHM_VERSION,
} = require("../services/compassEngine");

// Test Catalog

const catalog = [
  {
    id: 2,
    title: "Dark",
    category: "series",
    release_year: 2017,
    duration_minutes: 55,
    genres: ["Science Fiction", "Drama", "Mystery"],
    emotions: ["joy"],
  },
  {
    id: 50,
    title: "Severance",
    category: "series",
    release_year: 2022,
    duration_minutes: 80,
    genres: ["Sci-Fi & Fantasy", "Drama", "Mystery"],
    emotions: ["joy"],
  },
  {
    id: 999,
    title: "A Comedy Test",
    category: "series",
    release_year: 2022,
    duration_minutes: 30,
    genres: ["Comedy"],
    emotions: ["joy"],
  },
  {
    id: 998,
    title: "Unlabeled Test",
    category: "series",
    release_year: 2022,
    duration_minutes: 30,
    genres: ["Science Fiction"],
    emotions: [],
  },
];

// Test Helpers

function getRecommendations(preferredGenres) {
  return recommendMedia({
    catalog,
    currentMood: "happy",
    desiredEmotion: "joy",
    availableTime: 90,
    contentType: "series",
    preferredGenres,
  });
}

function summarize(recommendations) {
  return recommendations.map(({ title, score }) => ({
    title,
    score,
  }));
}

function expectedRows(rows) {
  return rows.map(([title, score]) => ({
    title,
    score,
  }));
}

// Algorithm Version

assert.equal(ALGORITHM_VERSION, "compass-heuristic-v1.2");

console.log("PASS: Algorithm version");

// Historical v1.1 Baselines

const unchangedScenarios = [
  {
    name: "No genre preferences",
    genres: [],
    expected: [
      ["A Comedy Test", 0.8],
      ["Dark", 0.8],
      ["Severance", 0.8],
    ],
  },
  {
    name: "Comedy preference",
    genres: ["Comedy"],
    expected: [
      ["A Comedy Test", 1],
      ["Dark", 0.8],
      ["Severance", 0.8],
    ],
  },
  {
    name: "Drama preference",
    genres: ["Drama"],
    expected: [
      ["Dark", 1],
      ["Severance", 1],
      ["A Comedy Test", 0.8],
    ],
  },
  {
    name: "Mystery preference",
    genres: ["Mystery"],
    expected: [
      ["Dark", 1],
      ["Severance", 1],
      ["A Comedy Test", 0.8],
    ],
  },
  {
    name: "Horror preference",
    genres: ["Horror"],
    expected: [
      ["A Comedy Test", 0.8],
      ["Dark", 0.8],
      ["Severance", 0.8],
    ],
  },
];

// Unchanged Scenarios

for (const scenario of unchangedScenarios) {
  const actual = summarize(getRecommendations(scenario.genres));

  assert.deepEqual(actual, expectedRows(scenario.expected));

  console.log(`PASS: Unchanged - ${scenario.name}`);
}

// Related Genre Scenarios

const relatedScenarios = [
  {
    name: "Science Fiction to Combined",
    genres: ["Science Fiction"],
    target: "Severance",
    previousScore: 0.8,
    currentScore: 0.9,
  },
  {
    name: "Fantasy to Combined",
    genres: ["Fantasy"],
    target: "Severance",
    previousScore: 0.8,
    currentScore: 0.9,
  },
  {
    name: "Combined to Science Fiction",
    genres: ["Sci-Fi & Fantasy"],
    target: "Dark",
    previousScore: 0.8,
    currentScore: 0.9,
  },
];

for (const scenario of relatedScenarios) {
  const results = getRecommendations(scenario.genres);

  const target = results.find((media) => media.title === scenario.target);

  assert.ok(target);

  assert.equal(target.score, scenario.currentScore);

  assert.ok(target.score > scenario.previousScore);

  assert.ok(target.reasons.includes("Related to your favorite genres"));

  console.log(`PASS: Improved - ${scenario.name}`);
}

// Historical Ranking

const previousRanking = expectedRows([
  ["Dark", 1],
  ["A Comedy Test", 0.8],
  ["Severance", 0.8],
]);

// Current Ranking

const currentRanking = getRecommendations(["Science Fiction"]);

assert.deepEqual(
  summarize(currentRanking),
  expectedRows([
    ["Dark", 1],
    ["Severance", 0.9],
    ["A Comedy Test", 0.8],
  ]),
);

assert.notDeepEqual(summarize(currentRanking), previousRanking);

console.log("PASS: Expected ranking change");

// Emotional Data Protection

assert.ok(!currentRanking.some((media) => media.title === "Unlabeled Test"));

console.log("PASS: Unlabeled media excluded");

// Comparison Results

console.log("\nCompass Engine v1.1 baseline:");

console.table(previousRanking);

console.log("\nCompass Engine v1.2:");

console.table(summarize(currentRanking));

console.log("\nAll Compass version comparison tests passed.");
